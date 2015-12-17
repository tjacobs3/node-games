var cards = require('cards');
var Game = require(__dirname + '/../game.js');
var _ = require('underscore');

var IrishPoker = function(io) {
  Game.call(this, io);

  this.gameIdentifier = IrishPoker.gameIdentifier;
  this.maxPlayers = 8;
  this.currentTurn = 0;
  this.gameStarted = false;
}

IrishPoker.gameIdentifier = "irish_poker";
IrishPoker.STATUSES = {
  waiting_for_game_start: "waiting_for_game_start",
  game_started: "game_started"
}

IrishPoker.prototype = Object.create(Game.prototype);
IrishPoker.prototype.constructor = IrishPoker;

IrishPoker.prototype.join = function(name){
  if(this.players.length >= this.maxPlayers)
    return null;

  var player = Game.prototype.join.call(this, name);
  player.cards = [];
  this.playerJoined(player);
  return player;
};

IrishPoker.prototype.currentPlayer = function(){
  return this.players[this.currentTurn];
};

IrishPoker.prototype.incrementTurn = function(){
  currentTurn += 1;
  if(currentTurn >= this.players.length)
    currentTurn = 0;
};

IrishPoker.prototype.startGame = function(){
  if(this.gameStarted) return;

  this.gameStarted = true;
  this.dealCards();
  this.sendStatus();
};

IrishPoker.prototype.dealCards = function() {
  // Create a new 52 card poker deck
  var deck = new cards.PokerDeck();
  deck.shuffleAll();

  _.each(this.players, function(player) {
    for (i = 0; i < 4; i++) {
      player.cards.push(deck.draw());
    }
  });
};

IrishPoker.prototype.status = function() {
  if(!this.gameStarted) {
    return IrishPoker.STATUSES["waiting_for_game_start"];
  } else {
    return IrishPoker.STATUSES["game_started"];
  };
};

//***************
// SERIALIZER
//***************

IrishPoker.prototype.serialize = function() {
  var players = _.map(this.players, function(player) {
    return {
      id: player.id,
      cards: _.map(player.cards, function(card) { return card.unicodeString(); })
    }
  });

  return {
    status: this.status(),
    current_turn: this.currentPlayer().name,
    players: players
  }
}

//***************
// EVENTS
//***************

IrishPoker.prototype.action = function(opts) {
  switch(opts.action) {
    case "start game":
      this.startGame();
      break;
    default:
      // Do nothing
  }
};

IrishPoker.prototype.sendStatus = function() {
  this.io.to(this.slug).emit('status', this.serialize());
}

IrishPoker.prototype.playerJoined = function(player) {
  this.io.to(this.slug).emit('player joined', player.name);
}

module.exports = IrishPoker
