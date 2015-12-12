var Player = function(name) {
  this.id = Player.newID();
  this.name = name;
};

Player.newID = function () {
  return Math.floor(Math.random() * 1000000);
};

module.exports = Player
