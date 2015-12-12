//***************
// DEPENDENCY LOADING
//***************
var _ = require('underscore')
var express = require('express');
var layout = require('express-layout');
var jade = require('jade');
var http = require('http');
var socket_io = require('socket.io');
var session = require('express-session');
var bodyParser = require('body-parser');

// OUR MODELS
var Game = require(__dirname + '/models/game.js');

//***************
// EXPRESS SETUP
//***************
var app = express();
var server = require('http').createServer(app);
var io = socket_io(server);

// Parse forms as json
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(express.static('public'));
app.use(session({ secret: 'sdfasdfsd3nksdf', cookie: { maxAge: 60000 }}))

// Views Options
app.use(layout());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

//***************
// ROUTERS
//***************

app.get('/', function(req, res, next) {
  res.render('index.jade');
});

app.post('/games', function(req, res, next) {
  g = new Game();
  games.push(g);
  var player = g.join(req.body.name);

  res.locals.game = g;
  res.locals.player = player;
  res.render('games/show.jade');
});

app.post('/games/join', function(req, res) {
  var game = findGameBySlug(req.body.slug);
  var player = game.join(req.body.name);
  io.emit('player joined', player.name);

  res.locals.game = g;
  res.locals.player = player;
  res.render('games/show.jade');
});


// SOCKET STUFF
io.on('connection', function(socket) {
  console.log('Client connected...');
});

//***************
// GAME STORE
//***************
var games = []

// Helpers
function findGameBySlug(slug) {
  var game = _.find(games, function(game){ return game.slug == slug; });
  return game;
};


//***************
// SERVER START
//***************
server.listen(3000);
