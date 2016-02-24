var Handlebars = require('handlebars');
var _ = require('underscore');

var WaitingForPlayers = function(players, minPlayers) {
  this.minPlayers = minPlayers;
  this.totalPlayers = players.length;
  var source   = $("#waiting-players-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template());
  _.each(players, this.addPlayer);
};

WaitingForPlayers.prototype.addPlayer = function(player) {
  this.totalPlayers++;
  var source   = $("#player-info-block-template").html();
  var template = Handlebars.compile(source);
  $("#players").append(template(player));

  var needPlayers = this.minPlayers - this.totalPlayers;
  if(needPlayers > 0) {
    $(".playerCount").text(needPlayers);
  } else {
    $(".waitingForPlayersSubHeadline").remove();
  }
};

module.exports = WaitingForPlayers;
