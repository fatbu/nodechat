var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

http.listen(port, console.log('listening on: '+port));

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

app.get('/jquery-3.1.1.min.js', function(req, res){
	res.sendFile(__dirname + '/public/jquery-3.1.1.min.js');
});

function randomInt(low, high){
    return Math.floor(Math.random() * (high - low + 1) + low);
}

var nicknames = [];

setTimeout(function(){people_typing = []}, 1000);

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
		console.log(msg.nickname + ': ' + msg.message);
	});
	
	// PUT ALL SOCKET.IO MESSAGE HANDLING BELOW
	
	socket.on('getusers', function(){
		socket.emit('usersonline', nicknames);
	});
	socket.on('printadmin', function(){
		console.log('Admin password: ' + adminpassword);
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




