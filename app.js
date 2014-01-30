var express   = require('express');
var app       = express();
var jwt       = require('express-jwt');

var SECRET    = 'A92LWsdBgH6legaUm8U3uyJ7n1bdEik7WvO8nQab9LlHTtnawpRx8d-HPqW0b2g-';
var AUDIENCE  = 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT';

var authenticate = jwt({
  secret: new Buffer(SECRET, 'base64'),
  audience: AUDIENCE
});

app.use(express.logger());

app.use('/', express.static(__dirname + '/'));

app.use('/api', authenticate);

app.get('/api/protected', function (req, res) {
  res.send(200, 'This API Rocks!');
});

/** For custom signup example **/

var Auth0 = require('auth0');
var request = require('request');
var extend = require("xtend");

var api = new Auth0({
  domain:       'contoso.auth0.com',
  clientID:     'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT',
  clientSecret: SECRET
});

var CONNECTION = 'Username-Password-Authentication';

var https = require('https');

app.use(express.bodyParser());

app.use('/custom-signup', function (req, res) {
  api._getAccessToken(function (err, token) {
    if (err) {
      console.log('Error fetching access token: ' + err);
    }

    var data = extend(req.body, {connection: CONNECTION, email_verified: false});

    request.post({url: 'https://contoso.auth0.com/api/users/?access_token=' + token, json: data}, function (e, r, body) {
      if (r.statusCode === 200) {
        res.send(200);
        return;
      }

      res.send(r.statusCode, body);
    });

  });
});

/** ------------------------ **/

app.listen(1337);
console.log('listening on port http://localhost:1337');
