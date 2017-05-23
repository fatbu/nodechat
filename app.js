#!/usr/bin/env node

console.log('Initializing...');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(require('express').static(__dirname + '/public'));
var fs = require('fs');
if(!fs.existsSync(__dirname + '/config')){
    // No config file
    console.log('No configuration file detected. Generating file...')
    fs.writeFile(__dirname + '/config', `# nodechat configuration file
# Port to run on
port 3000

# Starting MOTD
motd welcome

# Operator password
operator_password 12345
    `, function(err){
        if(err){
            console.error(err);
        }else{
            console.log('Configuration file generated. Please start nodechat again for the file to take effect');
            process.exit();
        }
    });
}

var configuration = require('very-simple-config')(__dirname + '/config');
console.log('Reading configuration from ' + __dirname + '/config'); // read config file

var port = process.env.PORT || process.argv[2] || parseInt(configuration.port) || 3000; // Allow for Heroku dynamic ports and custom ports
var messageoftheday = configuration.motd || 'nodechat'; // Default MOTD
http.listen(port, console.log('listening on: '+port));

// admin password
var adminpassword = configuration.operator_password;
console.log('Operator password: ' + adminpassword);

console.log('local address: ' + require('ip').address() + ':' + port);
getIP = require('external-ip')();
getIP(function(err, ip){
    if(err){
        console.log('An error occurred while fetching the external ip address');
    }else{
        console.log('external address: ' + ip + ':' + port);
    }
    console.log('MOTD: ' + configuration.motd);
});

function randomInt(low, high){
    return Math.floor(Math.random() * (high - low + 1) + low);
}

var nicknames = [];

io.on('connection', function(socket){
    socket.setMaxListeners(Infinity);
    process.on('SIGINT', function(){
        io.emit('chat message', {message: "Server closed"});
        console.log('Exiting...');
        process.exit();
    });
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
        if(msg.chatroom){
            console.log("[" + msg.chatroom + "] " + msg.nickname + ": "  + msg.message);
        }else{
            console.log(msg.message);
        }
    });
    // PUT ALL SOCKET.IO MESSAGE HANDLING BELOW
    socket.on('getusers', function(){
        socket.emit('usersonline', nicknames);
    });
    socket.on('verifyadmin', function(password){ // Verify admin passcodes
        if(password == adminpassword){
            socket.emit('verified');
        }
    });
    socket.on('userconnect', function(nick){ // When someone connects...
        if(nicknames.indexOf(nick) != -1){
            socket.emit('usernametaken', nick);
        }else{
            nicknames.push(nick);
            socket.broadcast.emit('chat message', {nickname: '', message: nick+' connected'});
            console.log(nick + ' joined the conversation');
        }
    });
    socket.on('mute', function(user){
        if(nicknames.indexOf(user) != -1){
            io.emit('mute', user);
            io.emit('chat message', {message: user+' was muted!'})
            console.log(user+' was muted!');
        }else{
            socket.emit('chat message', {message: 'User ' + user + ' does not exist'});
        }
    });
    socket.on('motd', function(motd){
        messageoftheday = motd;
        console.log('MOTD changed to: ' + messageoftheday);
        io.emit('motd', messageoftheday);
    })
    socket.on('getmotd', function(){
        socket.emit('motd', messageoftheday);
    })
    socket.on('userdisconnect', function(nick){
        io.emit('chat message', {nickname: '', message:nick+' left the conversation'});
        console.log(nick + ' left the conversation')
        nicknames.splice(nicknames.indexOf(nick), 1);
    });
    socket.on('tell', function(obj){
        io.emit('tell', obj);
        console.log(obj.nick + ' -> ' + obj.recipient + ' : ' + obj.message);
    });
    socket.on('change nick', function(obj){
        if(nicknames.indexOf(obj.newNick) >= 0){
            socket.emit('usernametaken');
        }else{
            nicknames[nicknames.indexOf(obj.oldNick)] = obj.newNick;
            if(obj.newNick.charAt(0) != '@'){
                io.emit('chat message', {message: obj.oldNick + ' changed their name to ' + obj.newNick});
            }
            socket.emit('update nick', obj.newNick);
        }
    });
});
