var Handlebars = require('handlebars');
var _ = require('underscore');

var MissionVote = function(onTeam, voteFunc) {
  if(!onTeam) {
    this.voted();
    return;
  }

  var source   = $("#mission-vote-template").html();
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

MissionVote.prototype.voted = function() {
  var source   = $("#voted-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template());
};


module.exports = MissionVote;
