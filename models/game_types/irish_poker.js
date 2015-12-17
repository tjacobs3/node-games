var cards = require('cards');
var Game = require(__dirname + '/../game.js');

var IrishPoker = function(io) {
  Game.call(this, io);

  this.gameIdentifier = IrishPoker.gameIdentifier;
  this.maxPlayers = 8;
  this.currentTurn = 0;
  this.gameStarted = false;
}

IrishPoker.gameIdentifier = "irish_poker";

IrishPoker.prototype = Object.create(Game.prototype);
IrishPoker.prototype.constructor = IrishPoker;

IrishPoker.prototype.join = function(name){
  if(this.players.length >= this.maxPlayers)
    return null;

  var player = Game.prototype.join.call(this, name);
  this.playerJoined(player);
  return player;
};

IrishPoker.prototype.currentPlayer = function(){
  return this.players[currentTurn];
};

IrishPoker.prototype.incrementTurn = function(){
  currentTurn += 1;
  if(currentTurn >= this.players.length)
    currentTurn = 0;
};

//***************
// EVENTS
//***************

IrishPoker.prototype.playerJoined = function(player) {
  this.io.to(this.slug).emit('player joined', player.name);
}

module.exports = IrishPoker
