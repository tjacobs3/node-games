var Game = require(__dirname + '/../game.js');
var _ = require('underscore');

var Undercover = function(io) {
  Game.call(this, io);

  this.gameIdentifier = Undercover.gameIdentifier;

  this.mafia = new Team();
  this.fbi = new Team();
  this.maxPlayers = 10;
  this.minPlayers = 2;
  this.electedPlayers = [];
  this.leader = 0;
  this.consecutiveTeamFails = 0;

  this.missionTeamSize = [
    {2:2, 5:2, 6:2, 7:2, 8:3, 9:3, 10:3}, // Round 1
    {2:2, 5:3, 6:3, 7:3, 8:4, 9:4, 10:4}, // Round 2
    {2:2, 5:2, 6:4, 7:3, 8:4, 9:4, 10:4}, // Round 3
    {2:2, 5:3, 6:3, 7:4, 8:5, 9:5, 10:5}, // Round 4
    {2:2, 5:3, 6:4, 7:4, 8:5, 9:5, 10:5} // Round 5
  ];

  this.teamSize = {
    2: [1, 1],
    5: [3,2],
    6: [4,2],
    7: [4,3],
    8: [5,3],
    9: [6,3],
    10: [6,4]
  };

  this.phase = "waiting_for_players";
}

Undercover.gameIdentifier = "undercover";
Undercover.allowsViewer = true;
Undercover.maxConsecutiveTeamVoteFails = 3;
Undercover.gamePhases = [
  "waiting_for_players",
  "waiting_for_start",
  "waitingForTeam",
  "teamVote",
  "missionVotes",
  "finished"
];

Undercover.prototype = Object.create(Game.prototype);
Undercover.prototype.constructor = Undercover;

Undercover.prototype.join = function(name){
  if(this.players.length >= this.maxPlayers || this.isGameStarted())
    return null;

  var player = Game.prototype.join.call(this, name);
  this.playerJoined(player);
  return player;
};

Undercover.prototype.isGameStarted = function() {
  return this.phase !== "waiting_for_players" && this.phase !== "waiting_for_start";
};

Undercover.prototype.startGame = function() {
  if(this.players.length < this.minPlayers) return;

  var mafiaSize = this.teamSize[this.players.length][0];
  var fbiSize = this.teamSize[this.players.length][1];

  this.mafia.players = _.sample(this.players, mafiaSize);
  this.fbi.players = _.difference(this.players, this.mafia.players);

  this.startNewRound();
};

Undercover.prototype.clearPlayerVotes = function() {
  _.each(this.players, function(player) {
    player.vote = null;
  });
};

Undercover.prototype.teamPasses = function() {
  if(_.any(this.players, function(player) { return player.vote == null; }))
    return null;

  var passedVotes = _.select(this.players, function(player) { return player.vote; }).length;
  return passedVotes > Math.floor(this.players.length / 2);
};

Undercover.prototype.missionPasses = function() {
  if(_.any(this.players, function(player) { return player.vote == null; }))
    return null;

  return _.all(this.electedPlayers, function(player) { return player.vote; } );
};

Undercover.prototype.incrementLeader = function() {
  this.leader = this.leader + 1;
  if(this.leader >= this.players.length)
    this.leader = 0;
};

Undercover.prototype.currentRound = function() {
  return this.mafia.wins + this.fbi.wins;
};

Undercover.prototype.roundTeamSize = function(round) {
  return this.missionTeamSize[round][this.players.length];
};

Undercover.prototype.teamForPlayer = function(player) {
  if(_.contains(this.mafia.players, player)) {
    return "mafia";
  } else {
    return "fbi";
  }
};

Undercover.prototype.startNewRound = function(resetTeamFails) {
  if(resetTeamFails === undefined)
    resetTeamFails = true;

  this.electedPlayers = [];
  this.phase = "waitingForTeam";
  this.resetVotes();

  if(resetTeamFails)
    this.consecutiveTeamFails = 0;
};

//***************
// GAME STATES
//***************

Undercover.prototype.checkTeamVotes = function() {
  if(_.any(this.players, function(player) { return player.vote == null }))
    return;

  var teamPasses = this.teamPasses();

  if(teamPasses == false) {
    this.incrementLeader();
    this.startNewRound(false);
    if(this.consecutiveTeamFails >= Undercover.maxConsecutiveTeamVoteFails) {
      this.fbi.wins++;
    }
  } else if(teamPasses == true) {
    this.phase = "missionVotes";
  }

  this.resetVotes();
};

Undercover.prototype.checkMissionVotes = function() {
  if(_.any(this.electedPlayers, function(player) { return player.vote == null }))
    return;

  var missionPasses = this.missionPasses();

  if(missionPasses == false) {
    this.fbi.wins++;
  } else if(missionPasses == true) {
    this.mafia.wins++;
  }

  this.startNewRound();
};

Undercover.prototype.setElectedTeam = function(ids) {
  if(this.phase !== "waitingForTeam") return;

  this.electedPlayers = _.select(this.players, function(player) {
    return _.contains(ids, player.id);
  });

  this.phase = "teamVote";
};

Undercover.prototype.vote = function(playerVote, playerId) {
  var player = this.findPlayer(playerId);
  player.vote = playerVote;
};

Undercover.prototype.resetVotes = function() {
  _.each(this.players, function(player) { player.vote = null; });
};

//***************
// SERIALIZER
//***************

Undercover.prototype.serialize = function() {
  var that = this;

  var players = _.map(this.players, function(player) {
    var onTeam = false;

    if(that.phase === "missionVotes")
      onTeam = _.any(that.electedPlayers, function(electedPlayer) { return player.id === electedPlayer.id});

    return {
      id: player.id,
      name: player.name,
      team: that.teamForPlayer(player),
      onTeam: onTeam
    }
  });

  return {
    status: this.phase,
    leaderId: this.players[this.leader].id,
    players: players,
    teamSize: this.roundTeamSize(this.currentRound())
  }
}

//***************
// EVENTS
//***************

Undercover.prototype.action = function(opts) {
  switch(opts.action) {
    case "start game":
      this.startGame();
      this.sendStatus();
      break;
    case "submit team":
      this.setElectedTeam(opts.ids);
      this.sendStatus();
      break;
    case "vote":
      this.vote(opts.vote, opts.playerId);
      if(this.phase == "teamVote") this.checkTeamVotes();
      else this.checkMissionVotes();
      this.sendStatus();
      break;
    default:
      // Do nothing
  }
};

Undercover.prototype.playerJoined = function(player) {
  this.io.to(this.slug).emit('player joined', player.name);

  if(this.players.length >= this.minPlayers) {
    this.phase = "waiting_for_start";
  }

  this.sendStatus();
}

Undercover.prototype.sendStatus = function() {
  this.io.to(this.slug).emit('status', this.serialize());
}

//***************
// TEAM HELPER CLASS
//***************
var Team = function() {
  this.players = [];
  this.wins = 0;
}

module.exports = Undercover
