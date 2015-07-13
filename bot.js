var redis = require('redis');
var requestify = require('requestify');
var spotify = require('spotify');


var client = redis.createClient(9080, "slimehead.redistogo.com");
client.auth("d0c528f75e5ffefabc8c61c73da6d2c0", function () {
  console.log("Connected!");
});

client.on("error", function(err){
  console.log("Error" + err);
});

console.log('Jesse interpret...');

module.exports = {
interpret: function(req, accesstoken, fbtoken){
  if (req.body.text.indexOf("jesse who wrote") > -1){
    return who_wrote(req);
  }else if(req.body.text.indexOf("jesse add song") > -1){
    return add_song(req, accesstoken);
  }else if(req.body.text.indexOf("jesse show song") > -1){
    return show_song(req);
  }else if(req.body.text.indexOf("jesse show user") > -1){
    return show_user(req, accesstoken);
  }else if(req.body.text.indexOf("jesse show playlist") > -1){
    return show_playlist(req, accesstoken);
  }else if(req.body.text.indexOf("jesse show facebook") > -1){
    return show_facebook(fbtoken);
  }else{
    return jesse_quote();
  }
}

}

function add_song(req, accesstoken){
    var stringarray = req.body.text.split(" ");
    var resString = "";
    var jesseRes = "";
    var trackID = "";
    var trackName = "";
    var artistName = "";  
    for (var y = 3; y < stringarray.length; y++){
      resString = resString + " " + stringarray[y];
    }

     spotify.search({ type: 'track', query: resString }, function(err, data) {
        if ( err ) {
          console.log('Error occurred: ' + err);
        return;
        }
        trackID = data.tracks.items[0].id;
        trackName = data.tracks.items[0].name;
        artistName = data.tracks.items[0].artists[0].name;
        jesseRes = "Added song " + trackName + " by " + artistName + " to playlist IntegrationTest" ;
        console.log(jesseRes + " and ID number is " + trackID);
        requestify.request("https://api.spotify.com/v1/users/12161932786/playlists/4ki3iTvKDxb9N7cJY9s4Jh/tracks?uris=spotify:track:" + trackID,
        {
         method: 'POST',
         body: {
          'uris': '[spotify:track:' + trackID +']'
         },
         headers: {
          'Authorization': 'Bearer ' + accesstoken
         },
         dataType: 'json'

        }).then(function(response) {

        requestify.post("https://hooks.slack.com/services/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",
        {
         text : jesseRes

        }).then(function(response) { response.getBody();});

        console.log(trackID);
      });
    });   
    return jesseRes;  
};

function who_wrote(req){
      var str = req.body.text;
      var strarr = str.split(" ");
      var responsestring = "";
      var jesseresponse = "";
      var track = "";
      var artist = "";
      for (var x = 3; x < strarr.length; x++){
        responsestring = responsestring + " " + strarr[x];
      }
      console.log(responsestring);

      spotify.search({ type: 'track', query: responsestring }, function(err, data) {
        if ( err ) {
          console.log('Error occurred: ' + err);
        return;
        }
        track = data.tracks.items[0].name;
        artist = data.tracks.items[0].artists[0].name;
        jesseresponse = "Yo, everybody knows that " + track + " is by " + artist;

        requestify.post("https://hooks.slack.com/services/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",
        {
         text : jesseresponse

        }).then(function(response) { response.getBody();});

        console.log(data.tracks.items[0].name);
        console.log(data.tracks.items[0].artists[0].name);
      });
      return jesseresponse;
};

function show_song(req){
      var str = req.body.text;
      var strarr = str.split(" ");
      var responsestring = "";
      var jesseresponse = "";
      var track = "";
      for (var x = 3; x < strarr.length; x++){
        responsestring = responsestring + " " + strarr[x];
      }
      console.log(responsestring);

      spotify.search({ type: 'track', query: responsestring }, function(err, data) {
        if ( err ) {
          console.log('Error occurred: ' + err);
        return;
        }
        track = data.tracks.items[0].external_urls.spotify;
        jesseresponse = "Take a gander at this tasty jam " + track ;

        requestify.post("https://hooks.slack.com/services/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",
        {
         text : jesseresponse

        }).then(function(response) { response.getBody();});

        console.log(track);
      });
      return jesseresponse;
};

function show_user(req, accesstoken){
    requestify.request("https://api.spotify.com/v1/me",
        {
         method: 'GET',
         body: {
          
         },
         headers: {
          'Authorization': 'Bearer ' + accesstoken
         },
         dataType: 'json'

        }).then(function(response) { 

          var jessetalk = response.getBody();
          console.log(jessetalk);
          var username = jessetalk.display_name;
          var userid = jessetalk.id;

          requestify.post("https://hooks.slack.com/services/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",
          {
          text : "Whats up " + username + "! Your ID is " + userid

          }).then(function(response) { response.getBody();});

    });

      return userid;
};

function jesse_quote(){
      randomint = Math.floor(Math.random()*16) + 1;
      intString = randomint.toString();
      client.get(intString, function(err, reply){
      response = reply;
      console.log(response);
      requestify.post("https://hooks.slack.com/services/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",
      {
      text : response

      }).then(function(response) { response.getBody();});


      });

      return response;
};

function show_facebook(fbtoken){
    requestify.get("https://graph.facebook.com/v2.3/1838326767/music?accesstoken="+ fbtoken)
    .then(function(response) {
     console.log(response.getBody());
   });
};
