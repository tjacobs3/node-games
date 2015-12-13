socket.on('status', function(msg){
  $('#status').text(msg);
});

socket.on('board updated', function(msg) {
  var cell = $(".cell[data-x='" + msg.x + "'][data-y='" + msg.y + "']");
  cell.text(msg.symbol);
  cell.addClass(msg.symbol);
});


$(".cell").click(function() {
  socket.emit('perform action', {
    playerId: playerId(),
    gameSlug: gameSlug(),
    x: $(this).data("x"),
    y: $(this).data("y")
  });
});
