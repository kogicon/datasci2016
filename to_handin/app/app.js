//This is the main of our app. To run it, type node app.js in terminal and go to localhost:8888

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

      //if there was a response at all
      if (response) {
        //if the response was successful
        if (response.statusCode == 200) {
          resolve(body);
        } else {
          //there was an error in making a call to the SPI
          rejcount++;
          console.log("status code: " + response.statusCode);
          console.log("REJECTING" + rejcount);
          //console.log(response);
          resolve({});
          //reject(Error(response.statusText));
        }
      }
      //there was no response at all 
      else {
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

  //data structures
  allTracksList = {};
  trackScoreList = {};
  trackGenreDict = {};
  trackArtistList = {};
  finalScoreList = {};
  trackArtistCountList = {};
  trackSepCountList = {};
  artistPopularityDict = {}

  //Gets all of a users artists from the tracks from their playlists
  function getAllArtists(userID) {

    var options = {
      url: 'https://api.spotify.com/v1/me/artist',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    var ArtistPromises = [];
    var length = trackArtistList[userID].length
    //iterate through tracks
    for (var index = 0; index < trackArtistList[userID].length; index+=50) {
      var ids = "";
      var upperBound;
      if (index + 50 < trackArtistList[userID].length) {
        upperBound = index + 50;
      }
      else {
        upperBound = trackArtistList[userID].length;
      }
      //no more tracks to get
      for (var j = index; j < upperBound; j++) {
        if (j > trackArtistList[userID].length) {
          console.log("breaking");
          break;
        }
        var sp = trackArtistList[userID][j].split("/");
        ids += sp[sp.length-1] + ",";
      }
      //Spotify's getSeveralTracks endpoint cuts down the number of calls you have to make
      ids = ids.slice(0,ids.length-1);
      var url = 'https://api.spotify.com/v1/artists?ids='+ids;
      console.log("url: " + url);
      options['url'] = url
      //calls getSeveralTracks
      var ArtistPromise = get(options);
      //returns a promise for each call made
      ArtistPromises.push(ArtistPromise.then(function (result) {
        promises += 1
        //Keeps track of genres of tracks and artist popularities
        for (artistidx in result.artists) {
          var artist = result.artists[artistidx];
          artistPopularityDict[artist.name] = artist.popularity
          trackArtistCountList[userID] += 1;
          //iterates all the genres of each artist and adds the mto a dictionary
          for (index in artist.genres) {
            var genre = artist.genres[index];
            if (!(genre in trackGenreDict[userID])) {
              trackGenreDict[userID][genre] = 0;
            }
            trackGenreDict[userID][genre] += 1;
          }
          //artist has no genres
          if (artist.genres.length == 0) {
            trackSepCountList[userID] += 1;
          }      
        }
      }));
    }
    //waits for all the artist promises to resolve (because JavaScript is asynchronous)
    Promise.all(ArtistPromises).then(function(arrayOfResults) {
      console.log("got all artists");
      var sortable = [];
      var sortable2 = [];
      //sorts dictionary by most popular genre
      for (var genre in trackGenreDict[userID]) {
        sortable.push([genre, trackGenreDict[userID][genre]])
      }
      sortable.sort(function(a, b) {return b[1] - a[1]})
      //sorts dictionary by most popular artist
      for (var artist in artistPopularityDict) {
        sortable2.push([artist, artistPopularityDict[artist]])
      }
      sortable2.sort(function(a, b) {return b[1] - a[1]})
      console.log("Your most listened to genre is: " + sortable[0][0])
      console.log("You listen to these genres: " + Object.keys(trackGenreDict[userID]))
      console.log("Your most popular artist is: " + sortable2[0][0])
      console.log("Your most obscure artist is: " + sortable2[sortable2.length - 1][0])

      var total = 0;
      for (index in trackScoreList[userID]) {
        total += trackScoreList[userID][index];
      }
      total = 100 - total/trackScoreList[userID].length;

      //Uncomment to print out all hipster_score data as json, for copying into file
      //finalScoreList[userID] = [total, trackGenreDict[userID], trackSepCountList[userID], trackArtistCountList[userID]];
      //console.log("finalScoreList");
      //console.log(finalScoreList);

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

  //Gets all of a user's tracks from their playlists
  function getAllTracks(userID) {

    var options = {
      url: 'https://api.spotify.com/v1/me/artist',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    var TrackPromises = [];
    //Gets tracks from a playlist using the playlist's link
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
      console.log(trackArtistList)
      setTimeout(getAllArtists(userID), 5000);
    });

  }

  //Gets all of a user's public playlists using the Spotify API
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
      //paging
      if (result.next && allTracksList[userID].length < 75) {
        options['url'] = result.next;
        return getAllPlaylists(options, userID);
      } else {
        //Don't want to get rate-limited
        setTimeout(getAllTracks(userID), 5000);
      }
    });

    return playlistsPromise;
  }
  
  //Ininitalizes value for call for current user
  userID = "me";
  allTracksList[userID] = [];
  trackScoreList[userID] = [];
  trackGenreDict[userID] = {};
  trackArtistList[userID] = [];
  trackArtistCountList[userID] = 0;
  trackSepCountList[userID] = 0;

  //Sets up ajax call for initial playlists call
  var options = {
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };

  //Starts series of promises to get all hipster_score data for current user
  var getPlaylistsPromise = getAllPlaylists(options, userID);



  /*
    Gets hipster_score data for entire list of userIDs if userIDs is not empty
  */
  userIDs = []
  //Uncomment this if you want to run to get all user hipster_score info 
  //userIDs = ["anthonylennon", "kieronjr", "kr1978", "1296741408", "osornios", "legcow", "stokedpepsi", "djelito", "niffle7", "12170982700", "12122592020", "rjvms", "miguelmarquez", "raoul95", "brenna_camille", "alisonwerder", "skillshot", "manakahofski", "rior_4", "sigoptic", "pedrofranca16", "caamich", "brianawills05", "harmonyjanay", "1215498199", "danyedidovich", "hietschb", "jray161", "bassman999", "ninami19", "kylobren", "imaustinjacobm", "atorres922", "testdummy1122", "judahg", "epicskate", "uuinsider", "soulamusic", "amendy", "garrett_carder", "rcerwin09", "izzie98", "tresand12", "lhmoore", "snowmk94", "danilions", "shengels", "cbmdlt", "sarauc28", "pjwpkm", "xka22", "niightmarez", "1249542388", "alibretz", "awalker88", "mikedurelli", "giruto", "wjtan123", "inesflacerda", "maham", "mansoa4", "laffysapphy", "stellar321", "murillocr", "sanson99", "downlucks", "deadsilence6", "tommyx25", "ashwhimp", "18athoreso", "mazthebows", "lesbiandraste", "rickvanmook", "ellengarfinkle", "dancer152636", "demi_1019", "leopold7777", "oliviafaas", "zseven1", "rebekahljw", "fridavictoria", "itsjustaphase", "freyerf", "adrianntorress", "julenekluth", "dale_family", "jtom69", "atmbomber", "jot_es", "o8iio", "aenikirk", "drinkxbleach", "q_bair", "jonathangaddis", "justeldrin", "d0llfface", "paytoncarver", "bkeirden", "fannsaw", "tony9401", "1299768938", "jakeburgos", "asroberts11", "maxfic", "m10eric", "nikkijbe", "ale4175", "vkyone", "dj_dirt", "fstefanik", "jakevalencia915", "1217219707", "freeman02", "kalubtomas", "1213744612", "stevencampbell4", "pupetman64", "12166885264", "egills", "minerock16", "brianinoshkosh", "dberik", "bren111", "kara_garland", "ttaylor319", "lmuller", "jeliaw", "corymills", "1240645805", "acehigh96", "wayclef", "boxr_tailored", "shadow_animus", "devonbillups", "maervince", "122502919", "anahnarciso", "12142110879", "necromancer10", "jackmoldave", "kelsjonees", "colorpaper", "valorks", "libbybarg", "xprodannyalt", "gregoryjcole", "mazzmama", "bryan1712", "rurusadvent", "1243767224", "hi5josh", "marshponds", "paolojamon", "das_noobin", "geraf", "tigger1", "jsundel", "sanjaynomi", "julilanuzeta", "jcarlosgma", "kwilhite", "jack_donovan", "gmoejm", "sunridge1004", "emorinavid", "jdizzzle47", "jay24chaudhary", "nicolew", "athomaslchs", "tde116", "vkgreg", "hbalazs98", "pavangel1", "annabelledean","107jenko", "107pineapples", "12137946234", "12186531079", "1251345267", "212355", "Aetnaaa", "AnarchyClapTrap", "Antvandy717", "Ashmonster8", "BR18", "Bigamp55", "Bobwest", "BradyWally", "Carlita12", "CarlosRojs", "Chase16", "Copita7", "CountryMusicHOF", "Crazykatlasy", "Danjirik", "DarkHyliankitty", "Dcwill", "DeweyThompson", "Elpintus", "Eyestone1", "Fiorella1", "Forever_Chuck", "GenericJuan", "GinnyRae", "Gravitar", "Guitarilla", "Hakiki", "Hannahhdovee", "Icide", "Jesus95236", "Jfjejdhhdhe", "JoshyB", "Ken1010", "Kenan_Keller", "Kikesanchez", "Klunket", "Krischa123", "Kwimei", "Laineysparks", "LeoA", "Linkyo", "Luis111full", "Mahsarbpr", "Manuelpaz206", "MatiRomano", "Michaelboy", "MichelKoga", "Mikimoto", "Mintythellama12", "Narelf", "NotZen", "Papin", "ParisPrudencio", "PatrickKrueger", "Pmbrit", "Puredude310", "Rafelurbina11", "RedbyNight", "Redredredredred", "Rob68", "Rodolfotrevisan", "Rosacheny", "Rumah", "S3k5hUn", "SamRoss", "Sdot25", "Spoiledmilk1", "Talahamut", "Tanfastic", "TheKeyLimitNA", "Tiffvnyyy", "Timtom123", "Tmmyrdgers6969", "US2166887", "Vaitelias", "Wburpitt", "WiniciusAL", "Zackattack", "aaron_andy", "aclane", "adamec2005", "adou_", "alcisneros", "alebeth75", "alexleecedillo", "all2god", "andiesweetswirl", "andre8213", "andrew_ames", "anth1", "art123", "atobatoto", "ausdau21", "bakabakabaka", "banana11", "beatsbyjoe", "bigmab", "bikebodenberger", "bisbees", "bkd1995", "bretangell", "bryankiim", "cactuscult", "caitlinnhooker", "calumbrown-gb", "catcha25", "cbpickl", "chemprep", "chrislamnz", "clockcode", "coan", "colintrevithick", "crandell", "crashedcar", "cubacobra", "cwbasil", "cycyk", "danragan", "daphne_tang", "deecon95", "deehoss", "diegoxr", "digitaljedi21", "doughoyer", "dowdyism", "driveflanger", "ecountry", "edwin3802", "emmakiehl", "erofe0819", "faabii-br", "fallanic", "feckler", "flynn12345", "fullerryan", "fwen", "gaherty16", "gareis2016", "gatuslaonice", "guilhermemanso", "hannah_sharmini", "hannahholiday", "haynesyoung", "hbarthmuss", "hgbra", "hockeysis24", "ivanarudan", "jappabh", "jcoug", "jctusa7", "jeremymullen", "jerigan", "jewishhitler", "joeszeto310", "joeyv101", "jogrampa", "johntbreezy", "jordanshort", "jpmendoza", "jsauer33", "jsilverstreak", "jukster11", "justinpark", "jw30", "kamilosam", "karololiveros", "kelseyhghghghhg", "kerriohs", "kiki27", "kilaq", "knotis", "kschmelz", "kttallen", "kub9001", "kwollner", "ler1310", "lewtds", "lexie2165", "lian0101", "lmfaozain", "lolo252003", "lucasklein38", "ludwigcrepus", "lulubongonmd", "lyragenevieve", "marchk57", "markholtgrave1", "markosmakarov", "marmac", "marszs", "maryellen147", "matheus_saft", "matt5913", "matthewye", "mcconth", "minaralwuta", "mmhhhhhhhh", "mrandriusv", "muajajajaja", "musicloveryeeha", "musicologynyc", "nachogallegos", "natbat780", "nathanvorwerk", "neelygray", "nickheer", "nicoleslx", "nikemike92", "nixonws17", "normalstuff666", "north_col_camp", "onemarley", "paradoxwonton", "patar", "patedgewood", "raven2k6", "regaleagle728", "reilly2022", "revoxus", "richandelin", "rjpow0927", "robdi1111", "robsclone", "roneymed", "rrs72", "rrstanny", "rsfiction", "ryanvarner2321", "rydot", "samrsharp", "sanjaynomi", "schabrow", "schiff", "scootsie00", "sean_dever", "seansteegpierce", "sebbiwu", "shawnmartens", "siamesedrummer", "skelley42", "sky_hartley", "smeckerle", "sonachi35", "spiritkoala", "spocknado", "spotifysample00", "stephensobota", "sunskizzle", "timr11", "tititiia", "tmccue", "tmlove1230", "tmobil", "toastywarrior", "tomcreamer", "truthgamerpro", "turnthepage1995", "txcrew", "varangian56", "veronicakissane", "vladisfc3", "vm2jacarei", "watedi", "xoxonad", "zadiespop", "zhangyuzexxx","davidwylie19", "bettypanda", "samdesranleau", "rossanahinojosa", "Richgracey", "jsauer33", "Jowadowik", "Duh_Bob", "Mscherylb", "tegdip", "brillyant09", "Firepot", "ZilchCrosby", "Nicofam8", "edgaregonzalez", "Ohireney", "ravynmoondancer", "bobdiam", "pielemon1999", "in_spectrum", "Luker60", "Jauja", "hellofishy1", "twomadness", "charchar570", "roni95", "Jamed", "gidbot", "IcanHearUnow", "ciarah211", "jazztheglass", "vedcheela", "Equalify", "whalf2", "jaycelpulanco", "elsubera", "unini80", "lorenwinters", "cq179697", "tesssloth", "isnotajellyfish", "gersbeck11", "nsinjp", "zedack", "LSWard", "jerseytodd", "alicerpelding", "arcticmegan", "mollycon101", "krisutoba", "Broseidonkotb", "caarolineek", "sickshotmc", "hashman", "paytonkuzyk", "Coltoncm69", "ShellieC72", "linnea1654", "imsomonreal", "pablomorales92", "morganmiranda", "smithzack22", "roykela", "arvicane", "spaceboymyles", "paulgt", "moriahwhitlow", "mw0401", "Algee", "matt_burton", "dcomstock1264", "officialdianavo", "burgess1", "dallasyoung1", "lattmp6060", "justinrose10", "samunkless", "seanayyy", "Ultraraaj400", "Dyponius", "Historicmoments", "missmollydawson", "Dyponius", "Nsksksnsksooas", "NuckinFuts1959", "Ikjulopik", "jemch88", "CalebEarl", "gracehjang", "Ghorich", "pprprpep", "mnmgal13", "rachyllyons", "derazzed", "12155397055", "alexasoph", "iuh98987", "katiekoke", "soundspot54", "ailecki17", "powerpuffman", "kelmike", "LeChimichanga", "facefaceface", "txorangeman", "akhmadprayogi", "Qqqq4", "screwthis123", "loveanpeace4eva", "Yohsisodndk", "Giovis2", "pjhholmes", "tonyprickett", "jcplasha", "Amy3", "meglmt", "mamifsidtect", "keeny", "jcplasha"];

  //Gets called recursively with index for next user to get all info for the userID at that index
  var callForUser = function (useridx) {
    userID = userIDs[useridx].toLowerCase();

    console.log(userID);
    allTracksList[userID] = [];
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
      //Waits 10 seconds (to avoid rate limiting by Spotify API), then calls for next user
      setTimeout(function(){ callForUser(useridx+1); }, 10000);
    }

  }
  if (userIDs.length > 0) {
    callForUser(0);
  }


});


app.get('/get_basic_recommendations', function(req, res) { 

  var access_token = req.query.access_token;
  var topArtistList = [];
  var topArtistDict = {};
  var relatedArtistsCounts = {};
  var relatedArtistsInfo = {};

  //Gets all related artists of a user's top artists
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
      //getting related artists of an artist
      options['url'] = 'https://api.spotify.com/v1/artists/' + id + '/related-artists';
      var RelatedPromise = get(options);
      RelatedPromises.push(RelatedPromise.then(function (artist) { return function (result) {
        var artists = result.artists;
        for (index in artists) {
          var recartist = artists[index];
          var recartistid = recartist.id;
          //uses a dictionary to keep track of related artists
          if (!(recartistid in relatedArtistsInfo)) {
            relatedArtistsInfo[recartistid] = recartist;
            relatedArtistsCounts[recartistid] = [];
          }
          relatedArtistsCounts[recartistid].push(artist);
        }
      }; }(artist)));
    }

    Promise.all(RelatedPromises).then(function(arrayOfResults) {
      topTrackDict = {}
      topTrackPromises = []
      sum = 0;
      for (index in relatedArtistsCounts) {
        sum += relatedArtistsCounts[index];
      }
      var artistsListened = [];
      for (index in topArtistList) {
        artistsListened.push(topArtistList[index].id);
      }
      console.log("Recommended Artists!");
      recList = getTopRecs(relatedArtistsCounts, 5, artistsListened);
      recInfoList = [];
      for (var i = 0; i < recList.length; i++) {
        var artistID = recList[i];        
        getTopTrack(artistID, topTrackDict, topTrackPromises);  
      }
      console.log("Finished printing all related artists!");
      Promise.all(topTrackPromises).then(function() {
        res.send({
          'artists': topArtistList,
          'info': recInfoList,
          'toptrack': topTrackDict,
          'recommend': relatedArtistsCounts
        })
      });
    });
  };

  //Gets a user's top tracks from Spotify's API
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

  //Gets a user's artist recommendations
  function getTopRecs(dict, count, artistsListened) {
    recList = [];
    currMax = null;
    while (recList.length < count) {
      currMax = null;
      //Finds 5 artists with the max related artist count
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
  
  //Gets a user's top artists from the Spotify API. If a user has no top artists, we use dummy artists.
  function getTopArtists(options) {    

    var topArtistsPromise = get(options);

    topArtistsPromise.then(function (result) {
      var artists = result.items;
      //Adds artist to the array, and keeps track of artist popularity
      for (index in artists) {
        var artist = artists[index];
        topArtistList.push(artist);
        topArtistDict[artist] = artist.popularity;
      }
      //paging
      if (result.next) {
        options['url'] = result.next;
        return getTopArtists(options);
      }
       else {
        //If a user has no top artists (as listened to <50 artists), 
        //fill with some sample artists
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


//Handler for the home page of our app, gives the user an authentication token
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

