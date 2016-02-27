var Handlebars = require('handlebars');
var _ = require('underscore');

var TeamVote = function(leader, players) {
  console.log(players);
  var source   = $("#team-vote-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template({name: leader.name, players: players}));
};

module.exports = TeamVote;
