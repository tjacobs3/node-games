var Game = require(__dirname + '/../game.js');

var TicTacToe = function() {
  Game.call(this);

  this.gameIdentifier = "tictactoe";
  this.maxPlayers = 2;
  this.playerSymbols = {"X": null, "O": null};
  this.currentTurn = "X";
  this.gameBoard = [[], [], []];
  this.gameBoardSize = 3;
  this.winner = null;
}

TicTacToe.prototype = Object.create(Game.prototype);
TicTacToe.prototype.constructor = TicTacToe;

TicTacToe.prototype.join = function(name){
  if(this.players.length >= this.maxPlayers)
    return null;

  var player = Game.prototype.join.call(this, name);
  this.assignPlayerToSymbol(player);
  this.playerJoined(player);
  return player;
};

TicTacToe.prototype.assignPlayerToSymbol = function(player) {
  if(!this.playerSymbols["X"]) {
    this.playerSymbols["X"] = player;
  } else {
    this.playerSymbols["O"] = player;
  }
};

TicTacToe.prototype.currentPlayer = function() {
  return this.playerSymbols[this.currentTurn];
};

TicTacToe.prototype.status = function() {
  if(this.winner) {
    return this.winner.name + " WON!!!!";
  } else if(this.players.length == this.maxPlayers) {
    return "Player Turn: " + this.currentPlayer().name;
  } else {
    return "Waiting for someone to join";
  }
};

TicTacToe.prototype.makeMove = function(x, y) {
  if(this.validMove(x, y)) {
    var symbol = this.currentTurn;
    this.gameBoard[x][y] = this.currentTurn;
    this.currentTurn = this.currentTurn == "X" ? "O" : "X";
    this.boardUpdated(x, y, symbol);
  }
  this.currentTurn
};

TicTacToe.prototype.validMove = function(x, y) {
  var inBounds = x >= 0 && x < this.gameBoardSize && y >= 0 && y < this.gameBoardSize;
  var occupied = !!this.gameBoard[x][y];
  return inBounds && !occupied && !this.winner && this.isGameStarted();
};

TicTacToe.prototype.isGameStarted = function() {
  return this.players.length == this.maxPlayers;
};

//***************
// EVENTS
//***************

TicTacToe.prototype.action = function(opts) {
  var player = this.findPlayer(opts.playerId);
  if(player.id == this.currentPlayer().id) {
    this.makeMove(opts.x, opts.y);
  }
};

TicTacToe.prototype.playerJoined = function(player) {
  if(this.isGameStarted()) {
    this.io.emit('player joined', player.name);
    this.sendStatus();
  }
}

TicTacToe.prototype.boardUpdated = function(x, y, symbol) {
  this.io.emit('board updated', {x: x, y: y, symbol: symbol});
  this.sendStatus();
}

TicTacToe.prototype.sendStatus = function() {
  this.io.emit('status', this.status());
}




module.exports = TicTacToe
