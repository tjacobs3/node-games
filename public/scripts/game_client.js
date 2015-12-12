var socket = io();

socket.on('player joined', function(msg){
  $('#players').append($('<li>').text(msg));
});
