var Player = require(__dirname + '/player.js');
var _ = require('underscore')

var Game = function(io) {
  this.io = io;
  this.slug = Game.newSlug();
  this.players = [];
  this.allowsViewer = true;
  this.createdAt = new Date();
  this.timeToLive = 10; // 10 minutes
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

Game.prototype.expired = function() {
  var expectedDate = new Date(this.createdAt.getTime() + this.timeToLive * 60000);
  return (new Date()) > expectedDate;
};


module.exports = Game
