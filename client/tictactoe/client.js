var GameClient = require('../game_client.js');

var TicTacToe = function() {
  GameClient.call(this);

  this.socket.on('status', function(msg){
    $('#status').text(msg);
  });

  this.socket.on('board updated', function(msg) {
    var cell = $(".cell[data-x='" + msg.x + "'][data-y='" + msg.y + "']");
    cell.text(msg.symbol);
    cell.addClass(msg.symbol);
  });

  $(".cell").click(this.cellClicked.bind(this));
}

TicTacToe.prototype = Object.create(GameClient.prototype);
TicTacToe.prototype.constructor = TicTacToe;

TicTacToe.prototype.cellClicked = function(event) {
  this.socket.emit('perform action', {
    playerId: this.playerId(),
    gameSlug: this.gameSlug(),
    x: $(event.target).data("x"),
    y: $(event.target).data("y")
  });
}

////////////
// Export
////////////
window.TicTacToe = TicTacToe;
