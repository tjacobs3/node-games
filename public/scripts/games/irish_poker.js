var IrishPoker = function() {
  GameClient.call(this);

  this.socket.on('status', this.setGameState.bind(this));

  $("#start-button").click(this.startButtonClicked.bind(this));

  this.setGameState(this.playerInfo.status);
};

IrishPoker.prototype = Object.create(GameClient.prototype);
IrishPoker.prototype.constructor = IrishPoker;

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

    if(!card.faceDown)
      $(this).addClass("revealed");

    $(this).addClass(card.suit);
    $(this).text(card.string);
  });
};

IrishPoker.prototype.currentPlayer = function() {
  return this.findPlayer(this.currentTurn);
};

IrishPoker.prototype.handleGameStarted = function() {
  $("#start-button").remove();
};

IrishPoker.prototype.findPlayer = function(id) {
  return _.find(this.players, function(player){ return player.id == id; });
};

IrishPoker.prototype.startButtonClicked = function() {
  this.socket.emit('perform action', {
    action: "start game",
    gameSlug: this.gameSlug()
  });
};

IrishPoker.prototype.playerAction = function(value) {
  console.log("HERE!!!", value)
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
    }
  }
};

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


IrishPoker.button = _.template("<div class='button font--large'><%- text %></div>");



$(function() {
  new IrishPoker();
});
