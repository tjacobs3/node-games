var GameViewer = function() {
  this.socket = io();
  this.gameInfo = $("#game-info").data();

  this.socket.emit('join game', {gameSlug: this.gameSlug()});

  that = this;
  this.socket.on('player joined', function(msg){
    that.playerAdded(msg);
  });
};

GameViewer.prototype.playerAdded = function(name) {
  $('#players').append($('<div>').text(msg));
};

GameViewer.prototype.gameSlug = function() {
  return this.gameInfo.gameslug;
};

module.exports = GameViewer
