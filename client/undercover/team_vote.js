var Handlebars = require('handlebars');
var _ = require('underscore');

var TeamVote = function(isLeader) {
  var template = isLeader ? "#team-vote-not-participating-template" : "#team-vote-template";
  var source   = $(template).html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template());
};

module.exports = TeamVote
