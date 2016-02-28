var GameViewer = require('../game_viewer.js');
var Handlebars = require('handlebars');

// Templates
var WaitingForPlayers = require('./viewer/waiting_for_players.js');
var WaitingForTeam = require('./viewer/waiting_for_team.js');
var TeamVote = require('./viewer/team_vote.js');
var MissionVote = require('./viewer/mission_vote.js');
var Finished = require('./viewer/finished.js');

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
  this.mafiaWins = status.mafiaWins;
  this.fbiWins = status.fbiWins;

  if(previousStatus !== this.gameStatus) {
    if(this.gameStatus !== 'waiting_for_players' && this.gameStatus !== 'waiting_for_start') this.setupIngameUI();

    if(this.gameStatus === 'waiting_for_players' || (this.gameStatus === 'waiting_for_start' && !previousStatus)) {
      this.currentState = new WaitingForPlayers(this.players, this.gameInfo.minplayers);
    } else if(this.gameStatus === 'waitingForTeam') {
      this.currentState = this.waitingForTeamState();
    } else if(this.gameStatus === 'teamVote') {
      this.currentState = this.teamVoteState();
    } else if(this.gameStatus === 'missionVotes') {
      this.currentState = this.missionVoteState();
    } else if(this.gameStatus === 'finished') {
      this.currentState = new Finished(status.winner);
    }
  }

  if(status.events && !_.isEmpty(status.events) ) this.showTakeover(status.events);

  this.setWins();
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
    container.html(template({players: this.players, animated: true}));
  } else {
    container.html(template({players: this.players, animated: false}));
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

UndercoverViewer.prototype.missionVoteState = function() {
  return new MissionVote(this.currentLeader(), this.team());
}

UndercoverViewer.prototype.setWins = function() {
  var addFbi = this.fbiWins - $("#win-counter-container .fbi").length;
  var addMafia = this.mafiaWins - $("#win-counter-container .mafia").length;

  var source   = $("#win-counter-template").html();
  var template = Handlebars.compile(source);

  _(addFbi).times(function(n){ $("#win-counter-container").append(template({winner: "fbi"})) });
  _(addMafia).times(function(n){ $("#win-counter-container").append(template({winner: "mafia"})) });
}

UndercoverViewer.prototype.showTakeover = function(messages) {
  var source   = $("#takeover-template").html();
  var template = Handlebars.compile(source);
  var takeover = $(template({messages: messages}))

  $("body").append(takeover);
  setTimeout(function(){ takeover.remove() }, 5000);
}

////////////
// Export
////////////
window.UndercoverViewer = UndercoverViewer;
