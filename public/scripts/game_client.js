var socket = io();

socket.on('player joined', function(msg){
  $('#players').append($('<div>').text(msg));
});


function playerId() {
  return $("#player-info").data("playerid");
}

function gameSlug() {
  return $("#player-info").data("gameslug");
}

$(function() {
  socket.emit('join game', {gameSlug: gameSlug()});
});
