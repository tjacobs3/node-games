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
var TicTacToe = require(__dirname + '/models/game_types/tic_tac_toe.js');

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
  g = new TicTacToe();
  games.push(g);
  var player = joinGame(g, req.body.name, req);
  g.io = io;

  res.locals.game = g;
  res.locals.player = player;
  res.render('games/' + g.gameIdentifier + '.jade');
});

app.post('/games/join', function(req, res) {
  var game = findGameBySlug(req.body.slug);
  var player = joinGame(game, req.body.name, req);

  if(player == null) {
    res.locals.warning = "Game is full!";
    res.render('index.jade');
  } else{
    res.locals.game = game;
    res.locals.player = player;
    res.render('games/' + game.gameIdentifier + '.jade');
  }
});


//***************
// HELPERS
//***************

function joinGame(game, name, request) {
  var sess = request.session;
  var player;

  // Try to join by saved player id first
  if(sess[game.slug])
    player = game.findPlayer(sess[game.slug]);

  if(!player)
    player = game.join(name);

  sess[game.slug] = player.id;

  return player;
}

//***************
// SOCKET STUFF
//***************
io.on('connection', function(socket) {
  console.log('Client connected...');

  socket.on('join game', function(msg) {
    socket.join(msg.gameSlug);
  });

  // TODO: Learn how to use channels
  socket.on('perform action', function(msg){
    if(msg.gameSlug) {
      var game = findGameBySlug(msg.gameSlug);
      if(game) {
        game.action(msg)
      }
    }
  });
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
