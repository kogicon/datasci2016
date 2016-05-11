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
          console.log("status code: " + response.statusCode);
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


  var access_token = req.query.access_token;


  allTracksList = {};
  trackScoreList = {};
  trackGenreDict = {};
  trackArtistList = {};
  finalScoreList = {};
  trackArtistCountList = {};
  trackSepCountList = {};
  artistPopularityDict = {}

  function getAllArtists(userID) {


    var options = {
      url: 'https://api.spotify.com/v1/me/artist',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    var ArtistPromises = [];
    //console.log(trackArtistLi)
    var length = trackArtistList[userID].length
    /*if (length > 600) {
      trackArtistList[userID] = trackArtistList[userID].slice(0, 600);
    }
    else {
      trackArtistList[userID] = trackArtistList[userID].slice(0, customFloor(trackArtistList[userID].length, 50));
    }*/

    console.log("length: " + trackArtistList[userID].length)
    for (var index = 0; index < trackArtistList[userID].length; index+=50) {
      var ids = "";
      var upperBound;
      if (index + 50 < trackArtistList[userID].length) {
        upperBound = index + 50;
      }
      else {
        upperBound = trackArtistList[userID].length;
      }
      //console.log("upperbound: " + upperBound);
      for (var j = index; j < upperBound; j++) {
        //console.log("j: " + j)

        if (j > trackArtistList[userID].length) {
          console.log("breaking");
          break;
        }
        var sp = trackArtistList[userID][j].split("/");
  
        //console.log("j+1: " + parseInt(j+1));
        ids += sp[sp.length-1] + ",";

        
      
      }
      ids = ids.slice(0,ids.length-1);
      var url = 'https://api.spotify.com/v1/artists?ids='+ids;
      //console.log("url: " + url);
      options['url'] = url

      var ArtistPromise = get(options);
      count = 0
      promises = 0
      ArtistPromises.push(ArtistPromise.then(function (result) {
        promises += 1
       
        for (artistidx in result.artists) {
          count += 1
          var artist = result.artists[artistidx];
          artistPopularityDict[artist.name] = artist.popularity

          trackArtistCountList[userID] += 1;
          //console.log("genres: " + artist.genres);
          for (index in artist.genres) {
            var genre = artist.genres[index];


    
            if (!(genre in trackGenreDict[userID])) {
              trackGenreDict[userID][genre] = 0;
            }
            trackGenreDict[userID][genre] += 1;
          }
          if (artist.genres.length == 0) {
            trackSepCountList[userID] += 1;
          }
          
        }

        //console.log("count: " + count)
        //console.log("promises: " + promises)
        //console.log("artist promises: " + ArtistPromises.length)

      }));

    }

    Promise.all(ArtistPromises).then(function(arrayOfResults) {
      console.log("got all artists");
      //console.log(trackGenreDict)
      var sortable = [];
      var sortable2 = [];
      //var sortable3 = [];
      //console.log(trackGenreDict);
      for (var genre in trackGenreDict[userID]) {
        sortable.push([genre, trackGenreDict[userID][genre]])
      }
      sortable.sort(function(a, b) {return b[1] - a[1]})
      //console.log(sortable);
      for (var artist in artistPopularityDict) {
        //console.log(artist, artistPopularityDict[artist])
        sortable2.push([artist, artistPopularityDict[artist]])
      }

      sortable2.sort(function(a, b) {return b[1] - a[1]})
      //console.log(sortable2);
      console.log("Your most listened to genre is: " + sortable[0][0])
      console.log("You listen to these genres: " + Object.keys(trackGenreDict[userID]))
      console.log("Your most popular artist is: " + sortable2[0][0])
      console.log("Your most obscure artist is: " + sortable2[sortable2.length - 1][0])

      var total = 0;
      for (index in trackScoreList[userID]) {
        total += trackScoreList[userID][index];
      }
      total = 100 - total/trackScoreList[userID].length;

      //finalScoreList[userID] = [total, trackGenreDict[userID], trackSepCountList[userID], trackArtistCountList[userID]];

      res.send({
        'score': total,
        'genres': trackGenreDict[userID],
        'mostlistengenre': sortable[0][0],
        'genres': Object.keys(trackGenreDict[userID]),
        'popartist': sortable2[0][0],
        'obscureartist': sortable2[sortable2.length - 1][0]
      });

    });

  }

  var customFloor = function(value, roundTo) {
    return Math.floor(value / roundTo) * roundTo;
}

  function getAllTracks(userID) {

    var options = {
      url: 'https://api.spotify.com/v1/me/artist',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    var TrackPromises = [];
    //console.log(allTracksList[userID])

    for (index in allTracksList[userID]) {

      var tracks = allTracksList[userID][index];
      options['url'] = tracks.href;

      var TrackPromise = get(options);

      TrackPromises.push(TrackPromise.then(function (result) {


        var tracks = result.items;
        for (index in tracks) {
          var track = tracks[index].track;

          trackScoreList[userID].push(track.popularity);
          for (index2 in track.artists) {
            var artist = track.artists[index2];
            if (trackArtistList[userID].indexOf(artist.href) < 0) {
              if (artist.href != null) { 
                trackArtistList[userID].push(artist.href);
              }
            }
          }
        }
      }));
    }

    Promise.all(TrackPromises).then(function(arrayOfResults) {
      console.log("got all tracks");
      //console.log(trackArtistList)
      setTimeout(getAllArtists(userID), 5000);
      //setTimeout(getArtistPopularities(user)
      //console.log("back from timeout")

    });

  }


  function getAllPlaylists(options, userID) {   

    var playlistsPromise = get(options);

    playlistsPromise.then(function (result) {
      var playlists = result.items;
      for (index in playlists) {
        var playlist = playlists[index];
        allTracksList[userID].push(playlist.tracks);
      }
      trackscount = 0
      for (index in allTracksList[userID]) {
        for (j in allTracksList[userID][index]) {
          trackscount += 1
        }

      }
      if (result.next && allTracksList[userID].length < 75) {
      //if (result.next) {
        options['url'] = result.next;
        return getAllPlaylists(options, userID);
      } else {
        /*if (allTracksList[userID].length = 100) {
          allTracksList[userID] = allTracksList[userID].slice(0, 50);
        }*/
        setTimeout(getAllTracks(userID), 5000);
        //getAllTracks(userID);
      }
    });

    return playlistsPromise;
  }

  
    userID = "me";

    console.log(userID);
    allTracksList[userID] = [];
    trackScoreList[userID] = [];
    trackGenreDict[userID] = {};
    trackArtistList[userID] = [];
    trackArtistCountList[userID] = 0;
    trackSepCountList[userID] = 0;

    var options = {
      url: 'https://api.spotify.com/v1/me/playlists',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    var getPlaylistsPromise = getAllPlaylists(options, userID);

});


app.get('/get_basic_recommendations', function(req, res) { 

  var access_token = req.query.access_token;


  var topArtistList = [];
  var topArtistDict = {};
  
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
      options['url'] = 'https://api.spotify.com/v1/artists/' + id + '/related-artists';
      var RelatedPromise = get(options);


      RelatedPromises.push(RelatedPromise.then(function (artist) { return function (result) {
        //console.log(result);

        var artists = result.artists;
        for (index in artists) {
          var recartist = artists[index];
          var recartistid = recartist.id;

          if (!(recartistid in relatedArtistsInfo)) {
            relatedArtistsInfo[recartistid] = recartist;
            relatedArtistsCounts[recartistid] = [];
          }
          relatedArtistsCounts[recartistid].push(artist);
        }
        //console.log(relatedArtistsCounts);
      }; }(artist)));
    }

    Promise.all(RelatedPromises).then(function(arrayOfResults) {
      topTrackDict = {}
      topTrackPromises = []
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
      //console.log("here they are:");
      //console.log(recList.length);
      recInfoList = [];
      for (var i = 0; i < recList.length; i++) {
        var artistID = recList[i];
        //console.log(relatedArtistsInfo[artistID])
        
        getTopTrack(artistID, topTrackDict, topTrackPromises);
        
       


        //console.log(relatedArtistsInfo[artistID].name);
        //console.log(relatedArtistsCounts[artistID]);
        
      }
      

      console.log("Finished printing all related artists!");
      //console.log(sum);
      Promise.all(topTrackPromises).then(function() {
        res.send({
        'artists': topArtistList,
        'info': recInfoList,
        'toptrack': topTrackDict,
        'recommend': relatedArtistsCounts


        })
      

      });


    //console.log("reached end of func");
    });

  };

  function getTopTrack(artistID, topTrackDict, topTrackPromises) {

    var options = {
      url: 'https://api.spotify.com/v1/artists/'+artistID+'/top-tracks?country=US',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };
    topTrackPromise = get(options);
    topTrackPromises.push(topTrackPromise.then(function(result) {
      var topTrack = result.tracks[0];
      topTrackDict[artistID] = topTrack

    }));
    recInfoList.push(relatedArtistsInfo[artistID]);
    

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
          } else if (dict[currMax].length < dict[index].length) {
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
        //console.log(artist);
        topArtistList.push(artist);
        topArtistDict[artist] = artist.popularity;
      }
      if (result.next) {
        options['url'] = result.next;
        return getTopArtists(options);
      } else {
        //console.log(topArtistList);
        if (topArtistList.length == 0) {
          topArtistList.push({"id":"3P5NW1wQjcWpR0VsT1m0xr", "name":"Hello"});
          topArtistList.push({"id":"4MXUO7sVCaFgFjoTI5ox5c", "name":"Hello1"});
          topArtistList.push({"id":"4M5nCE77Qaxayuhp3fVn4V", "name":"Hello2"});
          topArtistList.push({"id":"4EVpmkEwrLYEg6jIsiPMIb", "name":"Hello3"});
        } 
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

