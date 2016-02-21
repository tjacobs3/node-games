var Handlebars = require('handlebars');
var _ = require('underscore');

var MissionVote = function(voteFunc) {
  var source   = $("#mission-vote-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template());
};

module.exports = MissionVote;
