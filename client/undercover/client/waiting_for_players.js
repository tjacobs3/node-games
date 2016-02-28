var Handlebars = require('handlebars');
var _ = require('underscore');

var WaitingForPlayers = function(players) {
  var source   = $("#waiting-players-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template());
};

WaitingForPlayers.prototype.addPlayer = function(player) {
  // Do nothing
};

WaitingForPlayers.prototype.enableStartButton = function(callback) {
  $("#start-button").text("START GAME");
  $("#start-button").removeClass("disabled");
  $("#start-button").click(callback);
};

module.exports = WaitingForPlayers
