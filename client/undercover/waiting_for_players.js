var Handlebars = require('handlebars');
var _ = require('underscore');

var WaitingForPlayers = function(players) {
  var source   = $("#waiting-players-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template());
  _.each(players, this.addPlayer);
};

WaitingForPlayers.prototype.addPlayer = function(player) {
  var source   = $("#player-info-block-template").html();
  var template = Handlebars.compile(source);

  $("#players").append(template(player));
};

WaitingForPlayers.prototype.enableStartButton = function(callback) {
  $("#start-button").text("START GAME");
  $("#start-button").removeClass("disabled");
  $("#start-button").click(callback);
};

module.exports = WaitingForPlayers
