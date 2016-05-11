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

  var recArtistSource = document.getElementById('rec-artist-template').innerHTML,
      recArtistTemplate = Handlebars.compile(recArtistSource),
      recArtistPlaceholder = document.getElementById('rec-artists');
  
  var hipsterScoreSource = document.getElementById('hipster-score-template').innerHTML,
      hipsterScoreTemplate = Handlebars.compile(hipsterScoreSource),
      hipsterScorePlaceholder = document.getElementById('score-view');

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

    document.getElementById('get-basic-recommendations').addEventListener('click', function() {
      $.ajax({
        url: '/get_basic_recommendations',
        data: {
          'access_token': access_token
        }
      }).done(function(data) {
        top_artists = data.artists;
        toptrackdict = data.toptrack;
        console.log(toptrackdict)
        rec_artists = data.info;
        recommending = data.recommend;
        console.log(rec_artists);
        console.log("Nice!");
        recArtistPlaceholder.innerHTML = "";
        for (var i = 0; i < rec_artists.length; i++) {
          console.log(rec_artists[i])
          var artist = rec_artists[i];
          var track = toptrackdict[artist.id]
          recArtistPlaceholder.innerHTML += recArtistTemplate({
            artist: artist,
            track: track.uri
          });
        }
        console.log(recommending);
        var dim = 1550;

        var pack = d3.layout.pack()
          .size([dim, dim])
          .value(function(d) { return d.size; });

        var svg = d3.select("#artist-viz").append("svg")
          .attr("width", dim)
          .attr("height", dim / 3);

        var node = svg.selectAll(".node")
          .attr("class", "node");

        for (var i = 0; i < rec_artists.length; i++) {
          var circ = svg.append("circle")
            .attr("r", 125)
            .attr("cx", (i + 1) * 300 - 160)
            .attr("cy", 300)
            .style("fill", "#5c1070");

          var artist_stem = "https://api.spotify.com/v1/artists/";
          var artist = artist_stem + rec_artists[i].id;

          var to_split = rec_artists[i].name
          if (to_split.substring(0, 22) == "Original Broadway Cast")
            to_split = "OBC " + to_split.substring(23);

          var split_name = to_split.split(" ");

          for (var k = 0; k < split_name.length; k++) {
            svg.append("text")
              .attr("x", (i + 1) * 300 - 160)
              .attr("y", 280 + 30 * k)
              .attr("text-anchor", "middle")
              .text(split_name[k])
              .style("fill", "white")
              .style("font-size", "24px")
              .style("font-weight", "bold");
          }
        }

        var artist_index = 0;
        for (var i = 0; i < 25; i++) {
          if (artist_index < top_artists.length) {
            node.append("title")
              .text(top_artists[i]);
            var circ = svg.append("circle")
              .attr("r", 33)
              .attr("cx", (i + 1) * 70 - 30)
              .attr("cy", 90)
              .style("fill", "#102372");
            
            var artist_stem = "https://api.spotify.com/v1/artists/";
            var artist = artist_stem + top_artists[artist_index].id;

            var to_split = top_artists[artist_index]
            if (to_split.substring(0, 22) == "Original Broadway Cast")
              to_split = "OBC " + to_split.substring(23);

            var split_name = to_split.split(" ");

            for (var k = 0; k < split_name.length; k++) {
              svg.append("text")
                .attr("x", (i + 1) * 70 - 30)
                .attr("y", 80 + 10 * k)
                .attr("text-anchor", "middle")
                .text(split_name[k])
                .style("fill", "white")
                .style("font-size", "10px");
            }
            artist_index++;
         }
        }
      });
    }, false);



    document.getElementById('get-hipster-score').addEventListener('click', function() {
      $.ajax({
        url: '/get_hipster_score',
        data: {
          'access_token': access_token
        }
      }).done(function(data) {

        var score = data.score;
        var genres = data.genres;
        console.log(data);
        hipsterScorePlaceholder.innerHTML = hipsterScoreTemplate({
            score: score,
            genres: Object.keys(genres).length
          });
      });
    }, false);


  }
})();