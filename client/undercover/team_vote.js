var Handlebars = require('handlebars');
var _ = require('underscore');

var TeamVote = function(voteFunc) {
  var source   = $("#team-vote-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template());
  var that = this;

  $(".yes-button").click(function() {
    voteFunc(true);
    that.voted();
  });

  $(".no-button").click(function() {
    voteFunc(false);
    that.voted();
  });
};

TeamVote.prototype.voted = function() {
  var source   = $("#voted-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template());
};

module.exports = TeamVote;
