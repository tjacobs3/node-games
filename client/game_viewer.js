var GameViewer = function() {
  this.socket = io();
  this.gameInfo = $("#game-info").data();

  this.socket.emit('join game', {gameSlug: this.gameSlug()});

  this.socket.on('player joined', function(msg){
    $('#players').append($('<div>').text(msg));
  });
};

GameViewer.prototype.gameSlug = function() {
  return this.gameInfo.gameslug;
};

module.exports = GameViewer
