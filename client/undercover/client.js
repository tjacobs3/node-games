var GameClient = require('../game_client.js');
var Handlebars = require('handlebars');

// Templates
var WaitingForPlayers = require('./waiting_for_players.js')

var Undercover = function() {
  GameClient.call(this);

  this.socket.on('status', this.setGameState.bind(this));

  this.setGameState(this.playerInfo.status);
};

Undercover.prototype = Object.create(GameClient.prototype);
Undercover.prototype.constructor = Undercover;

Undercover.prototype.setGameState = function(status) {
  var previousStatus = this.gameStatus;
  this.gameStatus = status.status;
  this.players = status.players;

  if(previousStatus !== this.gameStatus) {
    if(this.gameStatus === 'waiting_for_players' || (this.gameStatus === 'waiting_for_start' && !previousStatus)) {
      this.currentState = new WaitingForPlayers(this.players);
    }

    if(this.gameStatus === 'waiting_for_start') {
      this.currentState.enableStartButton(this.startButtonClicked.bind(this));
    } else if(this.gameStatus === 'waitingForTeam') {
      this.handleGameStarted();

      if(previousStatus === 'waiting_for_start') {
        this.showTeam();
      }
    }
  }
}

//***************
// Events
//***************

Undercover.prototype.playerAdded = function(name) {
  this.currentState.addPlayer({name: name});
}

//***************
// UI FOR ROUNDS
//***************

Undercover.prototype.showModal = function(title, body) {
  var source   = $("#modal-template").html();
  var template = Handlebars.compile(source);


  var modal = $(template({title: title, body: body}));
  $("body").append(modal);
  modal.modal();
};

Undercover.prototype.handleGameStarted = function() {
  $("#start-button").remove();
};

Undercover.prototype.showTeam = function() {
  this.showModal("The game is about to start", "You are on team " + this.localPlayer().team);
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
