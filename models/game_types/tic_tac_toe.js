var Game = require(__dirname + '/../game.js');

var TicTacToe = function(io) {
  Game.call(this, io);

  this.gameIdentifier = TicTacToe.gameIdentifier;
  this.maxPlayers = 2;
  this.playerSymbols = {"X": null, "O": null};
  this.currentTurn = "X";
  this.gameBoard = [[], [], []];
  this.gameBoardSize = 3;
  this.winner = null;
}

TicTacToe.gameIdentifier = "tictactoe";

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
    this.checkWinner(symbol, this.currentPlayer());
    this.currentTurn = this.currentTurn == "X" ? "O" : "X";
    this.boardUpdated(x, y, symbol);
  }
  this.currentTurn
};

TicTacToe.prototype.validMove = function(x, y) {
  var occupied = !!this.gameBoard[x][y];
  return this.inBounds(x, y) && !occupied && !this.winner && this.isGameStarted();
};

TicTacToe.prototype.isGameStarted = function() {
  return this.players.length == this.maxPlayers;
};

TicTacToe.prototype.inBounds = function(x, y) {
  var xInBounds = x >= 0 && x < this.gameBoardSize;
  var yInBounds = y >= 0 && y < this.gameBoardSize;
  return xInBounds && yInBounds;
};

TicTacToe.prototype.checkWinner = function(symbol, player) {
  if(!!this.winner) return this.winner;

  for (x = 0; x < this.gameBoardSize; x++) {
    for (y = 0; y < this.gameBoardSize; y++) {
      var    won = this.check3(symbol, x, y, 1, 0);
      won = won || this.check3(symbol, x, y, 0, 1);
      won = won || this.check3(symbol, x, y, 1, 1);
      won = won || this.check3(symbol, x, y, 1, -1);

      if(won) {
        this.winner = player;
      }
    }
  }
};

TicTacToe.prototype.check3 = function(symbol, x, y, dirX, dirY) {
  var count = 0;
  while(this.inBounds(x, y)) {
    if(this.gameBoard[x][y] === symbol)
      ++count;

    x += dirX;
    y += dirY;
  }

  return count == 3;
}

TicTacToe.prototype.getLocation = function(x, y) {
  if(this.inBounds(x, y)) {
    return this.gameBoard[x][y];
  } else {
    return "";
  }
}

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
    this.io.to(this.slug).emit('player joined', player.name);
    this.sendStatus();
  }
}

TicTacToe.prototype.boardUpdated = function(x, y, symbol) {
  this.io.to(this.slug).emit('board updated', {x: x, y: y, symbol: symbol});
  this.sendStatus();
}

TicTacToe.prototype.sendStatus = function() {
  this.io.to(this.slug).emit('status', this.status());
}




module.exports = TicTacToe
