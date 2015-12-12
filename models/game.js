var Player = require(__dirname + '/player.js');

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

module.exports = Game
