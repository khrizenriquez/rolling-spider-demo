/********************************
@khrizenriquez: Christofer Enríquez <christoferen7@gmail.com>
********************************/

'use strict';

var express = require('express');
var app     = express();

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


/********************************
ROUTES
********************************/
app.get('/', function (req, res) {
    res.render('home');
});
app.get('/rollingadmin', function (req, res) {
    res.render('admin');
});

var http = require('http').Server(app);
var io      = require('socket.io')(http);

/********************************
Creating socket
********************************/
io.on('connection', function (socket) {
  console.log('a user connected');
});


/********************************
Creating the server
********************************/
http.listen(3001, function () {
    console.log('listening on *:3000');
});
// var server = app.listen(3001, function () {
//     var host = 'localhost';
//     var port = server.address().port;
//
//     console.log('Servidor en ruta http://%s:%s', host, port);
// });
