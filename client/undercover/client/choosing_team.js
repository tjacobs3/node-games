var Handlebars = require('handlebars');
var _ = require('underscore');

var ChoosingTeam = function(players, teamSize, submitFunc) {
  var source   = $("#choosing-team-template").html();
  var template = Handlebars.compile(source);

  $("#game-content").html(template({players: players, teamSize: teamSize}));
  this.chosenPlayers = [];
  this.teamSize = teamSize;

  var that = this;
  $(".player-choice").click(function() {
    var btn = $(this);

    if(btn.hasClass("btn-default")) {
      that.chosenPlayers.push(btn.data("player-id"));
    } else {
      that.chosenPlayers = _.reject(that.chosenPlayers, function(id){ return id == btn.data("player-id"); });
    }

    $(this).toggleClass("btn-default");
    $(this).toggleClass("btn-success");
    that.updateSubmitButton();
  });

  $(".choose-team-button").click(function() {
    submitFunc(that.chosenPlayers);
  })
};

ChoosingTeam.prototype.updateSubmitButton = function() {
  var btn = $(".choose-team-button");

  if(this.chosenPlayers.length == this.teamSize) {
    btn.prop('disabled', false);
    btn.text("Submit Your Team");
  } else {
    btn.prop('disabled', true);
    btn.text("Choose " + (this.teamSize - this.chosenPlayers.length) + " more");
  }
};

module.exports = ChoosingTeam
