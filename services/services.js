/********************************
@khrizenriquez: Christofer Enríquez <christoferen7@gmail.com>
********************************/

'use strict';

var sess = {};

function createSessionForUser (request) {
    //  Validate if session exist
    console.log(request);
    if (request.name === undefined) {
        request.appName     = 'Rolling-spider';
        request.date        = new Date();
        request.deviceInfo  = '';
    }
    console.log(request);
}

function userIsConnected () {
    return (session.name === undefined) ? false : true;
}

var connectUser = function (request) {
    let r           = request || undefined;
    let response    = {};

    //if (!userIsConnected()) {
        createSessionForUser(request);

        response.status     = 'OK';
        response.message    = 'Creo la sesión para el usuario';

        return response;
    //}

    response.status     = 'OK';
    response.message    = 'El usuario ya existe';
    return response;
}

module.exports = {
    connect: connectUser
}
