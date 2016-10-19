var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

var nicknames = [];
var people_typing = [];

setTimeout(function(){people_typing = [];};, 1000);

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
		console.log(msg)
	});
	socket.on('userconnect', function(nick){
		if(nicknames.indexOf(nick) != -1){
			socket.emit('usernametaken', nick);
		}else{
			nicknames.push(nick);
			io.emit('chat message', nick + ' connected');
		}
	});
	socket.on('typing', function(nick){
		people_typing.push(nick);
		var peopletypingstr = '';
		
		// needs work
		
		socket.broadcast.emit('typing', );
	});
	socket.on('userdisconnect', function(nick){
		io.emit('chat message', nick + ' disconnected');
		nicknames.splice(nicknames.indexOf(nick), 1);
	});
});

var port = process.argv[2]

http.listen(port, function(){
  console.log('listening on:');
	console.log(port);
});
