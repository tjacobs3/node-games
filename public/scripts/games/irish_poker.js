var IrishPoker = function() {
  GameClient.call(this);

  this.socket.on('status', this.setGameState.bind(this));

  $("#start-button").click(this.startButtonClicked.bind(this));

  this.setGameState(this.playerInfo.status);
};

IrishPoker.prototype = Object.create(GameClient.prototype);
IrishPoker.prototype.constructor = IrishPoker;

IrishPoker.prototype.setGameState = function(status) {
  this.gameStatus = status.status;
  this.currentTurn = status.current_turn;
  this.players = status.players;

  this.setTitle();

  if(this.gameStatus != "waiting_for_game_start") {
    this.handleGameStarted();
    this.displayCards();
  }
}

IrishPoker.prototype.setTitle = function() {
  var statusElement = $("#status");
  if(this.gameStatus == "waiting_for_game_start")
    statusElement.text("Waiting for game to start");
  else
    statusElement.text("Player turn: " + this.currentTurn);
};

IrishPoker.prototype.displayCards = function() {
  var player = this.findPlayer(this.playerId());
  $("#my-cards").text(player.cards.join());
};

IrishPoker.prototype.handleGameStarted = function() {
  $("#start-button").remove();
};

IrishPoker.prototype.findPlayer = function(id) {
  return _.find(this.players, function(player){ return player.id == id; });
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
