var express = require('express');
var app = express();

function requireHTTPS(req, res, next) {
  if (req.get('host').indexOf('localhost') != 0 &&
      req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === "http") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

app.use(requireHTTPS);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.redirect('/remote-expert.html');
});

var port = process.env.PORT || 3000;

var server = app.listen(port, function() {
  console.log('Remote expert running on port', port);
});
