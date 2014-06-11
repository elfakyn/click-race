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
var idCounter = 0;
var counter = 0;

var findSocket = function(id) {
    for (var i = 0, len = sockets.length; i < len; i++) {
        if (sockets[i].id === id) {
            return i;
        }
    }
    return -1;
}

io.on('connection', function(socket) {
    currentId = ++idCounter;
    sockets.push({nick: '', id: currentId, counter: 0}); // todo: actually use nick, counter
    console.log('new connection: ' + idCounter);
    socket.emit('new counter', counter);

    socket.on('click', function() {
        counter++;
        console.log('new counter by ' + currentId + ': ' +counter);
        io.emit('new counter', counter);
    });

    socket.on('disconnect', function() {
        console.log('user ' + currentId + ' disconnected');
        sockets.splice(sockets[findSocket(currentId)],1);
    });
});

app.listen(1234);
