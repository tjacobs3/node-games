var Handlebars = require('handlebars');
var _ = require('underscore');

var MissionVote = function(leader, players) {
  var source   = $("#mission-vote-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template({name: leader.name, players: players}));
};

module.exports = MissionVote;
