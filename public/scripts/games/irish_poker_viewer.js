var IrishPokerViewer = function() {
  GameViewer.call(this);

  this.socket.on('status', this.setGameState.bind(this));
  this.socket.on('message', this.setMessage.bind(this));

  this.setGameState(this.gameInfo.status);
};

IrishPokerViewer.prototype = Object.create(GameViewer.prototype);
IrishPokerViewer.prototype.constructor = IrishPokerViewer;

IrishPokerViewer.prototype.setGameState = function(status) {
  this.gameStatus = status.status;
  this.currentTurn = status.currentTurn;
  this.currentRound = status.currentRound;
  this.players = status.players;

  this.setTitle();

  if(this.gameStatus != "waiting_for_game_start") {
    this.displayCards();
    this.setPlayerTurn(this.currentPlayer());
    this.handleGameStarted();
  }
}

IrishPokerViewer.prototype.setTitle = function() {
  var statusElement = $("#status");
  if(this.gameStatus == "waiting_for_game_start")
    statusElement.text("Waiting for game to start");
};

IrishPokerViewer.prototype.currentPlayer = function() {
  return this.findPlayer(this.currentTurn);
};

IrishPokerViewer.prototype.findPlayer = function(id) {
  return _.find(this.players, function(player){ return player.id == id; });
};

IrishPokerViewer.prototype.displayCards = function() {
  _.each(this.players, this.setCardsForPlayer);
};

IrishPokerViewer.prototype.setCardsForPlayer = function(player) {
  var $row = $(".player[data-playerId='" + player.id + "']");
  if($row.length == 0) {
    $row = $(IrishPokerViewer.cardRow(player));
    $("#player-cards").append($row);
  }

  $row.find(".card").each(function( index ) {
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

IrishPokerViewer.prototype.setPlayerTurn = function(player) {
  if(!player) return;

  $(".player").removeClass("highlighted");
  $(".player[data-playerId='" + player.id + "']").addClass("highlighted");
};

IrishPokerViewer.prototype.setMessage = function(msg) {
  $("#status").text(msg.message);
};

IrishPokerViewer.prototype.handleGameStarted = function() {
  $('#players').remove();
}

IrishPokerViewer.cardRow = _.template("<div class='row player' data-playerId='<%- id %>'><div class='sub-header'><%- name %></div><div class='hand'><div class='card' data-card=0 /><div class='card' data-card=1 /><div class='card' data-card=2 /><div class='card' data-card=3 /></div></div>");


$(function() {
  new IrishPokerViewer();
});
