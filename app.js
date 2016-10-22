var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/ding.m4a', function(req, res){
	res.sendFile(__dirname + '/public/ding.m4a');
});

function randomInt(low, high){
    return Math.floor(Math.random() * (high - low + 1) + low);
}

var admin_pin = randomInt(1000, 9999);

var nicknames = [];
var people_typing = [];

setTimeout(function(){people_typing = []}, 1000);

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
			console.log(nick + ' connected');
		}
	});
	/*
	socket.on('typing', function(nick){
		console.log(nick + 'is typing');
		if(people_typing.indexOf(nick)!=-1){
			people_typing.push(nick);
			var peopletypingstr = '';
		  
			for(var i=0; i<people_typing.length; i++){
				peopletypingstr.concat(people_typing[i]+',');
			}
			
			// needs work
		
			io.emit('typing', peopletypingstr);
		}
	});
	*/
	socket.on('userdisconnect', function(nick){
		io.emit('chat message', nick + ' disconnected');
		console.log(nick + ' disconnected')
		nicknames.splice(nicknames.indexOf(nick), 1);
	});
});

var port = process.argv[2]

http.listen(port, function(){
  console.log('listening on: '+port);
});

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('address: '+add);
})
