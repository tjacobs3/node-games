var IrishPoker = function() {
  GameClient.call(this);

  this.socket.on('status', this.setStatus.bind(this));

  $("#start-button").click(this.startButtonClicked.bind(this));
  this.setStatus($("#player-info").data("status"));
};

IrishPoker.prototype = Object.create(GameClient.prototype);
IrishPoker.prototype.constructor = IrishPoker;

IrishPoker.prototype.setStatus = function(status) {
  var msg = "";
  switch(status.status) {
    case "waiting_for_game_start":
      msg = "Waiting for game to start";
      break;
    default:
      this.handleGameStarted();
      this.displayCards(status);
      msg = "Player turn: " + status.current_turn;
  }

  $("#status").text(msg);
};

IrishPoker.prototype.displayCards = function(status) {
  var player = this.findPlayer(status, this.playerId());
  $("#my-cards").text(player.cards.join());
};

IrishPoker.prototype.handleGameStarted = function() {
  $("#start-button").remove();
};

IrishPoker.prototype.findPlayer = function(status, id) {
  return _.find(status.players, function(player){ return player.id == id; });
};

IrishPoker.prototype.startButtonClicked = function() {
  this.socket.emit('perform action', {
    action: "start game",
    gameSlug: this.gameSlug()
  });
};

$(function() {
  new IrishPoker();
});
