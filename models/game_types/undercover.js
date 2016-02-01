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

  this.missionTeamSize = [
    {5:2, 6:2, 7:2, 8:3, 9:3, 10:3}, // Round 1
    {5:3, 6:3, 7:3, 8:4, 9:4, 10:4}, // Round 2
    {5:2, 6:4, 7:3, 8:4, 9:4, 10:4}, // Round 3
    {5:3, 6:3, 7:4, 8:5, 9:5, 10:5}, // Round 4
    {5:3, 6:4, 7:4, 8:5, 9:5, 10:5} // Round 5
  ];

  this.teamSize = {
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

  this.phase = "waitingForTeam";
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

//***************
// GAME STATES
//***************

Undercover.prototype.checkTeamVotes = function() {
  var teamPasses = this.teamPasses();

  if(teamPasses == false) {
    this.incrementLeader();
  } else if(teamPasses == true) {
    this.phase = "missionVotes";
  }
};

Undercover.prototype.checkMissionVotes = function() {
  var missionPasses = this.missionPasses();

  if(missionPasses == false) {
    this.fbi.wins++;
  } else if(missionPasses == true) {
    this.mafia.wins++;
    this.phase = "waitingForTeam";
  }
};

//***************
// SERIALIZER
//***************

Undercover.prototype.serialize = function() {
  var players = _.map(this.players, function(player) {
    return {
      id: player.id,
      name: player.name
    }
  });

  return {
    status: this.phase,
    players: players
  }
}

//***************
// EVENTS
//***************

Undercover.prototype.action = function(opts) {
  switch(opts.action) {
    case "start game":
      this.startGame();
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
