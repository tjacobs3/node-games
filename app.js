//***************
// DEPENDENCY LOADING
//***************
var _ = require('underscore');
var express = require('express');
var layout = require('express-layout');
var jade = require('jade');
var http = require('http');
var socket_io = require('socket.io');
var session = require('express-session');
var bodyParser = require('body-parser');
var browserify = require('browserify-middleware');

// OUR MODELS
var TicTacToe = require(__dirname + '/models/game_types/tic_tac_toe.js');
var IrishPoker = require(__dirname + '/models/game_types/irish_poker.js');
var Undercover = require(__dirname + '/models/game_types/undercover.js');

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

app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.use(session({
  secret: 'sdfasdfsd3nksdf',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

// Views Options
app.use(layout());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Port options
app.set('port', (process.env.PORT || 3000));

//***************
// ROUTERS
//***************

app.get('/', function(req, res, next) {
  res.render('index.jade');
});

app.post('/games', function(req, res, next) {
  var gameType = findGameTypeByIdentifier(req.body.game_identifier);

  if(!(req.body.name || gameType.allowsViewer)) {
    res.locals.warning = "You must enter a name!";
    res.render('index.jade');
  } else {
    g = new gameType(io);
    addGame(g);

    res.locals.game = g;

    if(!!req.body.name) {
      var player = joinGame(g, req.body.name, req);
      res.locals.player = player;
      res.render('games/' + g.gameIdentifier + '.jade');
    } else {
      res.render('games/' + g.gameIdentifier + '_viewer.jade');
    }
  }
});

app.post('/games/join', function(req, res) {
  var game = findGameBySlug(req.body.slug);

  if(!game) {
    res.locals.warning = "Could not find game!";
    res.render('index.jade');
    return;
  }

  var name = req.body.name;
  var player = joinGame(game, name, req);

  if(player == null) {
    if(!!name) {
      res.locals.warning = "Game is full!";
      res.render('index.jade');
    } else {
      if(game.constructor.allowsViewer) {
        res.locals.game = game;
        res.render('games/' + game.gameIdentifier + '_viewer.jade');
      } else {
        res.locals.warning = "You must enter a name!";
        res.render('index.jade');
      }
    }
  } else {
    res.locals.game = game;
    res.locals.player = player;
    res.render('games/' + game.gameIdentifier + '.jade');
  }
});

//***************
// Browserified Games
//***************
app.get('/js/tictactoe.js', browserify('./client/tictactoe/client.js'));
app.get('/js/irish_poker.js', browserify('./client/irish_poker/client.js'));
app.get('/js/irish_poker_viewer.js', browserify('./client/irish_poker/viewer.js'));
app.get('/js/undercover.js', browserify('./client/undercover/client.js'));

//***************
// HELPERS
//***************

function joinGame(game, name, request) {
  var sess = request.session;
  var player;

  // Try to join by saved player id first
  if(sess[game.slug])
    player = game.findPlayer(sess[game.slug]);

  // Try to join game by supplied name
  if(!player && !!name)
    player = game.join(name);

  // Save the player if available
  if(!!player)
    sess[game.slug] = player.id;

  return player;
}

//***************
// SOCKET STUFF
//***************
io.on('connection', function(socket) {
  socket.on('join game', function(msg) {
    socket.join(msg.gameSlug);
  });

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
var games = {}
var gameTypes = [IrishPoker, TicTacToe, Undercover]

// Helpers
function findGameTypeByIdentifier(identifier) {
  var type = _.find(gameTypes, function(type){ return type.gameIdentifier == identifier; });
  return type;
}

function findGameBySlug(slug) {
  return games[slug.toUpperCase()];
};

function addGame(game) {
  games[game.slug.toUpperCase()] = game;
}

function removeGame(game) {
  delete games[game.slug.toUpperCase()];
}

function removeExpiredGames() {
  _.each(_.values(games), function(game) {
    if(game.expired()) removeGame(game);
  });
};


//***************
// SERVER START
//***************
server.listen(app.get('port'));
setInterval(removeExpiredGames, 600000); // 10 minutes
