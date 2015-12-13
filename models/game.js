var Player = require(__dirname + '/player.js');
var _ = require('underscore')

var Game = function() {
  this.slug = Game.newSlug();
  this.players = [];
};

Game.newSlug = function () {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

Game.prototype.join = function(name) {
  player = new Player(name);
  this.players.push(player);
  return player;
};

Game.prototype.findPlayer = function(id) {
  var player = _.find(this.players, function(player){ return player.id == id; });
  return player;
};

Game.prototype.action = function(opts) {

};

module.exports = Game
