var GameClient = require('../game_client.js');

var Undercover = function() {
  GameClient.call(this);

  this.socket.on('status', this.setGameState.bind(this));

  $("#start-button").click(this.startButtonClicked.bind(this));

  this.setGameState(this.playerInfo.status);
};

Undercover.prototype = Object.create(GameClient.prototype);
Undercover.prototype.constructor = Undercover;

Undercover.prototype.setGameState = function(status) {
  var previousStatus = this.gameStatus;
  this.gameStatus = status.status;
  this.players = status.players;

  if(this.gameStatus === 'waiting_for_start') {
    this.enableStartButton();
  } else if(this.gameStatus === 'waitingForTeam') {
    this.handleGameStarted();

    if(previousStatus === 'waiting_for_start') {
      this.showTeam();
    }
  }
}

//***************
// UI FOR ROUNDS
//***************

Undercover.prototype.handleGameStarted = function() {
  $("#start-button").remove();
};

Undercover.prototype.showTeam = function() {
  $("#team").text("You are on team " + this.localPlayer().team);
};

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

////////////
// Export
////////////
window.Undercover = Undercover;
