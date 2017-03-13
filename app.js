var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || process.argv[2] || 3000; // Allow for Heroku dynamic ports and custom ports
var messageoftheday = 'welcome'; // Default MOTD
http.listen(port, console.log('listening on: '+port));

// admin password thing
function randomIntInc(low, high) { // https://blog.tompawlak.org/generate-random-values-nodejs-javascript thanks :D
    return Math.floor(Math.random() * (high - low + 2) + low);
}
var adminpassword = randomIntInc(1000, 9999);

console.log('Admin password: ' + adminpassword);

console.log('local address: ' + require('ip').address() + ':' + port);
getIP = require('external-ip')();
getIP(function(err, ip){
    if(err){
        console.log('An error occurred while fetching the external ip address');
    }else{
        console.log('external address: ' + ip + ':' + port);
    }
});

require('./routes.js')(app);

function randomInt(low, high){
    return Math.floor(Math.random() * (high - low + 1) + low);
}

var nicknames = [];

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
        console.log("[" + msg.chatroom + "] " + msg.nickname + ': ' + msg.message);
    });
    // PUT ALL SOCKET.IO MESSAGE HANDLING BELOW
    socket.on('getusers', function(){
        socket.emit('usersonline', nicknames);
    });
    socket.on('printadmin', function(){ // When someone does /operator without arguments in the chat console print the password in the command line/log because it is a pain to scroll all the way up.
        console.log('Admin password: ' + adminpassword);
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
            io.emit('chat message', {nickname: '', message: nick+' connected'});
            console.log(nick + ' joined the conversation');
        }
    });
    socket.on('permban', function(user){
        io.emit('permban', user);
        io.emit('chat message', {nickname: '', message: user+' was permanently banned!'} )
        console.log(user+' was permanently banned!');
    });
    socket.on('mute', function(user){
        io.emit('mute', user);
        io.emit('chat message', {nickname: '', message: user+' was muted!'})
        console.log(user+' was muted!');
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
});
