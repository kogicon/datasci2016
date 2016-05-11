/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');


var client_id = 'b925b49f463c4a759b1a72289ab69f8c'; // Your client id
var client_secret = '95fc004b1d3e4eddb61c0a752e4ae6da'; // Your client secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

function sleepFor( sleepDuration ){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ } 
}

var rejcount = 0;

/* Get - Makes an ajax get call in javascript, and returns a promise
*   that will resolve when the ajax call returns.
*   @params {object} the dictionary of options to be used in the get call
*   @return {Promise} the ajax Promise
*/
var get = function(options) {  
  return new Promise(function(resolve, reject) {
    var req = request.get(options, function(error, response, body) {


      if (response) {
        if (response.statusCode == 200) {
          resolve(body);
        } else {
          rejcount++;
          console.log("REJECTING" + rejcount);
          //console.log(response);
          resolve({});
          //reject(Error(response.statusText));
        }
      } else {
        console.log(">>>>>>> SUPER REJECTING");
        resolve({});
        //reject(Error("response not found"));
      }


    });
  });
}



var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        /*var options = {
          url: 'https://api.spotify.com/v1/me/playlists',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };*/
        
        var randomArtistsPromises = []
        var albumToPopularityDict = {}
        //getRandomArtistsAlbums(options);
      
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
          //console.log("tracklist: " + tracklistWithPop)
          var url = "https://api.spotify.com/v1/tracks/?ids="
          for (i = 0; i < tracklistWithPop.length; i++) {
            url += tracklistWithPop[i] +",";
          }

          url = url.substring(0, url.length - 1);
          options['url'] = url
          albumToTracksPromise = get(options);
          albumToTracksPromises.push(albumToTracksPromise.then(function(result) {
            count2 += 1
            //console
            //console.log(result)
            alltracks = result.tracks;
            //console.log(alltracks)
            albumTracksWithPopularity = []
          
            //console.log("albumid: " + result)
            for (var i = 0; i < alltracks.length; i++) {
              track = {id: alltracks[i].name, track_number: alltracks[i].track_number, popularity: alltracks[i].popularity};
              albumTracksWithPopularity.push(track);
            }

            albumToTracksWithPopularity[albumID] = albumTracksWithPopularity
            //console.log("length: " + Object.keys(albumTracksWithPopularity).length)
            //console.log(albumToTracksWithPopularity);

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
        //callForTrackNumber(0);


        count = 0
        var albumToTracksWithPopularity = {}
        //getSeveralTracksOfAlbum(albumToTracksDict);   
        /*Promise.all(albumToTracksPromises).then(function() {
          console.log("DONE!!");
          console.log(albumToTracksWithPopularity);
        })*/
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
        //getRandomArtistsAlbums(options);
        callForAlbums(0);
       
        //console.log("got all albums");
        //console.log(albumList);
        count = 1
        var callForAlbumTracks = function(albumidx) {
          albumID = albumList[albumidx];
          getAlbumTracksList(albumID);
          if (albumidx + 1 < albumList.length) {
       
            count += 1
            setTimeout(function(){ callForAlbumTracks(albumidx+1); }, 300)
            //console.log("length: " + Object.keys(albumToTracksDict).length);
          }
          if (Object.keys(albumToTracksDict).length == 977) {
            console.log(albumToTracksDict);
          }
          
        }
        //callForAlbumTracks(0);

        //var callForTrackPopularity = function()

          //sleep(1000);
        /*for (index in albumList) {
          albumid = albumList[index]
          getAlbumTracksList(albumid)
        }
        Promise.all(trackPromises).then(function() {
          console.log("got all track ids")
          //sleep(1000);
        
       
          getSeveralTracksOfAlbum(albumToTracksDict);
          Promise.all(albumToTracksPromises).then(function() {
            console.log("DONE!!");
            console.log(albumToTracksWithPopularity);
          })})*/
        
        }

        function getRandomArtistsAlbums(options) {
          if (randomArtistsList.length >= 1000) {
           // Promise.all(randomArtistsPromises).then(function() {
              //console.log("artist list: " + randomArtistsList);
              console.log("got all artists");
              console.log(randomArtistsList);
              console.log(artistToPopularityDict)
              //callForAlbums(0);
              //console.log(albumList);
              
  
              
            //});
            //return randomArtistsPromise;
          }
          else {
            var randomArtistsPromise = get(options);
            randomArtistsPromises.push(randomArtistsPromise.then(function (result) {
              var artists = result.artists.items;
              //console.log(result.artists.next);
              for (index in artists) {
                //console.log(artists[index].id)
                randomArtistsList.push(artists[index].id);
                //console.log(artists[index].id)
                //console.log(artists[index].popularity)
                artistToPopularityDict[artists[index].id] = artists[index].popularity
              }
              if (result.artists.next) {
                //console.log(results.artists.next);
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
            /*for (index in result.items) {
              console.log(result.items[index].id)
              albumList.push(result.items[index].id)
              artistToAlbumDict[artistid] = result.items[index].id
            }*/
            mostRecentAlbumId = result.items[0].id
            albumList.push(mostRecentAlbumId)
            artistToAlbumDict[artistid] = mostRecentAlbumId
          }));
          
        }

        function getAlbumTracksList(albumid) {
          options['url'] = "https://api.spotify.com/v1/albums/"+albumid+"/tracks";
          //console.log("sleeping");
          var trackPromise = get(options);
          trackPromises = []
          trackPromises.push(trackPromise.then(function (result){
            
            tracks = result.items;
            albumTracksList = []
            for (index in tracks) {
              trackid = tracks[index].id;
              //console.log("trackid: " + trackid);
              //tracksIds.push(trackid);
                //console.log("albumTracksList: " + albumTracksList)
              albumTracksList.push(trackid);
            }
            //console.log("albumTracksList: " + albumTracksList);
            albumToTracksDict[albumid] = albumTracksList
          }));
          Promise.all(trackPromises).then(function() {
            //console.log("finished all tracks");
            /*console.log(albumToTracksDict);
            getSeveralTracksOfAlbum(albumToTracksDict);
            Promise.all(tracksPromises).then(function() {
              console.log(albumToTracksWithPopularity)
              console.log("ALL DONE!")
            })*/
          })
          //console.log(albumToTracksWithPopularity)
          //console.log(Object.keys(albumToTracksWithPopularity).length)
        }
        function getSeveralTracks(tracksIds) {
        
          //console.log("tracksIds: " + tracksIds)
          //tracksPromises = []
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
              //console.log("getting into trackspromise");
              //console.log(result.tracks);
              alltracks = result.tracks;
              for (var i = 0; i < 50; i++) {
                //console.log(alltracks[i].name)
                track = {id: alltracks[i].name, track_number: alltracks[i].track_number, popularity: alltracks[i].popularity};
                //console.log(track);
                tracksWithPopularity.push(track);

              }
              //console.log(track);
              //tracksWithPopularity.push(track);
            }));
          }

          

        }
        function getSeveralTracksOfAlbum(albumToTracksDict) {
          albumToTracksPromises = []
          //console.log(albumToTracksDict);
          console.log("length: " + Object.keys(albumToTracksDict).length)
          for (var property in albumToTracksDict) {
            if (albumToTracksDict.hasOwnProperty(property)) {
              tracklistWithPop = albumToTracksDict[property]
              //console.log("tracklist: " + tracklistWithPop)
              var url = "https://api.spotify.com/v1/tracks/?ids="
              for (i = 0; i < tracklistWithPop.length; i++) {
                //console.log(tracklistWithPop[])
                url += tracklistWithPop[i] +",";
              }
              url = url.substring(0, url.length - 1);
              //sleep(100);
              options['url'] = url
              properties = Object.keys(albumToTracksDict)
              count = 0
              albumToTracksPromise = get(options);
              albumToTracksPromises.push(albumToTracksPromise.then(function(result) {
                theproperty = properties[count]
                count += 1
                //console
                //console.log(result)
                alltracks = result.tracks;
                //console.log(alltracks)
                albumTracksWithPopularity = []
              
                //console.log("albumid: " + result)
                for (var i = 0; i < alltracks.length; i++) {
      
                  track = {id: alltracks[i].name, track_number: alltracks[i].track_number, popularity: alltracks[i].popularity};
                  albumTracksWithPopularity.push(track);
                }

                albumToTracksWithPopularity[theproperty] = albumTracksWithPopularity

              }));

            }
          }

        }
        

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/get_hipster_score', function(req, res) { 

  //console.log("getting basic recs");
  var access_token = req.query.access_token;

  //console.log(access_token);



  allTracksList = {};
  trackScoreList = {};
  trackGenreDict = {};
  trackArtistList = {};
  finalScoreList = {};
  trackArtistCountList = {};
  trackSepCountList = {};

  function getAllArtists(userID) {

    //console.log("Getting all artists!");
    //console.log(trackArtistList);

    var options = {
      url: 'https://api.spotify.com/v1/me/artist',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    var ArtistPromises = [];


    for (var index = 0; index <= trackArtistList[userID].length; index+=50) {
      var ids = "";
      for (var j = 0; j < 50; j++) {
        if (index + j >= trackArtistList[userID].length) {
          break;
        }
        var sp = trackArtistList[userID][index+j].split("/");
        ids += sp[sp.length-1] + ",";
      }
      ids = ids.slice(0,ids.length-1);
      options['url'] = 'https://api.spotify.com/v1/artists?ids='+ids;

      var ArtistPromise = get(options);

      ArtistPromises.push(ArtistPromise.then(function (result) {

        //console.log("got an Artist result!!");
        //console.log(result);

        for (artistidx in result.artists) {
          var artist = result.artists[artistidx];

          trackArtistCountList[userID] += 1;

          for (index in artist.genres) {
            var genre = artist.genres[index];
            //console.log("Genre! "+genre + " from " + artist.name);
            if (!(genre in trackGenreDict[userID])) {
              trackGenreDict[userID][genre] = 0;
            }
            trackGenreDict[userID][genre] += 1;
          }
          if (artist.genres.length == 0) {
            trackSepCountList[userID] += 1;
          }
        }

      }));
    }

    Promise.all(ArtistPromises).then(function(arrayOfResults) {
      //console.log("getting genre count!");
      

      var total = 0;
      for (index in trackScoreList[userID]) {
        total += trackScoreList[userID][index];
      }
      total = 100 - total/trackScoreList[userID].length;

      finalScoreList[userID] = [total, trackGenreDict[userID], trackSepCountList[userID], trackArtistCountList[userID]];

      console.log("finalScoreList");
      console.log("|");
      console.log("|");
      console.log("|");
      console.log(finalScoreList);

      res.send({
        'score': total,
        'genres': Object.keys(trackGenreDict).length
      });

    });

    //console.log("reached end of func");

  }

  function getAllTracks(userID) {

    //console.log("Getting all tracks!");
    //console.log(allTracksList);

    var options = {
      url: 'https://api.spotify.com/v1/me/artist',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    var TrackPromises = [];

    for (index in allTracksList[userID]) {

      //console.log(index);
      var tracks = allTracksList[userID][index];
      options['url'] = tracks.href;

      var TrackPromise = get(options);

      TrackPromises.push(TrackPromise.then(function (result) {

        //console.log("got a tracks result!!");


        var tracks = result.items;
        for (index in tracks) {
          var track = tracks[index].track;
          //console.log(track);
          trackScoreList[userID].push(track.popularity);
          for (index2 in track.artists) {
            var artist = track.artists[index2];
            if (trackArtistList[userID].indexOf(artist.href) < 0) {
              trackArtistList[userID].push(artist.href);
            }
          }
        }
      }));
    }

    Promise.all(TrackPromises).then(function(arrayOfResults) {
      //console.log("getting artists");

      getAllArtists(userID);

    });

    //console.log("reached end of func");

  }


  function getAllPlaylists(options, userID) {    
    var playlistsPromise = get(options);

    playlistsPromise.then(function (result) {
      //console.log("wow");
      //console.log(result);
      var playlists = result.items;
      for (index in playlists) {
        var playlist = playlists[index];
        //console.log(playlist.tracks);
        allTracksList[userID].push(playlist.tracks);
      }
      if (result.next) {
        options['url'] = result.next;
        return getAllPlaylists(options, userID);
      } else {
        //if (allTracksList.length > 1000) {
        //  allTracksList = allTracksList.slice(0,1000);
        //}
        getAllTracks(userID);
      }
    });

    return playlistsPromise;
  }

  userIDs = []
  var callForUser = function (useridx) {
    userID = userIDs[useridx].toLowerCase();

    console.log(userID);
    allTracksList[userID] 
    = [];
    trackScoreList[userID] = [];
    trackGenreDict[userID] = {};
    trackArtistList[userID] = [];
    trackArtistCountList[userID] = 0;
    trackSepCountList[userID] = 0;

    var options = {
      url: 'https://api.spotify.com/v1/users/'+userID+'/playlists',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    var getPlaylistsPromise = getAllPlaylists(options, userID);
    
    if (useridx+1 < userIDs.length) {
      setTimeout(function(){ callForUser(useridx+1); }, 10000);
    }

  }

  callForUser(0);


});


app.get('/get_basic_recommendations', function(req, res) { 

  console.log("getting basic recs");

  var access_token = req.query.access_token;

  console.log(access_token);



  

  var topArtistList = [];
  topArtistList.push({"id":"3P5NW1wQjcWpR0VsT1m0xr"});
  topArtistList.push({"id":"4MXUO7sVCaFgFjoTI5ox5c"});
  topArtistList.push({"id":"4M5nCE77Qaxayuhp3fVn4V"});
  topArtistList.push({"id":"4EVpmkEwrLYEg6jIsiPMIb"});
  

  var relatedArtistsCounts = {};
  var relatedArtistsInfo = {};

  function getAllRelatedArtists() {

    console.log("Getting all related artists!");

    var options = {
      url: 'https://api.spotify.com/v1/me/artist',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    var RelatedPromises = [];


    for (index in topArtistList) {
      var artist = topArtistList[index];
      var id = artist.id;

      console.log(id);

      options['url'] = 'https://api.spotify.com/v1/artists/' + id + '/related-artists';

      var RelatedPromise = get(options);

      RelatedPromises.push(RelatedPromise.then(function (result) {

        console.log("got a result!!");

        var artists = result.artists;
        for (index in artists) {
          var artist = artists[index];
          var artistid = artist.id;

          if (!(artistid in relatedArtistsInfo)) {
            relatedArtistsInfo[artistid] = artist;
            relatedArtistsCounts[artistid] = 0;
          }
          relatedArtistsCounts[artistid] += 1;
        }
      }));
    }

    Promise.all(RelatedPromises).then(function(arrayOfResults) {

      sum = 0;
      for (index in relatedArtistsCounts) {
        //console.log(relatedArtistsInfo[index].name);
        //console.log(relatedArtistsCounts[index]);
        sum += relatedArtistsCounts[index];
      }

      var artistsListened = [];

      for (index in topArtistList) {
        artistsListened.push(topArtistList[index].id);
      }

      console.log("Recommended Artists!");
      recList = getTopRecs(relatedArtistsCounts, 5, artistsListened);
      console.log("here they are:");
      console.log(recList.length);
      recInfoList = [];
      for (var i = 0; i < recList.length; i++) {
        var artistID = recList[i];
        recInfoList.push(relatedArtistsInfo[artistID]);
        console.log(relatedArtistsInfo[artistID].name);
        console.log(relatedArtistsCounts[artistID]);
      }
      

      console.log("Finsihed printing all related artists!");
      console.log(sum);

      res.send({
        'items': recInfoList
      });

    });

    console.log("reached end of func");

  }

  function getTopRecs(dict, count, artistsListened) {
    recList = [];
    currMax = null;
    while (recList.length < count) {
      currMax = null;
      for (index in dict) {
        if (recList.indexOf(index) <= -1 && artistsListened.indexOf(index) <= -1) {
          if (currMax == null) {
            currMax = index;
          } else if (dict[currMax] < dict[index]) {
            currMax = index;
          }
        }
      }
      if (currMax == null) {
        break;
      } else {
        recList.push(currMax);
      }
    }
    return recList;
  }

  function getTopArtists(options) {    
    var topArtistsPromise = get(options);

    topArtistsPromise.then(function (result) {
      var artists = result.items;
      for (index in artists) {
        var artist = artists[index];
        topArtistList.push(artist);
        topArtistDict[artist] = artist.popularity
      }
      if (result.next) {
        options['url'] = result.next;
        return getTopArtists(options);
      } else {
        //console.log(topArtistList);
        getAllRelatedArtists();
      }
    });

    return topArtistsPromise;
  }
  var options = {
      url: 'https://api.spotify.com/v1/me/top/artists',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

  var topArtistsPromise = getTopArtists(options);
 

});



app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);

