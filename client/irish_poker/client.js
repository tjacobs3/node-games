var GameClient = require('../game_client.js');

var IrishPoker = function() {
  GameClient.call(this);

  this.socket.on('status', this.setGameState.bind(this));
  this.socket.on('message', this.addMessage.bind(this));

  $("#start-button").click(this.startButtonClicked.bind(this));

  this.setGameState(this.playerInfo.status);
};

IrishPoker.prototype = Object.create(GameClient.prototype);
IrishPoker.prototype.constructor = IrishPoker;

IrishPoker.prototype.addMessage = function(msg) {
  $message = $(IrishPoker.messageRow({text: msg.message}));
  $("#messages").prepend($message);
}

IrishPoker.prototype.setGameState = function(status) {
  this.gameStatus = status.status;
  this.currentTurn = status.currentTurn;
  this.currentRound = status.currentRound;
  this.players = status.players;

  this.setTitle();

  if(this.gameStatus != "waiting_for_game_start") {
    this.handleGameStarted();
    this.displayCards();
    this.setupTurn();
  }
}

IrishPoker.prototype.setTitle = function() {
  var statusElement = $("#status");
  if(this.gameStatus == "waiting_for_game_start")
    statusElement.text("Waiting for game to start");
  else
    statusElement.text("Player turn: " + this.currentPlayer().name);
};

IrishPoker.prototype.displayCards = function() {
  var player = this.findPlayer(this.playerId());
  $("#my-cards .card").each(function( index ) {
    var card = player.cards[index];

    if(!card.faceDown) {
      $(this).addClass("revealed");
      $(this).text(card.string);
      $(this).addClass(card.suit);
    } else {
      $(this).html("&nbsp;");
    }
  });
};

IrishPoker.prototype.currentPlayer = function() {
  return this.findPlayer(this.currentTurn);
};

IrishPoker.prototype.handleGameStarted = function() {
  $("#start-button").remove();
};

IrishPoker.prototype.startButtonClicked = function() {
  this.socket.emit('perform action', {
    action: "start game",
    gameSlug: this.gameSlug()
  });
};

IrishPoker.prototype.playerAction = function(value) {
  this.socket.emit('perform action', {
    playerId: this.playerId(),
    action: "player action",
    gameSlug: this.gameSlug(),
    value: value
  });
}

IrishPoker.prototype.setupTurn = function() {
  var curPlayer = this.currentPlayer();
  $("#actions").empty();

  if(curPlayer.id == this.playerInfo.playerid) {
    switch(this.currentRound) {
      case 0:
        this.red_black_round();
        break;
      case 1:
        this.over_under_round();
        break;
      case 2:
        this.outside_inside_round();
        break;
      case 3:
        this.suit();
        break;
    }
  }
};

//***************
// UI FOR ROUNDS
//***************

IrishPoker.prototype.red_black_round = function() {
  $redButton = $(IrishPoker.button({text: "Card is Red"}));
  $blackButton = $(IrishPoker.button({text: "Card is Black"}));
  $redButton.addClass("background--red");
  $("#actions").append($redButton);
  $("#actions").append($blackButton);

  var that = this;
  $redButton.click(function() { that.playerAction("red"); });
  $blackButton.click(function() { that.playerAction("black"); });
}

IrishPoker.prototype.over_under_round = function() {
  $overButton = $(IrishPoker.button({text: "Over"}));
  $underButton = $(IrishPoker.button({text: "Under"}));
  $("#actions").append($overButton);
  $("#actions").append($underButton);

  var that = this;
  $overButton.click(function() { that.playerAction("over"); });
  $underButton.click(function() { that.playerAction("under"); });
}

IrishPoker.prototype.outside_inside_round = function() {
  $outsideButton = $(IrishPoker.button({text: "Outside"}));
  $insideButton = $(IrishPoker.button({text: "Inside"}));
  $("#actions").append($outsideButton);
  $("#actions").append($insideButton);

  var that = this;
  $outsideButton.click(function() { that.playerAction("outside"); });
  $insideButton.click(function() { that.playerAction("inside"); });
}

IrishPoker.prototype.suit = function() {
  $spade = $(IrishPoker.button({text: "♠ Spade"}));
  $heart = $(IrishPoker.button({text: "♥ Heart"}));
  $diamond = $(IrishPoker.button({text: "♦ Diamond"}));
  $club = $(IrishPoker.button({text: "♣ Club"}));

  $("#actions").append($spade).append($heart).append($diamond).append($club);

  var that = this;
  $spade.click(function() { that.playerAction("spade"); });
  $heart.click(function() { that.playerAction("heart"); });
  $diamond.click(function() { that.playerAction("diamond"); });
  $club.click(function() { that.playerAction("club"); });
}

IrishPoker.button = _.template("<div class='button font--large'><%- text %></div>");
IrishPoker.messageRow = _.template("<div><%- text %></div>");

////////////
// Export
////////////
window.IrishPoker = IrishPoker;
