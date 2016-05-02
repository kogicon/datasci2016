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



/* Get - Makes an ajax get call in javascript, and returns a promise
*   that will resolve when the ajax call returns.
*   @params {object} the dictionary of options to be used in the get call
*   @return {Promise} the ajax Promise
*/
var get = function(options) {  
  return new Promise(function(resolve, reject) {
    var req = request.get(options, function(error, response, body) {
      if (response.statusCode == 200) {
        resolve(body);
      } else {
        reject(Error(response.statusText));
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

        var options = {
          url: 'https://api.spotify.com/v1/me/playlists',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        /*request.get(options, function(error, response, body) {
        for (var i = 0; i < body.items.length; i++) {

         //console.log(body.items[i]['name']);
         //console.log(body.items[i]['tracks']);

          options.url = body.items[i]['tracks']['href'];

          request.get(options, function(error, response, body) {
            //console.log("GOT TRACKS!!!!");
            //console.log(body);

            for (var i = 0; i < body.items.length; i++) {
              console.log(body.items[i]['track']);
            }

          });


        }
          console.log(body);
        });*/

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

  console.log("getting basic recs");
  var access_token = req.query.access_token;

  console.log(access_token);



  allTracksList = [];
  trackScoreList = [];
  trackGenreDict = {};
  trackArtistList = [];

  function getAllArtists() {

    console.log("Getting all artists!");
    console.log(trackArtistList);

    var options = {
      url: 'https://api.spotify.com/v1/me/artist',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    var ArtistPromises = [];

    for (index in trackArtistList) {
      options['url'] = trackArtistList[index];

      var ArtistPromise = get(options);

      ArtistPromises.push(ArtistPromise.then(function (result) {

        //console.log("got an Artist result!!");
        //console.log(result);

        for (index in result.genres) {
          var genre = result.genres[index];
          console.log("Genre! "+genre + " from " + result.name);
          if (!genre in trackGenreDict) {
            trackGenreDict[genre] = 0;
          }
          trackGenreDict[genre] += 1;
        }
      }));
    }

    Promise.all(ArtistPromises).then(function(arrayOfResults) {
      console.log("getting genre count!");
      

      var total = 0;
      for (index in trackScoreList) {
        total += trackScoreList[index];
      }
      total = 100 - total/trackScoreList.length;

      res.send({
        'score': total,
        'genres': trackGenreDict
      });

    });

    console.log("reached end of func");

  }

  function getAllTracks() {

    console.log("Getting all tracks!");
    console.log(allTracksList);

    var options = {
      url: 'https://api.spotify.com/v1/me/artist',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    var TrackPromises = [];

    for (index in allTracksList) {
      console.log(index);
      var tracks = allTracksList[index];
      options['url'] = tracks.href;

      var TrackPromise = get(options);

      TrackPromises.push(TrackPromise.then(function (result) {

        console.log("got a tracks result!!");


        var tracks = result.items;
        for (index in tracks) {
          var track = tracks[index].track;
          console.log(track);
          trackScoreList.push(track.popularity);
          for (index2 in track.artists) {
            var artist = track.artists[index2];
            trackArtistList.push(artist.href);
          }
        }
      }));
    }

    Promise.all(TrackPromises).then(function(arrayOfResults) {
      console.log("getting artists");


      getAllArtists();

      /*var total = 0;
      for (index in trackScoreList) {
        total += trackScoreList[index];
      }
      total = 100 - total/trackScoreList.length;

      res.send({
        'score': total
      });*/

    });

    console.log("reached end of func");

  }


  function getAllPlaylists(options) {    
    var playlistsPromise = get(options);

    playlistsPromise.then(function (result) {
      console.log(result);
      var playlists = result.items;
      for (index in playlists) {
        var playlist = playlists[index];
        console.log(playlist.tracks);
        allTracksList.push(playlist.tracks);
      }
      if (result.next) {
        options['url'] = result.next;
        return getAllPlaylists(options);
      } else {
        getAllTracks();
      }
    });

    return playlistsPromise;
  }


  userID = "me";

  var options = {
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };

  var getPlaylistsPromise = getAllPlaylists(options);


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
      }
      if (result.next) {
        options['url'] = result.next;
        return getTopArtists(options);
      } else {
        console.log(topArtistList);
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

  /*topArtistsPromise.then(function (result) {
    console.log(result);
    res.send({
      'items': topArtistList
    });
  });*/

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
