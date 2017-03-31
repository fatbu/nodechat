var clearChat = function() {
    var messages = $("#messages");
    messages.fadeToggle("fast");
    messages.empty();
    $("#m").focus();
    setTimeout(function(){
        socket.emit("getusers");
        messages.fadeToggle("fast");
        appendMessage("You are in \"" + chatroom + "\"");
    }, 500);
};

function appendMessage(txt) {
    $("#messages").append($("<li>").text(txt));
    window.scrollTo(0,document.body.scrollHeight);
}

appendMessage("Connecting...");

var socket = io.connect();

socket.emit("getmotd", function(motd) {
    $("#motd").text(motd);
});

var nick = prompt("Nickname");

if ("" == nick.trim() || nick.length < 3) {
    alert("Nickname too short");
    location.reload();
}else if (nick.length > 12) {
    alert("Nickname too long");
    location.reload();
}else if (nick.indexOf(" ") >= 0){
    alert("No spaces in nickname allowed");
    location.reload();
}

var admin = false;
var chatroom = "lobby";

socket.on("verified", function() {
    admin = true;
    socket.emit("chat message", {
        message: nick + " is now an operator!"
    });
});

socket.on("chat message", function(msg) {
    if(msg.nickname){
        if(msg.chatroom == chatroom){
            appendMessage("[" + msg.chatroom + "] " + msg.nickname +  ": " + msg.message);
        }
    }else{
        // Announcements
        appendMessage(msg.message);
    }
});

socket.on("tell", function(msg){
    if(msg.recipient == nick){
        appendMessage(msg.nick + ' -> ' + 'you : ' + msg.message);
    }else if(msg.nick == nick){
        appendMessage("You -> " + msg.recipient + " : " + msg.message);
    }
});

socket.on("usersonline", function(usersList) {
    appendMessage("Users online: " + usersList.toString().replace(/,/g, ', '));
});

appendMessage("Logging in...");

socket.emit("userconnect", nick);

appendMessage("You are in \"" + chatroom + "\"");

socket.emit("getusers");

$("form").submit(function() {
    var a = $("#m").val();
    if ("/" == a.charAt(0)) {
        // COMMANDS
        a = a.slice(1);
        if (a.search(/operator/) != -1){
            if ("operator" == a){
                socket.emit("printadmin");
            } else {
                a = a.replace(/operator\s/, "");
                socket.emit("verifyadmin", a);
            }
        }
        else if (a.search(/users/) != -1) {
            a = a.replace(/users\s/, "");
            socket.emit("getusers");
        }
        else if (a.search(/chatroom/) != -1){
            a = a.replace(/chatroom\s/, "");
            if(a){
                chatroom = a.toLowerCase();;
                appendMessage("You are now in \"" + chatroom + "\"");
            }else{
                appendMessage("You are in \"" + chatroom + "\"");
            }
        }
        else if (a.search(/clear/) != -1) {
            clearChat();
        }else if (a.search(/tell/) != -1) {
            var recipient = a.replace(/tell\s/, "").replace(/\s.*/, "");
            var message = a.replace(/tell\s/, "").substring(a.replace(/tell\s/, "").indexOf(" ")+1);
            socket.emit("tell", {nick: nick, recipient: recipient, message: message});
        }
        if (admin) {
            // ADMIN COMMANDS
            if (a.search(/mute/) != -1) {
                a = a.replace(/mute\s/, "");
                if (a != nick) socket.emit("mute", a);
            }
            else if (a.search(/motd/) != -1) {
                a = a.replace(/motd\s/, "");
                socket.emit("motd", a);
            }
        }
        $("#m").val("");
        return false;
    } else {
        if(!a.trim() == ""){
            socket.emit("chat message", {
                nickname: nick,
                message: a,
                chatroom: chatroom
            });
        }
        $("#m").val("");
        return false;
    }
});

socket.on("usernametaken", function(username) {
    alert("Username taken");
    location.reload();
});

socket.on("mute", function(username) {
    if (nick == username && !admin){
        $("#m").remove();
    }
});
socket.on("update nicknames", function(){
    socket.emit("update nicknames", nick);
});
socket.on("motd", function(motd) {
    $("#motd").text(motd);
});
socket.on("disconnect", function(){
    appendMessage("Disconnected. Please check your connection");
});
window.onbeforeunload = function() {
    socket.emit("userdisconnect", nick);
};
