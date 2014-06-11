var app = require('http').createServer(httpHandler);
var io = require('socket.io')(app)
var fs = require('fs');

function httpHandler (req, res) {
    fs.readFile(__dirname + '/index.html', function (err, data) {
        if (err) {
            res.writeHead(500);
            console.error('Error loading index.html');
            res.end('Error loading index.html');
            return;
        }

        res.writeHead(200);
        res.end(data);
    });
}

//////////////////////////////
// USERS AND CONNECTIONS

var sockets = [];
var counter = 0;

var lowestAvailableSocket = function() {
    for (var i = 0, len = sockets.length; i < len; i++) {
        if (sockets[i] === null) {
            return i;
        }
    }
    return len;
}

io.on('connection', function(socket) {
    var currentId = lowestAvailableSocket();
    sockets[currentId] = {nick: 'Anonymous', counter: 0}; // todo: actually use nick, counter
    //console.log('new connection: ' + currentId);
    socket.broadcast.emit('join', currentId, sockets[currentId]); // tell others a new user joined
    socket.emit('welcome', sockets); // give new user list of people and scores

    socket.on('click', function() {
        counter++;
        sockets[currentId].counter++;
        //console.log('new counter by ' + currentId + ': ' +counter);
        socket.emit('new personal counter', sockets[currentId].counter);
        io.emit('new total counter', counter);
        io.emit('new counter', currentId, sockets[currentId].counter);
    });

    socket.on('change nick', function(nick) {
        console.log('user ' + currentId + ' (' + sockets[currentId].nick + ') changed nick to ' + nick);
        sockets[currentId].nick = nick;
        io.emit('nick changed', currentId, nick);
    });

    socket.on('disconnect', function() {
        //console.log('user ' + currentId + ' disconnected');
        sockets[currentId] = null;
        io.emit('leave', currentId);
    });
});

app.listen(1234);
