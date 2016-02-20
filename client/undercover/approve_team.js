var Handlebars = require('handlebars');
var _ = require('underscore');

var ApproveTeam = function(leader) {
  var source   = $("#approve-team-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template(leader));
};

module.exports = ApproveTeam
