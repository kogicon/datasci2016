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

  userIDs = ["robdi1111", "robsclone", "roneymed", 
  "rrs72", "rrstanny", "rsfiction", "ryanvarner2321", "rydot", "samrsharp", "sanjaynomi", "schabrow", "schiff", "scootsie00", "sean_dever", "seansteegpierce", "sebbiwu", "shawnmartens", "siamesedrummer", 
  "skelley42", "sky_hartley", "smeckerle", "sonachi35", "spiritkoala", "spocknado", "spotifysample00", "stephensobota", "sunskizzle", "timr11", "tititiia", "tmccue", "tmlove1230", "tmobil", 
  "toastywarrior", "tomcreamer", "truthgamerpro", "turnthepage1995", "txcrew", "varangian56", "veronicakissane", "vladisfc3", "vm2jacarei", "watedi", "xoxonad", "zadiespop", "zhangyuzexxx"];

  /*
"anthonylennon", "kieronjr", "kr1978", "1296741408", "osornios", "legcow", "stokedpepsi", "djelito", "niffle7", "12170982700", "12122592020", "rjvms", "miguelmarquez", 
  "raoul95", "brenna_camille", "alisonwerder", "skillshot", "manakahofski", "rior_4", "sigoptic", "pedrofranca16", "caamich", "brianawills05", "harmonyjanay", "1215498199", "danyedidovich", 
  "hietschb", "jray161", "bassman999", "ninami19", "kylobren", "imaustinjacobm", "atorres922", "testdummy1122", "judahg", "epicskate", "uuinsider", "soulamusic", "amendy", "garrett_carder", 
  "rcerwin09", "izzie98", "tresand12", "lhmoore", "snowmk94", "danilions", "shengels", "cbmdlt", "sarauc28", "pjwpkm", "xka22", "niightmarez", "1249542388", "alibretz", "awalker88", "mikedurelli", 
  "giruto", "wjtan123", "inesflacerda", "maham", "mansoa4", "laffysapphy", "stellar321", "murillocr", "sanson99", "downlucks", "deadsilence6", "tommyx25", "ashwhimp", "18athoreso", "mazthebows", 
  "lesbiandraste", "rickvanmook", "ellengarfinkle", "dancer152636", "demi_1019", "leopold7777", "oliviafaas", "zseven1", "rebekahljw", "fridavictoria", "itsjustaphase", "freyerf", "adrianntorress", 
  "julenekluth", "dale_family", "jtom69", "atmbomber", "jot_es", "o8iio", "aenikirk", "drinkxbleach", "q_bair", "jonathangaddis", "justeldrin", "d0llfface", "paytoncarver", "bkeirden", "fannsaw", "tony9401",
  */

  //"legcow", "stokedpepsi", "djelito", "niffle7", "12170982700"
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
