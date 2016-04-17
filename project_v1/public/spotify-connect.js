/*
Aquires Login tokens from spotify and gets data 

*/


(function() {

  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  var userProfileSource = document.getElementById('user-profile-template').innerHTML,
      userProfileTemplate = Handlebars.compile(userProfileSource),
      userProfilePlaceholder = document.getElementById('user-profile');

  var oauthSource = document.getElementById('oauth-template').innerHTML,
      oauthTemplate = Handlebars.compile(oauthSource),
      oauthPlaceholder = document.getElementById('oauth');

  var musicList = document.getElementById('playlists');

  var params = getHashParams();

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {
      // render oauth info
      oauthPlaceholder.innerHTML = oauthTemplate({
        access_token: access_token,
        refresh_token: refresh_token
      });

      $.ajax({
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            userProfilePlaceholder.innerHTML = userProfileTemplate(response);

            $('#login').hide();
            $('#loggedin').show();
          }
      });
      /*$.ajax({
          url: 'https://api.spotify.com/v1/me/playlists',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            userProfilePlaceholder.innerHTML = userProfileTemplate(response);

            console.log(response);
            for (var i = 0; i < response.items.length; i++) {
              musicList.innerHTML += response.items[i].name + "<br>";
              $.ajax({
                url: response.items[i]['tracks']['href'],
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                  userProfilePlaceholder.innerHTML = userProfileTemplate(response);

                  console.log(response);
                  for (var i = 0; i < response.items.length; i++) {
                    musicList.innerHTML += "--" + response.items[i].track.name + "<br>";
                    
                  }

                  $('#login').hide();
                  $('#loggedin').show();
                }
              });
            }

            $('#login').hide();
            $('#loggedin').show();
          }
      });*/
    } else {
        // render initial screen
        $('#login').show();
        $('#loggedin').hide();
    }

    document.getElementById('obtain-new-token').addEventListener('click', function() {
      $.ajax({
        url: '/refresh_token',
        data: {
          'refresh_token': refresh_token
        }
      }).done(function(data) {
        access_token = data.access_token;
        oauthPlaceholder.innerHTML = oauthTemplate({
          access_token: access_token,
          refresh_token: refresh_token
        });
      });
    }, false);

    document.getElementById('get-basic-recommendations').addEventListener('click', function() {
      $.ajax({
        url: '/get_basic_recommendations',
        data: {
          'access_token': access_token
        }
      }).done(function(data) {
        top_artists = data.items;
        console.log(top_artists);
        console.log("Nice!");
        /*oauthPlaceholder.innerHTML = oauthTemplate({
          access_token: access_token,
          refresh_token: refresh_token
        });*/
      });
    }, false);


  }
})();