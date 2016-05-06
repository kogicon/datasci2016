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
      resolve(body);
      /*if (response.statusCode == 200) {
        //console.log(body);
        resolve(body);
      } else {
        console.log("status code: " + response.statusCode);
        //console.log(response);
        //console.log("REJECTING");
        reject(Error(response.statusText));
      }*/
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
        var options = {
            url: "https://api.spotify.com/v1/search?q=year%3A2000-2016&type=artist&market=US",
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };
        var randomArtistsList =  []
        var randomArtistsPromises = []
        var albumToPopularityDict = {}
        //getRandomArtistsAlbums(options);
      
        var tracksIds = []
        var albumList = ['4p9QlliNvKndyKSPyuJlP8',

  '4QkEMutmqlltycQry1EuA1',

  '0VWmEVuQ8tA5iA3cCTrgxa',

  '6bfkwBrGYKJFk6Z4QVyjxd',

  '7FuRQryJz4eyHX6UgmIWa9',

  '2fBKreCrztEPXW5bUIgBTf',

  '28ZKQMoNBB0etKXZ97G2SN',

  '0BMJT6z0GbuXuHfFA53Ng6',

  '2z4c8M8aVzl7CTobIp36KF',

  '5S39sWIHkhd8jxdUelQxXF',

  '7nvi0O7yb3kmeXOwXeR9BQ',

  '0anlRE2dYlRqEKL1gj1WPq',

  '0KJe8iJqOpahl1CprfAThy',

  '1gMxiQQSg5zeu4htBosASY',

  '4LJmB29p8VwqfVMYAohv2l',

  '5I0cpsYbmWXXiseiYuxnW4',

  '5hvTahfMuPpksJfjULtwoQ',

  '2AGNF8r2y8HL85yVk2bwmS',

  '2buNSPalbxgT5kdFVYzfWG',

  '6s2isojT7rGZUgJyymjjKU',

  '5smHQ1uTrerU8DyRaqTyxh',

  '1zCbiOzIuZoqpt2cZjtZmM',

  '1yZC8xZwv4gsmCZ4p4JWdI',

  '0PWWlSKbASPyNM4b9uAoPj',

  '5amj9zNeZ3B2EdpBgXrOZ0',

  '22bdIdviOSWmmYEhQxZ7jw',

  '2qczZTZpha2aJyvZuXAoRT',

  '3cQO7jp5S9qLBoIVtbkSM1',

  '7nvi0O7yb3kmeXOwXeR9BQ',

  '0S3BCTCKEJAfIWM1DYrvFJ',

  '0P6KWqoJThIo9r3AA41oa1',

  '3rOErV43NfyPaHSzOLinN7',

  '2O8egayngzl1fm5dcE4VX9',

  '6eDx949ONWDCN0O22wFZf7',

  '6uG9BscYmPnAbtl6Cy9u91',

  '3cfAM8b8KqJRoIzt3zLKqw',

  '11jAMg5CsXfhmwe0A8BIU2',

  '5Nwsra93UQYJ6xxcjcE10x',

  '5nhoVKDcCXvi3AruUFJWnv',

  '4eqgDEEkD4QZijmUn0dns5',

  '0vXJ3rh6Sy7KWjp2P5d7ll',

  '0Ikw6ho559687KCPbSjr0K',

  '6bq2wXFrIO3yp3HOFMhnhM',

  '4aQVkz8QGoi0Rft1NTtZA4',

  '3pKTKC0AAe3yTcXQLzvpSW',

  '3GqN109ajL1U5RE6xJqCIH',

  '1YtbyCxp4LZPbH6PwBuoXl',

  '3hA2oZbZwHU8tSPBFIZhFr',

  '3mwSlvQSswmoOVNpJBCahW',

  '4YPSP5Mi5C0vdbgLTaYucB',

  '3yPVtmnL8JZwYcdTe9Y07O',

  '4xWulj18AGahlyuZPulaGe',

  '5lkNnHVlnCCCV304t89wOH',

  '7m2Gzfu5nMgHTiMbNDwPr7',

  '6iv9dn8NZLtMWbNyV9KLml',

  '1S8SsGOgdv7cNV4VRZSYWB',

  '4jb0GVfgTAocjD2O6z7xDK',

  '5EJgQd6IcN7xvdmpARRk5b',

  '5SqCyY1YmSdD6H5SjQuDrn',

  '1QIZsTZrZdQwQ9QJnFoFao',

  '2RIu1R2av2tWEu2MloUE6u',

  '5ju5Ouzan3QwXqQt1Tihbh',

  '5qklOJdg6WTDIZc6W1YjDQ',

  '3KguAIBPMKWy3ymjY8pLEj',

  '5wZtSIvijWCMc1vlPFqAyB',

  '4G4Azv5cwPBv3vCA0mD6ei',

  '59eUYETmE1zi31ESb3SUkI',

  '3kFN5GKQ2WUlLjcrzTGjy1',

  '1k3BLTc4VZ7beRBXL1SPN6',

  '1cCEfOTFdaZo0POsxE5SkM',

  '47HubZx2eFOxGVMBk1DcqP',

  '39WwaUn8HTVZpJJmAuIIHN',

  '3jJ5HhbOC2KB5fOZ2RgJTo',

  '3arNdjotCvtiiLFfjKngMc',

  '6twKQ0EsUJHVlAr6XBylrj',

  '2UJwKSBUz6rtW4QLK74kQu',

  '3jJKDKdlwRS584zUlHV2Ly',

  '09Q3WwGYsQe5ognkvVkmCu',

  '2hNdpum500dG6mDXs87nbc',

  '6FZ4eWJCVI3EJMi3SsgNKJ',

  '0dAvbhVYW3bGnLldQ8Nvwn',

  '5N6Jn6dBh0WqLzGfOPytgx',

  '2r6t7ccmrPVSd2cQ4Hg5gi',

  '6sUOosXuYt0oUeczJRbedZ',

  '6nzbjdK2dj24nEqAwDxilw',

  '3EV0E90ByGDGVryWPRDFNO',

  '1sfmaFRbpMEGHH7DGup1wT',

  '7uoHnnrTuUFyuWOAH09q46',

  '7nl8U9s1bNfZpwYFn2wi5M',

  '32zIcrS8u29WzhG7v4kzKa',

  '7odWkF9pmRTU835PBsu6QQ',

  '712VoD72K500yLhhgqCyVe',

  '6FVVGIFaX84f7iojJzzS2N',

  '6W8ZsoinSMViZMh9aYK7gQ',

  '0o2W2d2Zl7Bur5jph6phkm',

  '6hU9JCoqq4GjYq86dQ1o9b',

  '2DpEBrjCur1ythIZ10gJWw',

  '67PTz2RQnuh6fRf1JgxUI7',

  '20R2aG3ypwdkXWdI2HigQJ',

  '1kCHru7uhxBUdzkm4gzRQc',

  '1JFmNyVPdBF1ECvv4fhpW4',

  '4PWBTB6NYSKQwfo79I3prg',

  '4DhwPZXdLy4LjoHqJxz8DM',

  '3uymcMheLvldkL7e7EUXz3',

  '0KjLbdlJYvtzXjGTwPy3lv',

  '7jA06bCXArKGLr1V187s9b',

  '2Tyx5dLhHYkx6zeAdVaTzN',

  '48zisMeiXniWLzOQghbPqS',

  '5w40WGuhOElvPC9Dy641Yw',

  '0s9cSoniuN0HfXpwlCpGUF',

  '6eZdwrhB97A3EYx9QppGfl',

  '5Hs43ta4vAYKRRRR7DKjt9',

  '5BFg8l4NYyZ90DWqcBjbt6',

  '5WSPnYTQ6YZ1UvBRi5quhO',

  '7xue2jn8y2BL3EbonL9mup',

  '40QPuvt8Ft79Bakb0Jc78f',

  '0vrWqbRQEMKqhTGcDLQK7x',

  '6OA97YC9HbLfdREQKnsH2R',

  '4Lujxftn2mPfDJUd2nTk6U',
  '6E2NzvLeWyECBSekYAhOap',
  '5NsQCNMLdKVFF1DwOIK6wm',
  '1xy141zMRluP7YaE94IawT',
  '1SfFIU49Hh3x07wsdqPCRE',
  '4g5NzMdGbeRjCDEJK4uwiu',
  '63uxYglJtSneGlHf5MKWfl',
  '4q3SkZWPYJtKno1RbnrjL4',
  '7pilMcbYLycSrpBqa2tvQH',
  '3o0qzgEsSksLaUJ59CTCpI',
  '2j7T4D22NmAKo7CagRE0Qy',
  '6gtHC6bei1WeqtMh2ipuqK',
  '0iSRofVrTOCOs841JkSgwk',
  '3Yq0QspvXk4kRBYpzK5qWf',
  '4twr7zT1cX9NP5mk11FKDD',
  '0MgIgFlCpTYwLuPUocgbZs',
  '3nyxMohQINxnhYwyHvUqVf',
  '20IAU50vjcorTlmQbLrfi7',
  '2qwN15acAl3sm3Idce5vK9',
  '0Qm2vu5VZp2MKLb6yTxSgT',
  '0XOyEsl3kgwwVpYcLV5rRs',
  '3Ec1eNW4gjFsv1A2dvJeWT',
  '5MEgrjkStq0JsQGO64Xvlq',
  '7J2hXOVq8FZ367dTczV7oH',
  '5eLVoIPq7P3Bu29lVgD4x0',
  '0rxKf57PZvWEoU8v3m5W2q',
  '2F58weuq1zM6WbrvEibtwD',
  '4QcXq4vTVN7dFb7bZa9jG2',
  '6dMdadS6Ng71pD9As93ufx',
  '0SbC22F5vzsEKi03NUe2N5',
  '6AuyoIozWlAwKtiBWpLgCk',
  '2btszoya78vyT8fwelmVnz',
  '3bfLn4OV3TsBChYvKu0sgp',
  '4VCl0Vl1YkyY1gLzf0bFEa',
  '2Q9oTK48eb85waX1fFJsvj',
  '5rlB2HPoNHg2m1wmmh0TRv',
  '3ncH3eH5iTUzU73omfc4XG',
  '3qqhNVbjLFNdLviBFrFwCa',
  '6e1WFbtZal9LzexJkJKQVj',
  '4M6zQUI7vnCyRPV3YYvTQQ',
  '3qFQ4XNQ15alZrAaj5oGJK',
  '6bfkwBrGYKJFk6Z4QVyjxd',
  '5PaHwpTefKhQa6Yqsj9WRH',
  '7prfPBMbgDyhq7kdpM0R9v',
  '1hGkOlgKnrjKdZ70P0CdOh',
  '3v9NqDh72DLPjhPVBo4oh1',
  '2yPoxMERyBTce5HFd88Pbr',
  '5RnrEPrcCnCbicoDYUaqgA',
  '68I1PiCLjGToOveuo5SHt8',
  '2R5PAxygJ4YeRuSwoalKam',
  '3L0H4RjVXpEkwfDgi3XOdf',
  '0ujKXmDetsmfjNvmwW546y',
  '0kTe1sQd9yhDsdG2Zth7X6',
  '6ORKcXeeK3aNE3C3TF5wvU',
  '2lkQd5T32QHDOfFkEIPJKz',
  '4Rj8KShBw1IrBW3A7wsEmi',
  '2nnlLfiRNxFpwErX4vjCSv',
  '4zAy084VKE74mjySXPMlaW',
  '2qSyMVTIKLArOx4GNcvutB',
  '6qHNWauDhi2tC4UQKTrQir',
  '3G2kixP0Pi8L0KgmSYohb2',
  '4TQBKFrKq5dNxsAXZwn8tZ',
  '5PBlVx5hyd91saZxHRROrz',
  '7BuPO7yqJYGScpH2Qq6ZSu',
  '1zVOhivZ45EGEZwHsKrC1T',
  '0Afr4iF9tc4vtPLXsS3HUE',
  '5szxmEfjHdrXxMtX2uMExs',
  '32rX0ahjnEzytiE1mNhrQE',
  '184XWylq7ZF0Hn7da4Tr6W',
  '0YkHsU3Mblh7jvNngbV20W',
  '6StNTJJ7Yq3Hf121kLvPBz',
  '4z4Pgh0fNUQkmGP4K1XxDb',
  '0nyTuDV4qohpivHna2kKF8',
  '4js8lX2b3DBIfixMCPABC4',
  '7pomP86PUhoJpY3fsC0WDQ',
  '6uMs4Lu09ntjQMTHqezVbE',
  '2tWmWIqaGRhHssZiGrkn8v',
  '3U7LEGoKx80AMdGSVUmvrz',
  '4PLKkJXTkZSpYswOczm69A',
  '0ntrrCCqU2Ns8XzdHD0ZhY',
  '0emTtJfR6Kxd6XnX6Cv3ZZ',
  '46x0V6aFXVvTO08I7p8HeL',
  '1zFp5Q3Dgo8wmKsmfZ23QX',
  '6645HGh7ZOZSUTpqW9iYLR',
  '453l82SGKWDAlOpKkUSX1u',
  '3HnNyOdm1T23RfhXl78CLt',
  '1EsJT68NwwNopvONM0MgbT',
  '6ee0928VXdRpspAb2dnH0o',
  '7IOSachS7KZNuqRZrPcdD0',
  '7FqHuAvmREiIwVXVpZ9ooP',
  '2Jps53V1q9huwJl6VU8FMP',
  '18IaOJpyXfqbOsZIqmnfpZ',
  '6OwvO40ahugJE5PH4TjqTg',
  '5SiTd0bwEnTMhQ9SFUuxc5',
  '4ioayqjumXhYgfBenmymIH',
  '5lBzHMPjgxz9a4I4JevQAk',
  '2w1YJXWMIco6EBf0CovvVN',
  '34klJx1uwIDeotqHXxWAFx',
  '623Ef2ZEB3Njklix4PC0Rs',
  '1iWrGevwird094O7eDEYBw',
  '5m43SVd4aJhA7M88UwzU8a',
  '6epR3D622KWsnuHye7ApOl',
  '0nW0w37lrQ87k7PLZvC4qJ',
  '2HwasEZzIj3QfRc5n5HDQs',
  '23uALVnjU9XnLB5Z6CUBoG',
  '7qzDkshVM3auVXjbZNdJB0',
  '4K09otZo8zHT8k8AImYHnT',
  '18iFxjZugvKhuNNMbLjZJF',
  '3D5X6AbQha53NG5EVTQaGn',
  '6sFwqBGJedmbGMCPS5U9XL',
  '5JNARdWCr3B4eQmXe74x7K',
  '6UcZPki3VoKEEQrI6nDON7',
  '49qNfrOKcLAHwFboqm9VMO',
  '5iCAbAQCi21EREKse2kJgy',
  '0qhHu41K2AZWTwon2iJZun',
  '5NrFMOprmnMEf4gMnLaHcq',
  '3da6Ihr5l6xjOCDs5sTXIu',
  '14FnVB8TQDpKxlb1hqojPV',
  '2kqn09pydzvKvB3xWbAxY4',
  '1X4yodq8QzdlHOf2EgwhWU',
  '6p9hXypdyODEkef40K61d1',
  '42UJjk8i8L0De7lQtu7sqi',
  '7lxHnls3yQNl8B9bILmHj7',
  '5woG5ibnPu19KmlOL9Olw4',
  '0yU7VItpGPmPcvKmwLg0JT',
  '4GPDevuspfVRL4eEDhF33X',
  '34JNly8P6uZRKTGnmmLNAt',
  '5dNDFl36R5XWnFee8uOiDJ',
  '2EvTMiJyF3H4BoxNCL4HLh',
  '7xAzFnsPL6Bv84Cgvpg3yj',
  '6goEIeFg0hxyzh5BGrwkTC',
  '2mH2TVd6euTmrn9Pcw9XHS',
  '0vNBQof86Lv5gLuf26ML7o',
  '1pjFeaIlL000JMHCLFodES',
  '09asAAZJ7rXedp9J8wqvBR',
  '2ObrzUnMJTs97CI59S93XA',
  '06KRobP4coZ4I6Kfgxb1FV',
  '3RDqXDc1bAETps54MSSOW0',
  '1wYMCwJR4fx2Wz2e7gWcIi',
  '082VlX7cBth0o8xqDGclNn',
  '4CIVpSvrvC1DBWQ3IMgZuX',
  '6dIb4WRLOS7xf2Z2ZzpBFX',
  '3El8niqMP27SVPmvspORGt',
  '4oktVvRuO1In9B7Hz0xm0a',
  '1BEHyslbcycCI7tIxdt2fU',
  '5F63FnyDVZcFljjvVRdPd8',
  '1G4WDlYjm0VqgyEymNJRcf',
  '0YKPlPBOoJRi7Fwcn5RWQH',
  '6vBpLg3T8bojcqzoKI6m0R',
  '2puALR81qCmKmbOyuHAI94',
  '3ayFdF3gGMn72tgGfu2G94',
  '0a4MASgg8wxOyUeoOZzuhc',
  '6S0sbdQmuF3IhNRcMkuQK3',
  '6ZgG3mUKL24PQapSxqlVQe',
  '7EZEhfO3ULNRHwX2jaiGei',
  '5akLCCW1FiRaQOPujduvqm',
  '2zD0vIQjiaFbumnbjWC6WY',
  '2O5841tkIKVcWFQTMHKJlw',
  '608c6dgWXw15hfKngzmshw',
  '63uKgkIBvoW2y0d82f6jtO',
  '0IbCRQ0YXXDz6RIlHKHPMX',
  '0fZ2df3UU6G0nY27hD7Oc1',
  '3tsXyEbUQehXPaRFCS8K1n',
  '4iJyJItef3H4MN57Kxcsi8',
  '1Ug5qpIXouUHY5hpFj6575',
  '4LMpYAVqnugeZa8crTR0qP',
  '4acl5WscYD8Mj6YqbWi778',
  '6LmMDtejaxXbjWROOvR4Y0',
  '6b909CnOynPoB3X8xcIAhp',
  '621OhgnZJ7Pz8iUazct1In',
  '5jz1XHH4z5CegCDlAe9ujP',
  '4WNt7ChKgDoRJqD68PDKo3',
  '3Ap0lD8hS2j3fQVCz4mkB5',
  '6SdmyV1DoEIWU6HDal5BgY',
  '79BJk3m9oRh03Cybtc0hxq',
  '0ZoqS6fjAyRbhYgwuG0nNy',
  '62XbANCAKGWV4riFmjGRCz',
  '6TwFrEptj2KRj1tgGJfUjU',
  '3KePR5bAavy4sGiEHsxFyc',
  '4ki1rrhzBn7lnG0ifeNZaZ',
  '4I2fX43kU3NNU5QgnxB0XI',
  '22iX205pYu4YLGv5ANZsMT',
  '6kRdK7cPgLqNfSoI7AMlyj',
  '6yd9yk8nFcHalXzy7mgaDx',
  '6lofAwveYQnJ9YdwczptqW',
  '5kdGRd8zK6m135zrjwG6il',
  '7ATWoi0ue6EoaXeAOdRHWZ',
  '35ozkX7LrBih6NCACqLoeJ',
  '5kzIHziQ5eAtjIR8zFsCsz',
  '4NxvbRRwdppLYtoSAD0Ysv',
  '1dBlgy5UFC8vfLcASVtdg3',
  '7asvyIMzbsyAJpbC47wjBV',
  '6iKqPv9C5oU29LR82N8lJf',
  '4OFUK4iAjvo50Arx90DraA',
  '1kCHru7uhxBUdzkm4gzRQc',
  '4Z1kH6bfeeMYtCuhnR4vEr',
  '2IVZPDXb7LFbyukqaoWpYR',
  '0joqtLRuYVfbRsRFs3Avw7',
  '65a2mjpIO97Lym60r1ztHL',
  '7969zwJB8p021EBcCUjsv9',
  '4CIVpSvrvC1DBWQ3IMgZuX',
  '7vKMYHwiEKXEwF0H5rmWVt',
  '1vxEYHEzZI2l1AyZOtVHKJ',
  '1ZWY0MgSTNxZrCTSHOQTyC',
  '3jvBPJAaByrTeNkEgvwZeu',
  '22MrOvzmcn6WeE4v6Ua6dj',
  '0VVJxfGQ63nQDksrj4e8EI',
  '2B2xiybenVwWzkGclQQkzi',
  '6xNFuLOko8gjxi5kUAyGyM',
  '75fT8UQEDnekHNhRnbdpNI',
  '5BshPzymFjSwjiMspcyBpo',
  '1UVggFtdVPqHy5WamYFu6w',
  '6LXGBEkiRtzrUb2P5dawCS',
  '4XGGNanLbRm31HIPGKhcAX',
  '6F05ZwnERzhfJ7KNVq6fsU',
  '4m2880jivSbbyEGAKfITCa',
  '1QZ9zkfP94kmfmHabIjlyJ',
  '1qzA3MSlfMuQjIBiKI1zMg',
  '6WlzaRoDShdgVgaqJRjyNH',
  '5Og3UBs6tCL47yee1ukYgw',
  '0pzj9wBT4OKgM7FBfl5tgE',
  '3z65S3MePSLso7WuCdwyOb',
  '77vMGS1nwBm4d0nP9fE25z',
  '2XuubqlDwvySO4Xn7acM68',
  '3OkqAak6KhIQExElXif7UW',
  '4PFdUhjoovWYjdukIAZaIl',
  '5WrbKW1nRN4vSsu70uizxX',
  '5oNe3fenlq9Agv5kT8iU8Y',
  '2iTpTfHG5yui5JVtfRNOdK',
  '0dQP8epDhkpNl1iGTxY9pu',
  '0SeRWS3scHWplJhMppd6rJ',
  '2wart5Qjnvx1fd7LPdQxgJ',
  '0cRJKK0y1sfZEqWub4dK9v',
  '57mWSm5UtRGT08KeJuyZqu',
  '01RhKFrk2BnOaFz1hpQEZz',
  '79EyqF9taW9XFPKci2U5D9',
  '2mD97VgxTRfwB8F5tvkwrL',
  '77cx3z62D7cziIE4cmIi3q',
  '4gS6995dvPQJf80VBtoxi8',
  '6LCn9riwGNsyeYtZPxlJN9',
  '2jsXhRw5G0aSMTzWnKe6T9',
  '4WnkQO4xD9ljQooB3VIxCV',
  '7BEPVoBcHuTLWpcdj8FhM8',
  '4bzVI1FElc13HQagFR7S1W',
  '0J3u0IeHzuymSz7v934vrd',
  '6PSbEhykje2uilFnaEfi4u',
  '3hCFPKRBu3eQbbptilmIIx',
  '7t9f6jrmK6K7CDpVKyTaAk',
  '0Q5sQj3WrRgZ3JTDQPePVX',
  '7JXzUgMregnvyAnmRfVOh5',
  '4LnDmGctE4vdy9ke1RVRLL',
  '5Fb59VtYjJNTXPcNGpoDU3',
  '10BzXBAjOIr8EkDsIYrY1B',
  '0rKecMSGWfKqhls4Rp3PJn',
  '0gqrRf9j8TdNnn0HngmeRA',
  '47xaqCsJcYFWqD1gwujl1T',
  '3vLaOYCNCzngDf8QdBg2V1',
  '3kICNGrN0WDPEacc3zY6N2',
  '1WXp9ofuosOWHVjkEnvuzL',
  '5zhIsj6BWFbPOGEdZupXwn',
  '1XFl653zdaAc1DLEu81GM8',
  '5lvGpzH4UGGwtyIBx3A5NV',
  '0CrkKcykxkV6cZaWs4GlPh',
  '0nNSLoAQeUpxvJb5XHOY4n',
  '2U1IHu92QO3ZBpNDqBe3YA',
  '2Zkvy7eARxR3qjKNWMiwMa',
  '6yGp5e6Puhx155c8dQ8e6P',
  '0NmzhdoPm5f1LiKBAqbrY2',
  '4EcVVeYCeafIQk383MQfp5',
  '4ZnIw6llQFlXcFgjMNtrTw',
  '4XyQyaNvyvTKUxT6xRHEV9',
  '1s6codM2ZAB008t9GTyaEk',
  '0lMw8xxFLYRSGYRlGzo8uc',
  '2Irt2YHEs7cKJv1IR4Nk7u',
  '2NVWzjDHYjiOsZuvdkPahB',
  '2QuYio1K1TNDyJhXKl81wV',
  '7awpB1UEVeDF6h8mGMssTI',
  '2XOKt6AVcxdBs1Za7AxGj2',
  '6FgB290HwL89ZrfEVSZp2c',
  '7hLBZAMHtkfNXPxrbXoVhj',
  '6BK3muExDOuk0VnyMn9NVw',
  '01zrTZowtMtqYutWzzDgds',
  '34CxcAYNmdugoNQZq2Bl3Z',
  '1QyVudk5sVVQyFLfdNFPLP',
  '0nlOewXnENJZgU83zPE1TQ',
  '2Zks3PkvBH0Kl2W1X67VHT',
  '6peEdPVO73WtgGah5sEhX4',
  '11wzEOXFI1wgBHxKcsbacJ',
  '4yJ0xevn2oP1fKzFiNV4r8',
  '0chJtMQf2lYPSbI2Btl5ka',
  '399w1uaOvKhnkczdMMZYoy',
  '1uVE5jbkiVT4ftXprBFDlr',
  '7lU3y8PuUzeZY6N24JTBqP',
  '5ZKto9RhFJgBIeRDM90xss',
  '5aKquUGkicYT6NcdPrZWWC',
  '4Csoz10NhNJOrCTUoPBdUD',
  '7DY6v8qiyQcsTCqUWjH7pS',
  '268OMXVA2ZlhgYEZ9pTiH6',
  '4Io5vWtmV1rFj4yirKb4y4',
  '5Jf4pcpIxqZLzcSkXbr6q3',
  '1b3PHFDi1ZBV0tj8lROPLQ',
  '6uGOeETMsNfv5alC0XnmyN',
  '5yscEifoZw3M3abIVCr8ed',
  '2p2E3pJSwp4nYopcqCQtps',
  '36lGlwe75fTsr4CLVlfYQa',
  '5I3UdCxtIh6hkQ7rMPUvA4',
  '13QoXGJgs22WiDG1NWT00D',
  '2k4SKTM0a5FVN37VvFbxpr',
  '6PmprO3MvzG23cTNTZpQAG',
  '3kV0i1qqudjf0PGawJ4jck',
  '3x13WsiY5X1Di5mVWqKGD4',
  '05XxXIIw1Og2nR3vYfVfA3',
  '5q1BjSadVkASNdJ4neVmt6',
  '2cRMVS71c49Pf5SnIlJX3U',
  '3cQO7jp5S9qLBoIVtbkSM1',
  '6H50phY6SLuSf3KGMriXp9',
  '3jJKDKdlwRS584zUlHV2Ly',
  '3PomvFR694SrCSZzDWMWV7',
  '512J2VIGOTP50qp5MNEUyG',
  '22bdIdviOSWmmYEhQxZ7jw',
  '2IYR0vp28MjOC3l6fsEaAJ',
  '02NhNhhyNfv5OdlJw4jUpj',
  '28ZKQMoNBB0etKXZ97G2SN',
  '4QkEMutmqlltycQry1EuA1',
  '3pWJFrSX6apPzt4inM4zXt',
  '5smHQ1uTrerU8DyRaqTyxh',
  '0S3BCTCKEJAfIWM1DYrvFJ',
  '2hNdpum500dG6mDXs87nbc',
  '40QPuvt8Ft79Bakb0Jc78f',
  '16juc2MOH8gzwTSphwNWVH',
  '0PWWlSKbASPyNM4b9uAoPj',
  '4fR9y3RbOQcMymcBhxe8wE',
  '0VWmEVuQ8tA5iA3cCTrgxa',
  '2qCyMMQ785sPH4Yx25GQZ8',
  '1DmY3Z5K1ljIbevMtT55ED',
  '6P9CHi6Dx26YWHeE3aTZiz',
  '5c28WEDJfq2x37QyKhy9wB',
  '09Q3WwGYsQe5ognkvVkmCu',
  '69jNQvZPFWV49Lmomc5yFB',
  '5WSPnYTQ6YZ1UvBRi5quhO',
  '5wp0BAWwWo7H2rQyvPxS8o',
  '2fKSNl0JCV00PSr31n9RVo',
  '3cZx2rZM5n5quNne6rtHA5',
  '1pb85AjruirkyCxVzAYRH5',
  '0ULfRWHlBOfxe1wYrQFzNv',
  '3gVG3GQyht50J4ivKB9Fh4',
  '4LNuLKpmJrsPA8bxZyTXFc',
  '1yZC8xZwv4gsmCZ4p4JWdI',
  '5Hs43ta4vAYKRRRR7DKjt9',
  '7gvpGnuSbkkipRfLIdz02K',
  '1nqDrIknqoUl758F8trs8H',
  '39WwaUn8HTVZpJJmAuIIHN',
  '4frBEuS3Zw5Ngufm6huK08',
  '7xue2jn8y2BL3EbonL9mup',
  '2lqmfENhUyY0OMYvrqkxpB',
  '5QQWX6DbmrGXLeilJK1eul',
  '7oCJoaSYsCEGcsy6EnK0D1',
  '15VYV9g7bepFE3AcvtAc7o',
  '3jJ5HhbOC2KB5fOZ2RgJTo',
  '7nvi0O7yb3kmeXOwXeR9BQ',
  '5qf9TEgsN87fxwEKsJP2vu',
  '2LSURkxm7ENiWXJl4yx1ED',
  '5amj9zNeZ3B2EdpBgXrOZ0',
  '1Rxx6OWDCfOwlyWLtNEUGw',
  '2Qi2SySN2ePZwMLDSv9Krn',
  '4rncYwFMKLyhdd0yYQH19k',
  '22cFcAQkydpTzeSKQZEKv0',
  '7MYEDRJ19BhB4TycZ1RS8h',
  '64E5px1Lqx9zXSpQ8yoVx5',
  '2Zkvy7eARxR3qjKNWMiwMa',
  '2QuYio1K1TNDyJhXKl81wV',
  '22cFcAQkydpTzeSKQZEKv0',
  '0lMw8xxFLYRSGYRlGzo8uc',
  '7awpB1UEVeDF6h8mGMssTI',
  '0NmzhdoPm5f1LiKBAqbrY2',
  '2Irt2YHEs7cKJv1IR4Nk7u',
  '2XOKt6AVcxdBs1Za7AxGj2',
  '4ZnIw6llQFlXcFgjMNtrTw',
  '4XyQyaNvyvTKUxT6xRHEV9',
  '0nlOewXnENJZgU83zPE1TQ',
  '7hLBZAMHtkfNXPxrbXoVhj',
  '7DY6v8qiyQcsTCqUWjH7pS',
  '399w1uaOvKhnkczdMMZYoy',
  '6BK3muExDOuk0VnyMn9NVw',
  '6yGp5e6Puhx155c8dQ8e6P',
  '01zrTZowtMtqYutWzzDgds',
  '2NVWzjDHYjiOsZuvdkPahB',
  '4EcVVeYCeafIQk383MQfp5',
  '6peEdPVO73WtgGah5sEhX4',
  '268OMXVA2ZlhgYEZ9pTiH6',
  '6FgB290HwL89ZrfEVSZp2c',
  '1Rxx6OWDCfOwlyWLtNEUGw',
  '2Zks3PkvBH0Kl2W1X67VHT',
  '11wzEOXFI1wgBHxKcsbacJ',
  '7gvpGnuSbkkipRfLIdz02K',
  '7lU3y8PuUzeZY6N24JTBqP',
  '0chJtMQf2lYPSbI2Btl5ka',
  '4Csoz10NhNJOrCTUoPBdUD',
  '2p2E3pJSwp4nYopcqCQtps',
  '16juc2MOH8gzwTSphwNWVH',
  '3cQO7jp5S9qLBoIVtbkSM1',
  '4LNuLKpmJrsPA8bxZyTXFc',
  '2IYR0vp28MjOC3l6fsEaAJ',
  '13QoXGJgs22WiDG1NWT00D',
  '1QyVudk5sVVQyFLfdNFPLP',
  '1pb85AjruirkyCxVzAYRH5',
  '2k4SKTM0a5FVN37VvFbxpr',
  '6eZdwrhB97A3EYx9QppGfl',
  '2qCyMMQ785sPH4Yx25GQZ8',
  '15VYV9g7bepFE3AcvtAc7o',
  '5yscEifoZw3M3abIVCr8ed',
  '5q1BjSadVkASNdJ4neVmt6',
  '5qklOJdg6WTDIZc6W1YjDQ',
  '2qczZTZpha2aJyvZuXAoRT',
  '4yJ0xevn2oP1fKzFiNV4r8',
  '34CxcAYNmdugoNQZq2Bl3Z',
  '3x13WsiY5X1Di5mVWqKGD4',
  '1nqDrIknqoUl758F8trs8H',
  '1uVE5jbkiVT4ftXprBFDlr',
  '5ZKto9RhFJgBIeRDM90xss',
  '02NhNhhyNfv5OdlJw4jUpj',
  '6uGOeETMsNfv5alC0XnmyN',
  '5amj9zNeZ3B2EdpBgXrOZ0',
  '7oCJoaSYsCEGcsy6EnK0D1',
  '4QkEMutmqlltycQry1EuA1',
  '09Q3WwGYsQe5ognkvVkmCu',
  '4Io5vWtmV1rFj4yirKb4y4',
  '5Jf4pcpIxqZLzcSkXbr6q3',
  '5I0cpsYbmWXXiseiYuxnW4',
  '1b3PHFDi1ZBV0tj8lROPLQ',
  '5smHQ1uTrerU8DyRaqTyxh',
  '6PmprO3MvzG23cTNTZpQAG',
  '1s6codM2ZAB008t9GTyaEk',
  '3arNdjotCvtiiLFfjKngMc',
  '2lqmfENhUyY0OMYvrqkxpB',
  '7nvi0O7yb3kmeXOwXeR9BQ',
  '2z4c8M8aVzl7CTobIp36KF',
  '0P6KWqoJThIo9r3AA41oa1',
  '2UJwKSBUz6rtW4QLK74kQu',
  '0S3BCTCKEJAfIWM1DYrvFJ',
  '5wp0BAWwWo7H2rQyvPxS8o',
  '512J2VIGOTP50qp5MNEUyG',
  '5WSPnYTQ6YZ1UvBRi5quhO',
  '3jJ5HhbOC2KB5fOZ2RgJTo',
  '22bdIdviOSWmmYEhQxZ7jw',
  '2fBKreCrztEPXW5bUIgBTf',
  '1yZC8xZwv4gsmCZ4p4JWdI',
  '6bfkwBrGYKJFk6Z4QVyjxd',
  '40QPuvt8Ft79Bakb0Jc78f',
  '0anlRE2dYlRqEKL1gj1WPq',
  '0PWWlSKbASPyNM4b9uAoPj',
  '3jJKDKdlwRS584zUlHV2Ly',
  '4p9QlliNvKndyKSPyuJlP8',
  '7xue2jn8y2BL3EbonL9mup',
  '5I3UdCxtIh6hkQ7rMPUvA4',
  '5BFg8l4NYyZ90DWqcBjbt6',
  '5aKquUGkicYT6NcdPrZWWC',
  '4fR9y3RbOQcMymcBhxe8wE',
  '5c28WEDJfq2x37QyKhy9wB',
  '5qf9TEgsN87fxwEKsJP2vu',
  '7nvi0O7yb3kmeXOwXeR9BQ',
  '5Hs43ta4vAYKRRRR7DKjt9',
  '4frBEuS3Zw5Ngufm6huK08',
  '3cZx2rZM5n5quNne6rtHA5',
  '39WwaUn8HTVZpJJmAuIIHN',
  '2LSURkxm7ENiWXJl4yx1ED',
  '3gVG3GQyht50J4ivKB9Fh4',
  '2hNdpum500dG6mDXs87nbc',
  '0VWmEVuQ8tA5iA3cCTrgxa',
  '05XxXIIw1Og2nR3vYfVfA3',
  '28ZKQMoNBB0etKXZ97G2SN',
  '3hA2oZbZwHU8tSPBFIZhFr',
  '6twKQ0EsUJHVlAr6XBylrj',
  '7MYEDRJ19BhB4TycZ1RS8h',
  '2Qi2SySN2ePZwMLDSv9Krn',
  '2O8egayngzl1fm5dcE4VX9',
  '1gMxiQQSg5zeu4htBosASY',
  '6bq2wXFrIO3yp3HOFMhnhM',
  '3cfAM8b8KqJRoIzt3zLKqw']

        var tracksPromises = []
        var tracksWithPopularity = []
        var artistToAlbumDict = {}

        var albumToTracksDict = {}


        var albumToTracksWithPopularity = {}
        /*getSeveralTracksOfAlbum(albumToTracksDict);   
        Promise.all(albumToTracksPromises).then(function() {
          console.log("DONE!!");
          console.log(albumToTracksWithPopularity);
        })*/
        trackPromises = []
        for (index in albumList) {
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
          })})
        
        function sleep(milliseconds) {
          var start = new Date().getTime();
          for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
              break;
            }
          }
        }
        function getRandomArtistsAlbums(options) {
          if (randomArtistsList.length >= 100) {
            Promise.all(randomArtistsPromises).then(function() {
              //console.log("artist list: " + randomArtistsList);
              console.log("got all artists");
              //console.log(artistToPopularityDict);
              //console.log(randomArtistsList);
              albumPromises = []
              for (index in randomArtistsList) {
                artistid = randomArtistsList[index];
                getArtistsAlbum(artistid);
              }
              Promise.all(albumPromises).then(function() {
                
                console.log("got all albums");
                console.log(albumList);
                console.log(artistToAlbumDict);
                trackPromises = []
                for (index in albumList) {
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
                  })
    
                  //getSeveralTracks(tracksIds);
                  /*Promise.all(tracksPromises).then(function() {
                    console.log("DONE!!")
                    console.log(tracksWithPopularity);
                  })*/
               
                })
              });
            });
            //return randomArtistsPromise;
          }
          else {
            var randomArtistsPromise = get(options);
            randomArtistsPromises.push(randomArtistsPromise.then(function (result) {
              var artists = result.artists.items;
              for (index in artists) {
                randomArtistsList.push(artists[index].id);
                //console.log(artists[index].id)
                //console.log(artists[index].popularity)
                //artistToPopularityDict[artists[index].id] = artists[index].popularity
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
            sleep(500);
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
         
          trackPromises.push(trackPromise.then(function (result){
            sleep(1000);
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

        console.log("got an Artist result!!");
        console.log(result);
        console.log(result.genres.length)
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
        if (allTracksList.length > 10) {
          allTracksList = allTracksList.slice(0,10);
        }
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

