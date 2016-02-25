var Handlebars = require('handlebars');
var _ = require('underscore');

var WaitingForTeam = function(leader, teamSize) {
  var source   = $("#waiting-for-team-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template({name: leader.name, teamsize: teamSize}));
};

module.exports = WaitingForTeam;
