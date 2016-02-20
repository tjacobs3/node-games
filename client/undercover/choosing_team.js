var Handlebars = require('handlebars');
var _ = require('underscore');

var ChoosingTeam = function(players) {
  var source   = $("#choosing-team-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template({players: players}));
  var chosenPlayers = [];
  var availablePlayers = players;
};

ChoosingTeam.prototype.addPlayer = function(player) {
  var source   = $("#player-info-block-template").html();
  var template = Handlebars.compile(source);

  $("#players").append(template(player));
};

module.exports = ChoosingTeam
