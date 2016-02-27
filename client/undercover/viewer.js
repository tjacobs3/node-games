var GameViewer = require('../game_viewer.js');
var Handlebars = require('handlebars');

// Templates
var WaitingForPlayers = require('./viewer/waiting_for_players.js');
var WaitingForTeam = require('./viewer/waiting_for_team.js');
var TeamVote = require('./viewer/team_vote.js');

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
    if(this.gameStatus !== 'waiting_for_players' && this.gameStatus !== 'waiting_for_start') this.setupIngameUI();

    if(this.gameStatus === 'waiting_for_players' || (this.gameStatus === 'waiting_for_start' && !previousStatus)) {
      this.currentState = new WaitingForPlayers(this.players, this.gameInfo.minplayers);
    } else if(this.gameStatus === 'waitingForTeam') {
      this.currentState = this.waitingForTeamState();
    } else if(this.gameStatus === 'teamVote') {
      this.currentState = this.teamVoteState();
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

UndercoverViewer.prototype.team = function() {
  return _.select(this.players, function(player) { return player.onTeam; });
}

UndercoverViewer.prototype.setupIngameUI = function() {
  $("#page-content").addClass("game-started");
  this.setupPlayerList();
}

UndercoverViewer.prototype.setupPlayerList = function() {
  var source   = $("#player-list-sidebar-template").html();
  var template = Handlebars.compile(source);

  var container = $("#player-list-container");
  if(!container.data('isSet')) {
    container.data('isSet', true);
    container.html(template({players: this.players}));
  }
}

UndercoverViewer.prototype.currentLeader = function() {
  var leaderId = this.leaderId;
  return _.find(this.players, function(player){ return leaderId == player.id; });
}

UndercoverViewer.prototype.waitingForTeamState = function() {
  return new WaitingForTeam(this.currentLeader(), this.teamSize);
}

UndercoverViewer.prototype.teamVoteState = function() {
  return new TeamVote(this.currentLeader(), this.team());
}

////////////
// Export
////////////
window.UndercoverViewer = UndercoverViewer;
