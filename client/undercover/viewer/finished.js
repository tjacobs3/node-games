var Handlebars = require('handlebars');
var _ = require('underscore');

var Finished = function(winner) {
  var source   = $("#finished-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template({winner: winner}));
};

module.exports = Finished;
