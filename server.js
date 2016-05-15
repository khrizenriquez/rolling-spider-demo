/********************************
@khrizenriquez: Christofer Enríquez <christoferen7@gmail.com>
********************************/

'use strict';

//  Rolling spider library
var RollingSpider   = require('rolling-spider');
var uuid = '9a66fd540800919111e4012d1540cb8e';
var rollingSpider   = new RollingSpider();

//  Rolling spider library

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
const STEPS = 3;
var ACTIVE = false;

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

var purifyUserName = function (name) {
    let n           = name || 'afroc-drone',
        comodinName = 'afroc-drone',
        finalName   = '';

    //  El nombre que entre lo limpio, si vienen palabras que no deben ir en el nombre
    //  las reemplazo
    let badWords = [
        'put',
        'cagu',
        'mierd',
        'culer',
        'verg',

        //
        'ass',
        'asshole',
        'dick',
        'jerkass',
        'fuck'
    ];

    let tmpName = name.toLowerCase();
    badWords.some(function (element, index, arr) {
        if (tmpName.match(element)) {
            finalName = n.replace(new RegExp(element, 'g'), '_');

            let count = finalName.split('').map(function (a, b) {
                return (a+b);
            });

            return false;
        }
    });
};

function cooldown () {
    ACTIVE = false;
    setTimeout(function () {
        ACTIVE = true;
    }, STEPS * 12);
}

var droneFlight = function (action) {
    let a = action.toLowerCase() || '';

    console.log(a);

    if (a === 'arriba') {
        rollingSpider.up({
            steps: STEPS * 3
        });
        cooldown();
    } else
    if (a === 'abajo') {
        rollingSpider.down({
            steps: STEPS * 3
        });
        cooldown();
    } else
    if (a === 'izquierda') {
        rollingSpider.left({ steps: STEPS * 3 });
        cooldown();
    } else
    if (a === 'derecha') {
        rollingSpider.right({ steps: STEPS * 3 });
        cooldown();
    } else
    if (a === 'girar izquierda') {
        rollingSpider.turnLeft({ steps: STEPS * 3 });
        cooldown();
    } else
    if (a === 'girar derecha') {
        rollingSpider.turnRight({ steps: STEPS * 3 });
        cooldown();
    } else
    if (a === 'adelante') {
        //rollingSpider.forward({ steps: STEPS });
        rollingSpider.forward({ steps: STEPS * 3 }, function () {
            console.log('Adelante');
        });
        cooldown();
    } else
    if (a === 'atrás') {
        rollingSpider.backward({ steps: STEPS * 3 }, function () {
            console.log('atrás');
        });
        //rollingSpider.backward({ steps: STEPS });
        cooldown();
    } else {
        console.log('Condición no definida');
    }

    return;
};

var doQueueDroneActions = function () {
    let interval = setInterval(function () {
        if (!doActions) return;

        if (userActions.length <= 0) {
            doActions = false;
            return;
        }
        //  Ejecuto la acción del drone
        let p = userActions.pop();
        //  Elimino el ultimo valor
        droneFlight(p.action);
        io.sockets.emit('user-actions', userActions);

        return;
    }, 3000);
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
app.post('/droneaction/:action', function (req, res) {
    if (req.params.action === 'wakeupdrone') {
        ACTIVE = false;
        console.log('Iniciar drone');
        rollingSpider.connect(function (e) {
            console.log('Conectado');
            rollingSpider.setup(function () {
                rollingSpider.flatTrim();
                rollingSpider.startPing();
                rollingSpider.flatTrim();
                console.log('Dentro del setup');

                ACTIVE = true;
            });
        });

        var inter = setInterval(function () {

            if (ACTIVE) {
                console.log('Ya puedes apagar el drone');
                rollingSpider.takeOff(function () {});

                clearInterval(inter);
            }
        }, 2000);
    } else
    if (req.params.action === 'putsleep') {
        console.log('Poner a domir');
        rollingSpider.land(function () {
            console.log('Aterrizando');
            //  Mato todos los procesos actuales que ejecuta el drone
            userActions = [];
            doActions   = false;

            process.exit(0);
        });
    } else {
        console.log('Ninguna acción definida');
    }

    return res.json();
});

app.get('/', function (req, res) {
    requestSession  = req.session;
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
