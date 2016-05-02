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


var get = function(options) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = request.get(options, function(error, response, body) {
      // This is called even on 404 etc
      // so check the status
      if (response.statusCode == 200) {
        // Resolve the promise with the response text
        resolve(body);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
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

        /*var options = {
          url: 'https://api.spotify.com/v1/me/playlists',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };*/
        

        function getRandomArtists(options) {
          var randomArtistsPromise = get(options);
          console.log("got random artist");
          randomArtistsPromise.then(function (result) {
            //console.log("result: " + result.items);
            //console.log("next: " + result.items.next);
            //console.log(result.artists.items);
            var artists = result.artists.items;
            //console.log(artists);
            var randomArtistList = []
            
            for (index in artists) {
              //console.log(artist[index])
              randomArtistList.push(artist[index])
            }
            console.log(randomArtistList)
            for (index in randomArtistList) {
              artist = randomArtistList[index]
              //console.log(artist);

            }
            if (result.artists.next) {
              console.log("getting to next")
              options['url'] = result.artists.next;
              return getRandomArtists(options);
            }
          });
        }
              /*console.log("getting here");
              var artistid = artists[index].id;
              //console.log(artistid);
              //console.log("id: " + artistid);
              var albumoptions = {
                url: "https://api.spotify.com/v1/artists/"+artistid+"/albums",
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
              };
              albumPromise = get(albumoptions);
              albumPromise.then(function(result) {
                mostRecentAlbumId = result.items[0].id;
                console.log(mostRecentAlbumId);
                var tracksoptions = {
                  url: "https://api.spotify.com/v1/albums/"+mostRecentAlbumId+"/tracks",
                  headers: { 'Authorization': 'Bearer ' + access_token },
                  json: true
                };
                tracksPromise = get(tracksoptions);
                tracksPromise.then(function(result) {
                  //tracks = result
                  //console.log(result.items);
                  albumTracks = result.items;
                  for (index in albumTracks) {
                    albumPromises = []
                    //console.log(albumTracks[index].popularity);
                    var trackoptions = {
                      url: "https://api.spotify.com/v1/tracks/"+albumTracks[index].id,
                      headers: { 'Authorization': 'Bearer ' + access_token },
                      json: true
                    };
                    trackPromise = get(trackoptions);
                    albumPromises.push(trackPromise);
                    Promise.all(albumPromises).then(function(result) {
                      //console.log(result);
                      track = {id: result.id, track_number: result.track_number, popularity: result.popularity};
                      console.log("track: " + track);
                      album.push(track);
                    })
                  }
                })
              })
              console.log("being pushed");
              allAlbums.push(album);

  
            }*/

            /*if (result.artists.next) {
              options['url'] = result.artists.next;
              return getRandomArtists(options);
            } else {
              var randNumber = (Math.floor(Math.random() * allArtists.length) + 1).toString() 
              randomartist["url"] = "https://api.spotify.com/v1/search?q=year%3A2001&type=artist&market=US&limit=1&offset=".concat(randNumber);
              var randomArtistPromise = get(randomartist);
              randomArtistPromise.then(function (result) {
                var randArtist = result.items;
                console.log(randArtist[0]);
              });
            }*/
            /*var albumoptions = {
              url: "https://api.spotify.com/v1/artists//albums",
              headers: { 'Authorization': 'Bearer ' + access_token },
              json: true
            };*/

        var options = {
            url: "https://api.spotify.com/v1/search?q=year%3A2000-2016&type=artist&market=US",
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };
        var randomArtistsPromise = getRandomArtists(options);
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

