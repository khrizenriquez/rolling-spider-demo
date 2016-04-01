/********************************
@khrizenriquez: Christofer Enríquez <christoferen7@gmail.com>
********************************/

'use strict';

var express = require('express');
var session = require('express-session');
var app     = express();
var http    = require('http').Server(app);
var service = require('./services/services');
var io      = require('socket.io')(http);

/********************************
Block the header from containing information about the server
********************************/
app.disable('x-powered-by');

/********************************
Template engine
********************************/
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

/********************************
Middleware
********************************/
app.use(express.static('public'));

/********************************
Create a directory called public and then a directory named img inside of it and put your logo in there
********************************/
app.use(express.static(__dirname + '/public'));

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'rolling-spider'
}));

/********************************
ROUTES
********************************/
app.get('/', function (req, res) {
    let connect = service.connect(req.session);
    //console.log(connect);
    res.render('home');
    /********************************
    Creating socket
    ********************************/
    var nsp = io.of('/rolling-chanel');
    nsp.on('connection', function (socket) {
      console.log('someone connected')
    });
    nsp.emit('hi', 'everyone!');

    io.on('connection', function(socket){
        socket.join('some room');
    });
    // io.on('connection', function (socket) {
    //     socket.emit('news', { hello: 'world' });
    //     socket.on('my other event', function (data) {
    //         console.log(data);
    //     });
    // });
});
app.get('/rollingadmin', function (req, res) {
    //console.log(io.of('/rolling-chanel').clients());

    let clients = io.sockets.adapter.rooms['some room'];
    console.log(clients);//works
    res.render('admin');
});

/********************************
Creating the server
********************************/
http.listen(3001, function () {
    let host = 'localhost';
    let port = this.address().port;

    console.log('Servidor en ruta http://%s:%s', host, port);
    //console.log('listening on *:3000');
});
// var server = app.listen(3001, function () {
//     var host = 'localhost';
//     var port = server.address().port;
//
//     console.log('Servidor en ruta http://%s:%s', host, port);
// });
