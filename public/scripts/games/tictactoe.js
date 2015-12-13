socket.on('status', function(msg){
  $('#status').text(msg);
});

socket.on('board updated', function(msg) {
  $(".cell[data-x='" + msg.x + "'][data-y='" + msg.y + "']").text(msg.symbol);
});


$(".cell").click(function() {
  socket.emit('perform action', {
    playerId: playerId(),
    gameSlug: gameSlug(),
    x: $(this).data("x"),
    y: $(this).data("y")
  });
});
