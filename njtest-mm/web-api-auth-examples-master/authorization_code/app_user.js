/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow

 To run in terminal, type 'node app.js'. Then open a chrome and type 'localhost:8888'. Login, then look at terminal for info
 */

// run 'npm install simple_statistics' to install statistic software to use statistic controls
// run 'npm install d3' to install d3 and then require it to allow use of d3 in this file coded in node.js

var d3 = require('d3'),
    http = require('http'),
    fs = require('fs');

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '93ba9aeed2e94c22a2c9a7cb4aff6fa8'; // Your client id
var client_secret = '7b4ccf4a65e445e4b4aeb25f84c7b195'; // Your client secret
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

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-follow-read';
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
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API. Displays user information
        request.get(options, function(error, response, body) {
          //console.log(body);
          //console.log('country and name: ' + body['country'] + ', ' + body['display_name'])
        });

        // Begin my code ----------------------------------------
        var async = require("async");
        var get_artists = require("./get_artists");

        var popular_array = [];
        var friend_popularity = ["value"];

        var usernames1 = ["anthonylennon", "12186531079"];
        usernames = ["107jenko", "107pineapples", "12137946234", "12186531079", "1251345267", "212355", "Aetnaaa", "AnarchyClapTrap", "Antvandy717", "Ashmonster8", "BR18", "Bigamp55", "Bobwest", "BradyWally", "Carlita12", "CarlosRojs", "Chase16", "Copita7", "CountryMusicHOF", "Crazykatlasy", "Danjirik", "DarkHyliankitty", "Dcwill", "DeweyThompson", "Elpintus", "Eyestone1", "Fiorella1", "Forever_Chuck", "GenericJuan", "GinnyRae", "Gravitar", "Guitarilla", "Hakiki", "Hannahhdovee", "Icide", "Jesus95236", "Jfjejdhhdhe", "JoshyB", "Ken1010", "Kenan_Keller", "Kikesanchez", "Klunket", "Krischa123", "Kwimei", "Laineysparks", "LeoA", "Linkyo", "Luis111full", "Mahsarbpr", "Manuelpaz206", "MatiRomano", "Michaelboy", "MichelKoga", "Mikimoto", "Mintythellama12", "Narelf", "NotZen", "Papin", "ParisPrudencio", "PatrickKrueger", "Pmbrit", "Puredude310", "Rafelurbina11", "RedbyNight", "Redredredredred", "Rob68", "Rodolfotrevisan", "Rosacheny", "Rumah", "S3k5hUn", "SamRoss", "Sdot25", "Spoiledmilk1", "Talahamut", "Tanfastic", "TheKeyLimitNA", "Tiffvnyyy", "Timtom123", "Tmmyrdgers6969", "US2166887", "Vaitelias", "Wburpitt", "WiniciusAL", "Zackattack", "aaron_andy", "aclane", "adamec2005", "adou_", "alcisneros", "alebeth75", "alexleecedillo", "all2god", "andiesweetswirl", "andre8213", "andrew_ames", "anth1", "art123", "atobatoto", "ausdau21", "bakabakabaka", "banana11", "beatsbyjoe", "bigmab", "bikebodenberger", "bisbees", "bkd1995", "bretangell", "bryankiim", "cactuscult", "caitlinnhooker", "calumbrown-gb", "catcha25", "cbpickl", "chemprep", "chrislamnz", "clockcode", "coan", "colintrevithick", "crandell", "crashedcar", "cubacobra", "cwbasil", "cycyk", "danragan", "daphne_tang", "deecon95", "deehoss", "diegoxr", "digitaljedi21", "doughoyer", "dowdyism", "driveflanger", "ecountry", "edwin3802", "emmakiehl", "erofe0819", "faabii-br", "fallanic", "feckler", "flynn12345", "fullerryan", "fwen", "gaherty16", "gareis2016", "gatuslaonice", "guilhermemanso", "hannah_sharmini", "hannahholiday", "haynesyoung", "hbarthmuss", "hgbra", "hockeysis24", "ivanarudan", "jappabh", "jcoug", "jctusa7", "jeremymullen", "jerigan", "jewishhitler", "joeszeto310", "joeyv101", "jogrampa", "johntbreezy", "jordanshort", "jpmendoza", "jsauer33", "jsilverstreak", "jukster11", "justinpark", "jw30", "kamilosam", "karololiveros", "kelseyhghghghhg", "kerriohs", "kiki27", "kilaq", "knotis", "kschmelz", "kttallen", "kub9001", "kwollner", "ler1310", "lewtds", "lexie2165", "lian0101", "lmfaozain", "lolo252003", "lucasklein38", "ludwigcrepus", "lulubongonmd", "lyragenevieve", "marchk57", "markholtgrave1", "markosmakarov", "marmac", "marszs", "maryellen147", "matheus_saft", "matt5913", "matthewye", "mcconth", "minaralwuta", "mmhhhhhhhh", "mrandriusv", "muajajajaja", "musicloveryeeha", "musicologynyc", "nachogallegos", "natbat780", "nathanvorwerk", "neelygray", "nickheer", "nicoleslx", "nikemike92", "nixonws17", "normalstuff666", "north_col_camp", "onemarley", "paradoxwonton", "patar", "patedgewood", "raven2k6", "regaleagle728", "reilly2022", "revoxus", "richandelin", "rjpow0927", "robdi1111", "robsclone", "roneymed", "rrs72", "rrstanny", "rsfiction", "ryanvarner2321", "rydot", "samrsharp", "sanjaynomi", "schabrow", "schiff", "scootsie00", "sean_dever", "seansteegpierce", "sebbiwu", "shawnmartens", "siamesedrummer", "skelley42", "sky_hartley", "smeckerle", "sonachi35", "spiritkoala", "spocknado", "spotifysample00", "stephensobota", "sunskizzle", "timr11", "tititiia", "tmccue", "tmlove1230", "tmobil", "toastywarrior", "tomcreamer", "truthgamerpro", "turnthepage1995", "txcrew", "varangian56", "veronicakissane", "vladisfc3", "vm2jacarei", "watedi", "xoxonad", "zadiespop", "zhangyuzexxx"]

        var keep = "" //
        var options_three = {
          url: 'https://api.spotify.com/v1/me/playlists',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };


        // Use the async module to perform each callback sequentally

        // **** modify username between /users/{user_id}/playlists to get a different users playlist**** //
        async.series([
          function(callback) {
            setTimeout(function() {
              callback(null, 1);

              for (var i = 0; i < usernames.length; i++) {

                var options_artist = {
                  url: 'https://api.spotify.com/v1/users/'+usernames[i]+'/playlists', //replace username with +usernames[i]+ to use array
                  headers: { 'Authorization': 'Bearer ' + access_token },
                  json: true
                };

                // use the access token to access the Spotify Web API. Looks at this users artists
                request.get(options_artist, function(error, response, body) {

                  console.log(body.total, body.href);

                  // Prints to console the artist and popularity of artist the user is following
                  /*body.items.forEach(function(item) {
                    console.log(item.tracks);
                    //console.log('popularity of ' + item.name + ' is ' + item.popularity);
                    //popular_array.push(item.popularity)
                  });

                  popular_array = popular_array.sort();
                  var mean = d3.mean(popular_array);
                  friend_popularity.push(mean);
                  console.log("mean of your popular artists: " + mean);*/
            });
            } //end for loop
            }, 300);
          },
          function(callback) {
            setTimeout(function() {
              callback(null, 2);

              //second callback to be called after the first
              
            }, 200);
          },
          function(callback) {
            setTimeout(function() {
              callback(null, 3);

              console.log("last callback");

            }, 100);
          }
        ], function(error, results) {
          console.log(results);
        });
          

      // End my code ----------------------------------------

      
        // need to work on getting other peoples following artist and correctly run the for csv 
        // Eg Noah's Spotify id is: 1234392786



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

