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

 var audio = new Audio();

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
          top_artists_info = data.artists;


          var top_artists = []
          for (var i = 0; i < top_artists_info.length; i++) {
            var name = top_artists_info[i].name;
            if (name != null) {
              top_artists.push(name);
            }
          }  
          console.log("Top name!");
          console.log(top_artists_info);
          console.log(top_artists);

          toptrackdict = data.toptrack;
          console.log(toptrackdict);
          rec_artists = data.info;
          recommending = data.recommend;
          console.log(rec_artists);
          console.log("Nice!");
          recArtistPlaceholder.innerHTML = "";
          for (var i = 0; i < rec_artists.length; i++) {
            console.log(rec_artists[i])
            var artist = rec_artists[i];
            var track = toptrackdict[artist.id];
            var imageurl = artist.images[2].url;

            audio.src = track.preview_url;

            recArtistPlaceholder.innerHTML += recArtistTemplate({
              artist: artist,
              track: track.uri
            });
          }
          audio.play();
          console.log(recommending);

          var dim = 1500;

          var pack = d3.layout.pack()
          .size([dim, dim])
          .value(function(d) { return d.size; });

          var svg = d3.select("#artist-viz").append("svg")
          .attr("width", dim)
          .attr("height", dim / 3);

          var node = svg.selectAll(".node")
          .attr("class", "node");

          var defs = svg.append('svg:defs');

          for (var i = 0; i < rec_artists.length; i++) {

            var artist = rec_artists[i];
            var track = toptrackdict[artist.id];
            var imageurl = artist.images[2].url;

            defs.append("svg:pattern")
            .attr("id", artist.id)
            .attr("width", 200)
            .attr("height", 200)
            .attr("patternUnits", "userSpaceOnUse")
            .append("svg:image")
            .attr("xlink:href", imageurl)
            .attr("width", 200)
            .attr("height", 200)
            .attr("x", 0)
            .attr("y", 0);

            var circ = svg.append("circle")
            .attr("r", 100)
            .attr("cx", (i + 1) * 200 + 100)
            .attr("cy", 200+100)
            .attr("id", rec_artists[i].name.split(' ').join('').replace(".",""))
            .style("stroke", "black")  
            .style("stroke-width", 0.25)
            .style("fill", "#666")
            .style("fill", "url(#"+artist.id+")");

            var circ2 = svg.append("circle")
            .attr("r", 40)
            .attr("cx", (i + 1) * 200 + 100)
            .attr("cy", 200+100+140)
            .style("stroke", "black")  
            .style("stroke-width", 0.25);
            //.style("fill", "#666");
            //.style("fill", "url(#"+artist.id+")");


          /*var circ = svg.append("image")
            .attr("xlink:href", imageurl)
            .attr("x", (i + 1) * 300 - 160 - 100)
            .attr("y", 300 - 100)
            .attr("width", 200)
            .attr("height", 200)
            .style("border-radius","5em");*/

            var artist_stem = "https://api.spotify.com/v1/artists/";
            var artist = artist_stem + rec_artists[i].id;

            var to_split = rec_artists[i].name
            if (to_split.substring(0, 22) == "Original Broadway Cast")
              to_split = "OBC " + to_split.substring(23);

            var split_name = to_split.split(" ");

            for (var k = 0; k < split_name.length; k++) {
              svg.append("text")
              .attr("x", (i + 1) * 200 + 100)
              .attr("y", 280 + 30 * k)
              .attr("text-anchor", "middle")
              .text(split_name[k])
              .style("fill", "white")
              .style("font-size", "24px")
              .style("font-weight", "bold")
              .style("text-shadow", "0 0 20px #000");
            }
          }

          var artist_index = 0;
          for (var i = 0; i < 25; i++) {
            if (artist_index < top_artists.length) {
              for (var artist in rec_artists) {
                for (var j = 0; j < recommending[rec_artists[artist].id].length; j++){
                if (recommending[rec_artists[artist].id][j].name == top_artists[artist_index]) {
                  node.append("title")
                  .text(top_artists[i].id);
                  var circ = svg.append("circle")
                  .attr("r", 33)
                  .attr("cx", (i + 1) * 70 - 30)
                  .attr("cy", 90)
                  .attr("id", top_artists[artist_index].split(' ').join('').replace(".",""))
                  .style("stroke", "#00c844")
                  .style("fill", "#009633");

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
                }
              }
              artist_index++;
            }
          }
        }
          for (var key in recommending) {
            for (var i = 0; i < rec_artists.length; i++) {
              if (key == rec_artists[i].id) {
                for (var j = 0; j < key.length; j++) {
                  svg.append('line')
                  .attr("stroke", "black")
                  .attr("stroke-width", "2px")
                  .attr("x1", d3.select("#"+rec_artists[i].name.split(' ').join('').replace(".", '')).attr("cx"))
                  .attr("y1", d3.select("#"+rec_artists[i].name.split(' ').join('').replace(".", '')).attr("cy") - 100)
                  .attr("x2", d3.select("#"+recommending[key][j].name.split(' ').join('').replace(".", '')).attr("cx"))
                  .attr("y2", 123)
                  break;
                }
              }
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
    score = score.toFixed(2);
    var genres = data.genres;
    console.log(data);
    hipsterScorePlaceholder.innerHTML = hipsterScoreTemplate({
      score: score,
      genres: genres.length,
      mostlistenedgenre: data.mostlistengenre,
      allgenres: data.genres,
      popartist: data.popartist,
      obscureartist: data.obscureartist
    });
  });
}, false);


}
})();