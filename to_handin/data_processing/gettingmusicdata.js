var randomArtistsPromises = []
var albumToPopularityDict = {}

var tracksIds = []
var albumList = []

var tracksPromises = []
var tracksWithPopularity = []
var artistToAlbumDict = {}

var albumToTracksDict = {}
var options = {
  url: 'https://api.spotify.com/v1/me/playlists',
  headers: { 'Authorization': 'Bearer ' + access_token },
  json: true
};
var albumToTracksPromises = []
var albumToTracksWithPopularity = {}
var properties = Object.keys(albumToTracksDict);
count2 = 0
var callForTrackNumber = function(albumidx) {
  albumID = properties[count2]
  tracklistWithPop = albumToTracksDict[albumID]
  var url = "https://api.spotify.com/v1/tracks/?ids="
  for (i = 0; i < tracklistWithPop.length; i++) {
    url += tracklistWithPop[i] +",";
  }

  url = url.substring(0, url.length - 1);
  options['url'] = url
  albumToTracksPromise = get(options);
  albumToTracksPromises.push(albumToTracksPromise.then(function(result) {
    count2 += 1
    alltracks = result.tracks;
    albumTracksWithPopularity = []
    for (var i = 0; i < alltracks.length; i++) {
      track = {id: alltracks[i].name, track_number: alltracks[i].track_number, popularity: alltracks[i].popularity};
      albumTracksWithPopularity.push(track);
    }

    albumToTracksWithPopularity[albumID] = albumTracksWithPopularity
  }));
  Promise.all(albumToTracksPromises).then(function() {
    if (albumidx + 1 < 977) {
      console.log(Object.keys(albumToTracksWithPopularity).length)
      setTimeout(function(){callForTrackNumber(albumidx + 1); }, 200)
    }
    if (Object.keys(albumToTracksWithPopularity).length == 977) {
      console.log(albumToTracksWithPopularity);
    }
  });
};
count = 0
var albumToTracksWithPopularity = {}
trackPromises = []
albumPromises = []

count1 = 0
artistToAlbumDict = {}
var callForAlbums = function(artistidx) {
  artistID = randomArtistsList[artistidx]
  getArtistsAlbum(artistID);
  if (artistidx + 1 < randomArtistsList.length) {
    console.log(count1);
    count1 += 1
    setTimeout(function() { callForAlbums(artistidx+1);}, 150)
  }
  console.log(artistToAlbumDict);
}
var options = {
  url: "https://api.spotify.com/v1/search?q=year%3A2000-2016&type=artist&market=US",
  headers: { 'Authorization': 'Bearer ' + access_token },
  json: true
};
var randomArtistsList =  []
var artistToPopularityDict = {}
callForAlbums(0);
count = 1
var callForAlbumTracks = function(albumidx) {
  albumID = albumList[albumidx];
  getAlbumTracksList(albumID);
  if (albumidx + 1 < albumList.length) {
    count += 1
    setTimeout(function(){ callForAlbumTracks(albumidx+1); }, 300)
  }
  if (Object.keys(albumToTracksDict).length == 977) {
    console.log(albumToTracksDict);
  }        
}

function getRandomArtistsAlbums(options) {
  if (randomArtistsList.length >= 1000) {
      console.log("got all artists");
      console.log(randomArtistsList);
      console.log(artistToPopularityDict)
  }
  else {
    var randomArtistsPromise = get(options);
    randomArtistsPromises.push(randomArtistsPromise.then(function (result) {
      var artists = result.artists.items;
      for (index in artists) {
        randomArtistsList.push(artists[index].id);
        artistToPopularityDict[artists[index].id] = artists[index].popularity
      }
      if (result.artists.next) {
        options['url'] = result.artists.next;
        getRandomArtistsAlbums(options);
      }
    }));
  }
}

function getArtistsAlbum(artistid) {
  options['url'] = "https://api.spotify.com/v1/artists/"+artistid+"/albums";

  var albumPromise = get(options);
  albumPromises.push(albumPromise.then(function (result){
    mostRecentAlbumId = result.items[0].id
    albumList.push(mostRecentAlbumId)
    artistToAlbumDict[artistid] = mostRecentAlbumId
  }));
  
}

function getAlbumTracksList(albumid) {
  options['url'] = "https://api.spotify.com/v1/albums/"+albumid+"/tracks";
  var trackPromise = get(options);
  trackPromises = []
  trackPromises.push(trackPromise.then(function (result){
    
    tracks = result.items;
    albumTracksList = []
    for (index in tracks) {
      trackid = tracks[index].id;
      albumTracksList.push(trackid);
    }
    albumToTracksDict[albumid] = albumTracksList
  }));
  Promise.all(trackPromises).then(function() {
  })
}
function getSeveralTracks(tracksIds) {
  console.log("tracksIds length: " + tracksIds.length)
  times = tracksIds.length / 50
  console.log("times: " + times)
  for (var i = 0; i < times - 1; i++) {
    console.log("i: " + i)
    var url = "https://api.spotify.com/v1/tracks/?ids="
    for (j = i * 50; j < i * 50 + 50; j++) {
        url += tracksIds[j] +",";
    }
      
    url = url.substring(0, url.length - 1);
    console.log("url: " + url)
    options['url'] = url
    sleep(1000);
    tracksPromise = get(options);
    count = 0
    tracksPromises.push(tracksPromise.then(function(result) {
      console.log("getting several tracks " + count)
      count += 1
      alltracks = result.tracks;
      for (var i = 0; i < 50; i++) {
        track = {id: alltracks[i].name, track_number: alltracks[i].track_number, popularity: alltracks[i].popularity};
        tracksWithPopularity.push(track);
      }
    }));
  }
}
function getSeveralTracksOfAlbum(albumToTracksDict) {
  albumToTracksPromises = []
  console.log("length: " + Object.keys(albumToTracksDict).length)
  for (var property in albumToTracksDict) {
    if (albumToTracksDict.hasOwnProperty(property)) {
      tracklistWithPop = albumToTracksDict[property]
      var url = "https://api.spotify.com/v1/tracks/?ids="
      for (i = 0; i < tracklistWithPop.length; i++) {
        url += tracklistWithPop[i] +",";
      }
      url = url.substring(0, url.length - 1);
      options['url'] = url
      properties = Object.keys(albumToTracksDict)
      count = 0
      albumToTracksPromise = get(options);
      albumToTracksPromises.push(albumToTracksPromise.then(function(result) {
        theproperty = properties[count]
        count += 1
        alltracks = result.tracks;
        albumTracksWithPopularity = []
        for (var i = 0; i < alltracks.length; i++) {

          track = {id: alltracks[i].name, track_number: alltracks[i].track_number, popularity: alltracks[i].popularity};
          albumTracksWithPopularity.push(track);
        }

        albumToTracksWithPopularity[theproperty] = albumTracksWithPopularity

      }));

    }
  }

}
