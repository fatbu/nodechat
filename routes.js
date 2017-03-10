module.exports = function(app){
    app.get('/', function(req, res){
      res.sendFile(__dirname + '/public/index.html'); // Home chat page
    });
    app.get('/js/nodechat.js', function(req, res){
        res.sendFile(__dirname + '/js/nodechat.js');
    });
    app.get('/favicon.ico', function(req, res){
        res.sendFile(__dirname + '/favicon.ico');
    });
}
