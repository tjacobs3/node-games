var GameClient = function() {
  this.socket = io();
  this.playerInfo = $("#player-info").data();

  this.socket.emit('join game', {gameSlug: this.gameSlug()});

  this.socket.on('player joined', function(msg){
    $('#players').append($('<div>').text(msg));
  });
};

GameClient.prototype.playerId = function() {
  return this.playerInfo.playerid;
};

GameClient.prototype.gameSlug = function() {
  return this.playerInfo.gameslug;
};

GameClient.prototype.localPlayer = function(id) {
  return this.findPlayer(this.playerId());
};


GameClient.prototype.findPlayer = function(id) {
  return _.find(this.players, function(player){ return player.id == id; });
};


module.exports = GameClient
