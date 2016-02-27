var Handlebars = require('handlebars');
var _ = require('underscore');

var Finished = function() {
  var source   = $("#finished-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template());
};

module.exports = Finished
