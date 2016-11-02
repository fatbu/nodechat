# nodechat
Simple, lightweight node.js chat server and client
Code is based off the example at the socket.io website
Sounds by theta4 from freesound.org

## How to use
Preparation:
```
$ git clone https://github.com/fatbu/nodechat.git
$ cd nodechat
$ npm install
```

######Arguments:
`node app [port]`

The default port is 3000.

```
$ node app
Admin password: ****
Keep it secret :)
You did not specify a port.
listening on: 3000
address: 10.0.65.45
```

Admins have the ability to mute people.
To become an admin do `socket.emit('verifyadmin', [insert admin password])` in the browser console. I'm working on a way to do it on chat.
More functionality will be added soon.