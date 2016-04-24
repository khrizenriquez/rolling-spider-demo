/********************************
@khrizenriquez: Christofer Enríquez <christoferen7@gmail.com>
********************************/

'use strict';

var express = require('express');
//var session = require('express-session');
var cookieParser = require('cookie-parser')();
//var session = require('cookie-session')({ secret: 'secret' });
var app     = express();
var http    = require('http').Server(app);
var session = require("express-session")({
    secret: "rolling-spider",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");
var io      = require('socket.io')(http);
var swig       = require('swig');
var bodyParser = require('body-parser')();
//var cookieParser = require('cookie-parser');
var requestSession;

/********************************
Block the header from containing information about the server
********************************/
app.disable('x-powered-by');

/********************************
Template engine
********************************/
//app.engine('html', require('ejs').renderFile);
app.engine('html', swig.renderFile);
app.set('view cache', false);
app.set('views', __dirname + '/views');
swig.setDefaults({ cache: false });

app.set('view engine', 'html');

/********************************
Middleware
********************************/
app.use(express.static('public'));
app.use(session);
// Share session with io sockets

io.use(sharedsession(session, {
    autoSave:true
}));

app.use(bodyParser);


/********************************
Create a directory called public and then a directory named img inside of it and put your logo in there
********************************/
app.use(express.static(__dirname + '/public'));

// app.use(session({
//     resave: true,
//     saveUninitialized: true,
//     secret: 'rolling-spider',
//     cookie: { maxAge: 60000 }
// }));

/********************************
Creating socket
********************************/
var users       = [],
    userActions = [],
    doActions   = false;
//var nsp = io.of('/rolling-chanel');
io.on('connection', function (socket) {
  console.log('someone connected');
  socket.emit('user-connected', users);

  socket.on('user-connected', function(data) {
      users.push(data);

      if (socket.handshake.session.appName === undefined) {
          socket.handshake.session.appName     = 'Rolling-spider';
          socket.handshake.session.date        = new Date();
          socket.handshake.session.deviceInfo  = '';
          socket.handshake.session.myName      = data.myName;
      }

      io.sockets.emit('user-connected', users);
  });

  socket.emit('user-actions', users);

    socket.on('user-actions', function(data) {
        let limit           = 10,
            lastElements    = [];
        data.userActions.done = false;
        userActions.unshift(data.userActions);

        if (userActions.length > 0) {
            doActions = true;
            userActions.some(function (element, index, arr) {
                if (index >= limit) return false;
                lastElements.push(element);
            });
        } else {
            doActions = false;
        }

        io.sockets.emit('user-actions', lastElements);
    });

});

var doQueueDroneActions = function () {
    let interval = setInterval(function () {
        if (!doActions) {
            return;
        }

        if (userActions.length <= 0) {
            doActions = false;
            return;
        }
        //  Elimino el ultimo valor
        userActions.pop();
        io.sockets.emit('user-actions', userActions);

        return;
    }, 5000);
}();

function createSessionForUser (request, params) {
    //  Validate if session exist
    if (request.appName === undefined) {
        request.appName     = 'Rolling-spider';
        request.date        = new Date();
        request.deviceInfo  = '';
        request.myName      = params.myName;
    }
}

var connectUser = function (request, params) {
    let r           = request || undefined;
    let response    = {};

    if (!userIsConnected()) {
        createSessionForUser(r, params);

        response.status     = 'OK';
        response.message    = 'Creo la sesión para el usuario';

        return response;
    }

    response.status     = 'OK';
    response.message    = 'El usuario ya existe';
    return response;
}

var userIsConnected = function (request) {
    console.log(request);
    let session = request || {};
    return (session.appName === undefined) ? false : true;
}

/********************************
ROUTES
********************************/
app.get('/', function (req, res) {
    requestSession  = req.session;
    console.log(requestSession);
    let objResponse         = {};
    let connected   = userIsConnected(requestSession);
    objResponse.isLogged = false;
    if (requestSession.appName !== undefined) {
        objResponse.isLogged = true;
        requestSession.internal = false;

        res.render('home', objResponse);
        return;
    }

    objResponse.isLogged = false;
    //let connect   = service.connect(req.session);

    //nsp.emit('hi', 'everyone!');

    // io.on('connection', function (socket) {
    //     socket.emit('news', { hello: 'world' });
    //     socket.on('my other event', function (data) {
    //         console.log(data);
    //     });
    // });

    res.render('home', objResponse);
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
