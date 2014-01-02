var express   = require('express');
var app       = express();
var jwt       = require('express-jwt');

var SECRET    = 'YOUR_SECRET';
var AUDIENCE  = 'YOUR_AUDIENCE';

var authenticate = jwt({
  secret: new Buffer(SECRET, 'base64'),
  audience: AUDIENCE
});

app.use(express.logger());

app.use('/', express.static(__dirname + '/app'));

app.use('/api', authenticate);

app.get('/api/protected', function (req, res) {
  res.send(200, 'This API Rocks!');
});

app.listen(1337);
console.log('listening on port 1337');
