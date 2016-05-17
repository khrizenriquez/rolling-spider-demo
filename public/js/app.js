/*
    @khrizenriquez: Christofer Enríquez
    christoferen7@gmail.com
*/
'use strict';

var ipData = (window.location.href.match('localhost') !== null) ? 'localhost' : '192.168.0.18';

var droneActions, 
    socket = io.connect(`http://${ipData}:3001`, { 'forceNew': true });

socket.on('user-connected', function (data) {
    if (document.querySelector('#clients') !== null) {
        var tmpResponse = '';
        data.some(function (element, index, arr) {
            tmpResponse += `<div>${element.myName}</div>`;
        });
        document.querySelector('#clients .clients').innerHTML = tmpResponse;
    }

});
socket.on('user-actions', function (data) {
    console.log('Acciones del usuario');
    console.log(data);
    getDroneActions();
});

var userAction = function (elementId) {
    var actionId = parseInt(elementId);
    var actionObject;
    droneActions.some(function (element, index, arr) {
        if (element.id === actionId) {
            actionObject = element;
            return true;
        }
    });

    socket.on('user-actions', function (data) {
        var queueList = document.querySelector('#queue-list .list');
        var tmpData = '';

        data.some(function (element, index, arr) {
            if (element === null) return;
            tmpData += `<div id="${element.id}">${element.action}</div>`;
        });
        queueList.innerHTML = tmpData;
        //console.log(data);
    });
    socket.emit('user-actions', { userActions: actionObject });
    /*document.querySelector('#options-container .options-container-elements').addEventListener('click', function (evt) {
        
    });*/
};
/*
*   Obtenemos las acciones que el drone podrá ejecutar
*/
var getDroneActions = function () {
    var xhr = new XMLHttpRequest();
    var element = document.querySelector('#options-container .options-container-elements');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var response    = JSON.parse(xhr.responseText);
            var actionPart  = document.createElement("div");
            var txtResponse = '';
            response.some(function (element, index, arr) {
                txtResponse += `<div onclick="return userAction(this.id);" class="drone-actions-list relative" id="${element.id}">${element.action} <span class="userAction drone-actions-list-icon">+</span></div>`;
            });
            droneActions        = response;
            element.innerHTML   = txtResponse;
        }
    };
    xhr.open('GET', 'data.json', true);
    xhr.send(null);
};

document.addEventListener('DOMContentLoaded', function (e) {
    var button     = document.querySelector('#connect');
    var userName   = document.querySelector('#username');
    if (button !== null) {
        button.addEventListener('click', function (e) {
            //var socket = io('/rolling-chanel');
            e.preventDefault();

            if (/^\s*$/.test(document.querySelector('#username').value)) {
                return false;
            }

            socket.on('user-connected', function (data) {
                console.log(data[0].myName);
                if (data[0].myName === undefined) {
                    return false;
                }

                var login = document.querySelector('.login-container');
                login.style.right = '100%';
                var clientDiv = document.querySelector('#clientActions');
                setTimeout(function () {
                    clientDiv.classList.remove('display-none');
                    getDroneActions();
                }, 1000);

                return false;
            });
            socket.emit('user-connected', { myName: userName.value });
        });
    }
});
