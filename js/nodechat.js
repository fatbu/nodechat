var clearChat = function() {
    $("#messages").empty();
    $("#m").focus();
    socket.emit("getusers");
};

function appendMessage(a) {
    $("#messages").append($("<li>").text(a));
}

appendMessage("Connecting...");

var socket = io.connect();

socket.emit("getmotd", function(a) {
    $("#motd").text(a);
});

if (localStorage.banned) while (true) alert("You have been permanently banned from this server!");

var nick = prompt("Nickname");

if ("" == nick.trim() || nick.length < 3) {
    alert("Nickname too short");
    location.reload();
}

var admin = false;

socket.on("verified", function() {
    admin = true;
    socket.emit("chat message", {
        nickname: "Server",
        message: nick + " is now an operator!"
    });
});

socket.on("chat message", function(a) {
    appendMessage(a.nickname + ": " + a.message);
});

socket.on("usersonline", function(a) {
    appendMessage("Users online: " + a.toString());
});

appendMessage("Logging in...");

socket.emit("userconnect", nick);

socket.emit("getusers");

$("form").submit(function() {
    var a = $("#m").val();
    if ("/" == a.charAt(0)) {
        a = a.slice(1);
        if (a.search(/operator/) != -1) if ("operator" == a) socket.emit("printadmin"); else {
            a = a.replace(/operator\s/, "");
            socket.emit("verifyadmin", parseInt(a));
        }
        if (a.search(/users/) != -1) {
            a = a.replace(/users\s/, "");
            socket.emit("getusers");
        }
        if (admin) {
            if (a.search(/permban/) != -1) {
                a = a.replace(/permban\s/, "");
                if (a != nick) socket.emit("permban", a);
            }
            if (a.search(/mute/) != -1) {
                a = a.replace(/mute\s/, "");
                if (a != nick) socket.emit("mute", a);
            }
            if (a.search(/motd/) != -1) {
                a = a.replace(/motd\s/, "");
                socket.emit("motd", a);
            }
        }
        $("#m").val("");
        return false;
    } else {
        socket.emit("chat message", {
            nickname: nick,
            message: a
        });
        $("#m").val("");
        return false;
    }
});

socket.on("usernametaken", function(a) {
    alert("Username taken");
    location.reload();
});

socket.on("permban", function(a) {
    if (nick == a) {
        localStorage.banned = true;
        location.reload();
    }
});

socket.on("mute", function(a) {
    if (nick == a) $("#m").remove();
});

socket.on("motd", function(a) {
    $("#motd").text(a);
});

window.onbeforeunload = function() {
    socket.emit("userdisconnect", nick);
};
