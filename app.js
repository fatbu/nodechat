var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port;
if(process.argv[2]==undefined){
	console.log('You did not specify a port. Using port 3000 by default.');
	port = 3000;
}else{
	port = process.argv[2];
}
http.listen(3000, console.log('listening on: '+port))

// admin password thing
function randomIntInc(low, high) { // https://blog.tompawlak.org/generate-random-values-nodejs-javascript thanks :D
    return Math.floor(Math.random() * (high - low + 1) + low);
}
var adminpassword = randomIntInc(1000, 9999);

console.log('Operator password: ' + adminpassword);

console.log('local address: ' + require('ip').address() + ':' + port);
getIP = require('external-ip')();
getIP(function(err, ip){
	if(err){
		console.log('An error occurred while fetching the external ip address');
	}else{
		console.log('external address: ' + ip + ':' + port);
	}
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/ding.m4a', function(req, res){
	res.sendFile(__dirname + '/public/ding.m4a');
});

function randomInt(low, high){
    return Math.floor(Math.random() * (high - low + 1) + low);
}

var nicknames = [];
var people_typing = [];

setTimeout(function(){people_typing = []}, 1000);

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
		console.log(msg.nickname + ': ' + msg.message);
	});
	socket.on('verifyadmin', function(password){
		if(password == adminpassword){
			socket.emit('verified');
		}
	});
	socket.on('userconnect', function(nick){
		if(nicknames.indexOf(nick) != -1){
			socket.emit('usernametaken', nick);
		}else{
			nicknames.push(nick);
			io.emit('chat message', {nickname: 'Server', message: nick+' connected'});
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
	socket.on('mute', function(user){
		io.emit('mute', user);
		console.log('muted ' + user);
	});
	socket.on('userdisconnect', function(nick){
		io.emit('chat message', {nickname: 'Server', message: nick+' disconnected'});
		console.log(nick + ' disconnected')
		nicknames.splice(nicknames.indexOf(nick), 1);
	});
});




