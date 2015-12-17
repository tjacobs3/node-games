function setStatus(status) {
  var msg = "";
  switch(status.status) {
    case "waiting_for_game_start":
      msg = "Waiting for game to start";
      break;
    default:
      handleGameStarted();
      displayCards(status);
      msg = "Player turn: " + status.current_turn;
  }

  $("#status").text(msg);
}

function displayCards(status) {
  var player = findPlayer(status, playerId());
  $("#my-cards").text(player.cards.join());
}

function handleGameStarted() {
  $("#start-button").remove();
}

function findPlayer(status, id) {
  return _.find(status.players, function(player){ return player.id == id; });
}

socket.on('status', function(msg){
  setStatus(msg);
});

$("#start-button").click(function() {
  socket.emit('perform action', {
    action: "start game",
    gameSlug: gameSlug()
  });
});

setStatus($("#player-info").data("status"));
