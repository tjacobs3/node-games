var GameViewer = require('../game_viewer.js');
var Handlebars = require('handlebars');

// Templates
var WaitingForPlayers = require('./viewer/waiting_for_players.js');
var WaitingForTeam = require('./viewer/waiting_for_team.js');

var UndercoverViewer = function() {
  GameViewer.call(this);

  this.socket.on('status', this.setGameState.bind(this));

  this.setGameState(this.gameInfo.status);
};

UndercoverViewer.prototype = Object.create(GameViewer.prototype);
UndercoverViewer.prototype.constructor = UndercoverViewer;

UndercoverViewer.prototype.setGameState = function(status) {
  var previousStatus = this.gameStatus;
  this.gameStatus = status.status;
  this.players = status.players;
  this.leaderId = status.leaderId;
  this.teamSize = status.teamSize;

  if(previousStatus !== this.gameStatus) {
    if(this.gameStatus === 'waiting_for_players' || (this.gameStatus === 'waiting_for_start' && !previousStatus)) {
      this.currentState = new WaitingForPlayers(this.players, this.gameInfo.minplayers);
    } else if(this.gameStatus === 'waitingForTeam') {
      this.currentState = this.waitingForTeamState();
    }
  }
}

//***************
// Events
//***************

UndercoverViewer.prototype.playerAdded = function(name) {
  this.currentState.addPlayer({name: name});
}

//***************
// UI FOR ROUNDS
//***************

UndercoverViewer.prototype.currentLeader = function() {
  var leaderId = this.leaderId;
  return _.find(this.players, function(player){ return leaderId == player.id; });
}

UndercoverViewer.prototype.waitingForTeamState = function() {
  return new WaitingForTeam(this.currentLeader(), this.teamSize);
}

////////////
// Export
////////////
window.UndercoverViewer = UndercoverViewer;
