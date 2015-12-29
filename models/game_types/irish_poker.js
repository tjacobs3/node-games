var cards = require('cards');
var Game = require(__dirname + '/../game.js');
var _ = require('underscore');

var IrishPoker = function(io) {
  Game.call(this, io);

  this.gameIdentifier = IrishPoker.gameIdentifier;
  this.currentRound = 0;
  this.maxPlayers = 8;
  this.currentTurn = 0;
  this.gameStarted = false;
}

IrishPoker.gameIdentifier = "irish_poker";
IrishPoker.STATUSES = {
  waiting_for_game_start: "waiting_for_game_start",
  game_started: "game_started"
}
IrishPoker.CARD_VALUES = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14
}

IrishPoker.prototype = Object.create(Game.prototype);
IrishPoker.prototype.constructor = IrishPoker;

IrishPoker.prototype.join = function(name){
  if(this.players.length >= this.maxPlayers)
    return null;

  var player = Game.prototype.join.call(this, name);
  player.cards = [];
  this.playerJoined(player);
  return player;
};

IrishPoker.prototype.currentPlayer = function(){
  return this.players[this.currentTurn];
};

IrishPoker.prototype.incrementTurn = function(){
  this.currentTurn += 1;
  if(this.currentTurn >= this.players.length) {
    this.currentTurn = 0;
    this.currentRound += 1;
  }
};

IrishPoker.prototype.startGame = function(){
  if(this.gameStarted) return;

  this.gameStarted = true;
  this.dealCards();
  this.sendStatus();
};

IrishPoker.prototype.dealCards = function() {
  // Create a new 52 card poker deck
  var deck = new cards.PokerDeck();
  deck.shuffleAll();

  _.each(this.players, function(player) {
    for (i = 0; i < 4; i++) {
      card = deck.draw();
      card.faceDown = true;
      player.cards.push(card);
    }
  });
};

IrishPoker.prototype.status = function() {
  if(!this.gameStarted) {
    return IrishPoker.STATUSES["waiting_for_game_start"];
  } else {
    return IrishPoker.STATUSES["game_started"];
  };
};

IrishPoker.prototype.handlePlayerAction = function(playerId, action) {
  if(playerId != this.currentPlayer().id)
    return;

  switch(this.currentRound) {
    case 0:
      this.handleRedBlack(action);
      break;
    case 1:
      this.handleOverUnder(action);
      break;
    case 2:
      this.handleInsideOutside(action);
      break;
    case 3:
      this.handleSuit(action);
      break;
  }

  this.currentPlayer().cards[this.currentRound].faceDown = false;
  this.incrementTurn();

  this.sendStatus();
}

IrishPoker.prototype.handleRedBlack = function(action) {
  var card = this.currentPlayer().cards[this.currentRound];
  if(action == "red") {
    if (card.suit == "heart" || card.suit == "diamond")
      this.sendMessage(this.currentPlayer().name + " guessed RED and was CORRECT");
    else
      this.sendMessage(this.currentPlayer().name + " guessed RED and was WRONG");
  } else {
    if (card.suit == "spade" || card.suit == "club")
      this.sendMessage(this.currentPlayer().name + " guessed BLACK and was CORRECT");
    else
      this.sendMessage(this.currentPlayer().name + " guessed BLACK and was WRONG");
  }
}

IrishPoker.prototype.handleOverUnder = function(action) {
  var lastCard = this.currentPlayer().cards[this.currentRound - 1];
  var card = this.currentPlayer().cards[this.currentRound];

  if(action == "over") {
    if (IrishPoker.CARD_VALUES[card.value] > IrishPoker.CARD_VALUES[lastCard.value])
      this.sendMessage(this.currentPlayer().name + " guessed OVER and was CORRECT");
    else
      this.sendMessage(this.currentPlayer().name + " guessed OVER and was WRONG");
  } else {
    if (IrishPoker.CARD_VALUES[card.value] < IrishPoker.CARD_VALUES[lastCard.value])
      this.sendMessage(this.currentPlayer().name + " guessed UNDER and was CORRECT");
    else
      this.sendMessage(this.currentPlayer().name + " guessed UNDER and was WRONG");
  }
}

IrishPoker.prototype.handleInsideOutside = function(action) {
  var firstCard = this.currentPlayer().cards[this.currentRound - 2];
  var secondCard = this.currentPlayer().cards[this.currentRound - 1];
  var card = this.currentPlayer().cards[this.currentRound];

  if(action == "inside") {
    if (this.numberInside(IrishPoker.CARD_VALUES[card.value], IrishPoker.CARD_VALUES[firstCard.value], IrishPoker.CARD_VALUES[secondCard.value]))
      this.sendMessage(this.currentPlayer().name + " guessed INSIDE and was CORRECT");
    else
      this.sendMessage(this.currentPlayer().name + " guessed INSIDE and was WRONG");
  } else {
    if (this.numberOutside(IrishPoker.CARD_VALUES[card.value], IrishPoker.CARD_VALUES[firstCard.value], IrishPoker.CARD_VALUES[secondCard.value]))
      this.sendMessage(this.currentPlayer().name + " guessed OUTSIDE and was CORRECT");
    else
      this.sendMessage(this.currentPlayer().name + " guessed OUTSIDE and was WRONG");
  }
}

IrishPoker.prototype.handleSuit = function(action) {
  var card = this.currentPlayer().cards[this.currentRound];

  if(action == "spade") {
    if (card.suit == "spade")
      this.sendMessage(this.currentPlayer().name + " guessed SPADE and was CORRECT");
    else
      this.sendMessage(this.currentPlayer().name + " guessed SPADE and was WRONG");
  } else if(action == "heart") {
    if (card.suit == "heart")
      this.sendMessage(this.currentPlayer().name + " guessed HEART and was CORRECT");
    else
      this.sendMessage(this.currentPlayer().name + " guessed HEART and was WRONG");
  } else if(action == "diamond") {
    if (card.suit == "diamond")
      this.sendMessage(this.currentPlayer().name + " guessed DIAMOND and was CORRECT");
    else
      this.sendMessage(this.currentPlayer().name + " guessed DIAMOND and was WRONG");
  } else if(action == "club") {
    if (card.suit == "club")
      this.sendMessage(this.currentPlayer().name + " guessed CLUB and was CORRECT");
    else
      this.sendMessage(this.currentPlayer().name + " guessed CLUB and was WRONG");
  }
}

IrishPoker.prototype.numberInside = function(x, y, z) {
  return (x > y && x < z) || (x > z && x < y)
}

IrishPoker.prototype.numberOutside = function(x, y, z) {
  return (x > y && x > z) || (x < z && x < y)
}

//***************
// SERIALIZER
//***************

IrishPoker.prototype.serialize = function() {
  var currentPlayer = this.currentPlayer();

  var players = _.map(this.players, function(player) {
    return {
      id: player.id,
      name: player.name,
      cards: _.map(player.cards, function(card) { return {
        string: card.unicodeString(),
        suit: card.suit,
        faceDown: card.faceDown,
        value: card.value };
      })
    }
  });

  return {
    status: this.status(),
    currentTurn: !!currentPlayer ? this.currentPlayer().id : null,
    currentRound: this.currentRound,
    players: players
  }
}

//***************
// EVENTS
//***************

IrishPoker.prototype.action = function(opts) {
  switch(opts.action) {
    case "start game":
      this.startGame();
      break;
    case "player action":
      this.handlePlayerAction(opts.playerId, opts.value);
      break;
    default:
      // Do nothing
  }
};

IrishPoker.prototype.sendStatus = function() {
  this.io.to(this.slug).emit('status', this.serialize());
}

IrishPoker.prototype.playerJoined = function(player) {
  this.io.to(this.slug).emit('player joined', player.name);
}

IrishPoker.prototype.sendMessage = function(message) {
  this.io.to(this.slug).emit('message', {message: message});
}

module.exports = IrishPoker
