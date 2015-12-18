var cards = require('cards');
var Game = require(__dirname + '/../game.js');
var _ = require('underscore');

var IrishPoker = function(io) {
  Game.call(this, io);

  this.gameIdentifier = IrishPoker.gameIdentifier;
  this.currentRound = 0;
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
  this.currentTurn += 1;
  if(this.currentTurn >= this.players.length) {
    this.currentTurn = 0;
    this.currentRound += 1;
  }
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
      card = deck.draw();
      card.faceDown = true;
      player.cards.push(card);
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

IrishPoker.prototype.handlePlayerAction = function(playerId, action) {
  if(playerId != this.currentPlayer().id)
    return;

  this.currentPlayer().cards[this.currentRound].faceDown = false;
  this.incrementTurn();

  this.sendStatus();
}

//***************
// SERIALIZER
//***************

IrishPoker.prototype.serialize = function() {
  var players = _.map(this.players, function(player) {
    return {
      id: player.id,
      name: player.name,
      cards: _.map(player.cards, function(card) { return {
        string: card.unicodeString(),
        suit: card.suit,
        faceDown: card.faceDown,
        value: card.value };
      })
    }
  });

  return {
    status: this.status(),
    currentTurn: this.currentPlayer().id,
    currentRound: this.currentRound,
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
    case "player action":
      this.handlePlayerAction(opts.playerId, opts.value);
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
