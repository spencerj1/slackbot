var express = require('express');
var requestify = require('requestify');
var bodyParser = require('body-parser');
var spotify = require('spotify');
var bot = require('./bot.js');
var spotifyAPI = require('spotify-web-api-node');
var url = require ('url');
var app = express();
var port = process.env.PORT || 3000;
var my_client_id1 = '583e97a0ac27412fb2c3a5dab57eb76d';
var redirect_uri1 = 'https://jamesbot8.herokuapp.com/callback';
var clientsecret = 'fed0ca8b2adc44ee84ab03466c178894';
var code1 = 'something';
var idkjson = " whatever ";
var gets = 0;
var token = " ";
var fb_client_id = "1587108354897650";
var fb_client_secret = "fa5f1ad8d9237801dc83f8958d33649b";
var fbtoken = " ";

var spotifyapi = new spotifyAPI({
  clientId : my_client_id1,
  clientSecret : clientsecret,
  redirectUri : redirect_uri1
});

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) { 
res.status(200).send('Success!') });
 
// test route
app.get('/data', function (req, res) {
    var returnData = {
        'trackdata' : []
    };

    var trackObject = {};
    var trackname1 = "";
    var artist1 = "";
    var image_url1 = "";
      console.log("getting playlist info");
    requestify.request("https://api.spotify.com/v1/users/12161932786/playlists/4ki3iTvKDxb9N7cJY9s4Jh",
        {
         method: 'GET',
         body: {
         },
         headers: {
          'Authorization': 'Bearer ' + accesstoken
         },
         dataType: 'json'

        }).then(function(response) {
          console.log(response.getBody());

          for (var z = 0; z < response.getBody().tracks.items.length(); z++){
            trackname1 = response.getBody().tracks.items[z].track.name;
            artist1 = response.getBody().tracks.items[z].track.artists[1].name;
            image_url1 = response.getBody().tracks.items[z].track.album.images[2].url;

            console.log("track: " + trackname1 + "artist: " + artist1 + "image:" + image_url1);

            trackObject = {
                'artist' : trackname1,
                'name' : artist1,
                'image_url' : image_url1
            };
          }
      });




});


app.get('/callback', function (req, res) { 
var queryData = url.parse(req.url, true).query;
if (queryData.code){
  code1 = queryData.code;
  spotifyapi.authorizationCodeGrant(code1)
  .then(function(data){
    console.log('The token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
    console.log('The refresh token is ' + data.body['refresh_token']);

     spotifyapi.setAccessToken(data.body['access_token']);
     spotifyapi.setRefreshToken(data.body['refresh_token']);
     token = data.body['access_token'];
var timer = setInterval(function() {myTimer()}, 1800000);

function myTimer(){
  spotifyapi.refreshAccessToken()
  .then(function(data) {
    console.log('The access token has been refreshed!');
    console.log(data.body['access_token']);
    token = data.body['access_token'];
    spotifyapi.setAccessToken(data.body['access_token']);
    spotifyapi.setRefreshToken(data.body['refresh_token']);
  }, function(err) {
    console.log('Could not refresh access token', err);
  });



  requestify.post("https://hooks.slack.com/services/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",
        {
         text : 'Refreshed the access token'

        }).then(function(response) { response.getBody();});
}


}, function(err) {
    console.log('Something went wrong!', err);
  });
}
  res.sendFile('./playlist.html', { root: __dirname });
});
 

app.get('/login', function(req, res) {
var scopes = 'user-read-private user-read-email playlist-modify-private playlist-modify-public playlist-read-private';
res.redirect('https://accounts.spotify.com/authorize' + 
  '?response_type=code' +
  '&client_id=' + my_client_id1 +
  (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
  '&redirect_uri=' + encodeURIComponent(redirect_uri1));
});

app.get('/fblogin', function(req, res){
res.redirect('https://www.facebook.com/dialog/oauth?client_id=' + fb_client_id + '&redirect_uri=https://jamesbot8.herokuapp.com/fbcallback');
});

app.get('/fbcallback', function(req, res){
  var fbData = url.parse(req.url, true).query;
  if (fbData.code){
    fbcode = fbData.code;
    console.log("Your fb code = " + fbcode);
    console.log("https://graph.facebook.com/v2.3/oauth/access_token?client_id=" + fb_client_id
     + "&redirect_uri=https://jamesbot8.herokuapp.com/fbcallback&client_secret=" + fb_client_secret + "&code=" + fbcode)
    requestify.get("https://graph.facebook.com/v2.3/oauth/access_token?client_id=" + fb_client_id
     + "&redirect_uri=https://jamesbot8.herokuapp.com/fbcallback&scope=user_likes&client_secret=" + fb_client_secret + "&code=" + fbcode)
    .then(function(response) {
     console.log(response);
     console.log(response.getBody());
     console.log("Your facebook accesstoken is " + response.getBody().access_token);
     console.log("Your facebook token_type is " + response.getBody().token_type);
     console.log("Your facebook accesstoken expires in " + response.getBody().expires_in);
     fbtoken = response.getBody().access_token;
   });
    console.log("facebook authentication request sent!");
  }

res.sendFile('./Success.html', { root: __dirname });
});

app.get('/fbsuccess', function(req, res){
  res.sendFile('./playlist.html');
});



var reply = 0;
app.post('/testbot', function(req, res){

reply = bot.interpret(req, token);
console.log(req.body.text);
console.log(reply);

res.status(200).send('Nice Post!');

  //res.send(postHTML);
 });

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});
 
app.listen(port, function () {
  console.log('Slack bot listening on port ' + port);
});

