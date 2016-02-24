var GameClient = require('../game_client.js');
var Handlebars = require('handlebars');

// Templates
var WaitingForPlayers = require('./client/waiting_for_players.js');
var ChoosingTeam = require('./client/choosing_team.js');
var ApproveTeam = require('./client/approve_team.js');
var TeamVote = require('./client/team_vote.js');
var MissionVote = require('./client/mission_vote.js');

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
  this.leaderId = status.leaderId;
  this.teamSize = status.teamSize;
  this.players = status.players;

  if(previousStatus !== this.gameStatus) {
    if(this.gameStatus === 'waiting_for_players' || (this.gameStatus === 'waiting_for_start' && !previousStatus)) {
      this.currentState = new WaitingForPlayers(this.players);
    }

    if(this.gameStatus !== 'waiting_for_players' && this.gameStatus !== 'waiting_for_start')
      this.showPlayerList();

    if(this.gameStatus === 'waiting_for_start') {
      this.currentState.enableStartButton(this.startGame.bind(this));
    } else if(this.gameStatus === 'waitingForTeam') {
      this.currentState = this.teamChooseState();

      if(previousStatus === 'waiting_for_start') {
        this.showTeam();
      }
    } else if(this.gameStatus === 'teamVote') {
      this.currentState = this.teamVoteState();
    } else if(this.gameStatus === 'missionVotes') {
      this.currentState = this.missionVoteState();
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

Undercover.prototype.currentLeader = function() {
  var leaderId = this.leaderId;
  return _.find(this.players, function(player){ return leaderId == player.id; });
}

Undercover.prototype.showModal = function(title, body) {
  var source   = $("#modal-template").html();
  var template = Handlebars.compile(source);

  var modal = $(template({title: title, body: body}));
  $("body").append(modal);
  modal.modal();
};

Undercover.prototype.missionVoteState = function() {
  this.currentState = new MissionVote(
    this.localPlayer().onTeam,
    this.submitVote.bind(this)
  );
};

Undercover.prototype.teamVoteState = function() {
  return new TeamVote(this.submitVote.bind(this));
};

Undercover.prototype.teamChooseState = function() {
  if(this.leaderId == this.playerId()) {
    return new ChoosingTeam(this.players, this.teamSize, this.submitTeam.bind(this));
  } else {
    return new ApproveTeam(this.findPlayer(this.leaderId));
  }
};

Undercover.prototype.showTeam = function() {
  this.showModal("The game is about to start", "You are on team " + this.localPlayer().team);
};

Undercover.prototype.showPlayerList = function() {
  if($("#player-list").length) return;

  var source   = $("#player-list-template").html();
  var template = Handlebars.compile(source);

  $("body").append($(template({players: this.players})));
}

/////////////////
// SOCKET ACTIONS
/////////////////
Undercover.prototype.startGame = function() {
  this.socket.emit('perform action', {
    action: "start game",
    gameSlug: this.gameSlug()
  });
}

Undercover.prototype.submitTeam = function(ids) {
  this.socket.emit('perform action', {
    action: "submit team",
    ids: ids,
    gameSlug: this.gameSlug()
  });
}

Undercover.prototype.submitVote = function(vote) {
  this.socket.emit('perform action', {
    action: "vote",
    playerId: this.playerId(),
    vote: vote,
    gameSlug: this.gameSlug()
  });
}

////////////
// Export
////////////
window.Undercover = Undercover;
