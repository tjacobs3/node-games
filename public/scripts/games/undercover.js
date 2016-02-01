var Undercover = function() {
  GameClient.call(this);

  this.socket.on('status', this.setGameState.bind(this));

  $("#start-button").click(this.startButtonClicked.bind(this));

  this.setGameState(this.playerInfo.status);
};

Undercover.prototype = Object.create(GameClient.prototype);
Undercover.prototype.constructor = Undercover;

Undercover.prototype.setGameState = function(status) {
  this.gameStatus = status.status;

  if(this.gameStatus === 'waiting_for_start') {
    this.enableStartButton();
  }
}

//***************
// UI FOR ROUNDS
//***************

Undercover.prototype.enableStartButton = function() {
  $("#start-button").text("START GAME");
  $("#start-button").removeClass("disabled");
}

Undercover.prototype.startButtonClicked = function() {
  this.socket.emit('perform action', {
    action: "start game",
    gameSlug: this.gameSlug()
  });
}

$(function() {
  new Undercover();
});
