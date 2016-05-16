/*
    @khrizenriquez: Christofer Enríquez
    christoferen7@gmail.com
*/
'use strict';

var droneActions, 
    socket = io.connect(`http://${localIp}:3001`, { 'forceNew': true });

socket.on('user-connected', function (data) {
    if (document.querySelector('#clients') !== null) {
        let tmpResponse = '';
        data.some(function (element, index, arr) {
            tmpResponse += `<div>${element.myName}</div>`;
        });
        document.querySelector('#clients .clients').innerHTML = tmpResponse;
    }

});
socket.on('user-actions', function (data) {
    console.log('Acciones del usuario');
    console.log(data);
});

var userAction = function () {
    document.querySelector('#options-container .options-container-elements').addEventListener('click', function (evt) {
        let actionId = parseInt(evt.target.id);
        let actionObject;
        droneActions.some(function (element, index, arr) {
            if (element.id === actionId) {
                actionObject = element;
                return true;
            }
        });

        socket.on('user-actions', function (data) {
            let queueList = document.querySelector('#queue-list .list');
            let tmpData = '';

            data.some(function (element, index, arr) {
                if (element === null) return;
                console.log(element.id);
                tmpData += `<div id="${element.id}">${element.action}</div>`;
            });
            queueList.innerHTML = tmpData;
            //console.log(data);
        });
        socket.emit('user-actions', { userActions: actionObject });
    });
};
/*
*   Obtenemos las acciones que el drone podrá ejecutar
*/
var getDroneActions = function () {
    let xhr = new XMLHttpRequest();
    let element = document.querySelector('#options-container .options-container-elements');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            let response    = JSON.parse(xhr.responseText);
            let actionPart  = document.createElement("div");
            let txtResponse = '';
            response.some(function (element, index, arr) {
                txtResponse += `<div class="drone-actions-list relative" id="${element.id}">${element.action} <span class="userAction drone-actions-list-icon">+</span></div>`;
            });
            droneActions        = response;
            element.innerHTML   = txtResponse;

            userAction();
        }
    };
    xhr.open('GET', 'data.json', true);
    xhr.send(null);
};

document.addEventListener('DOMContentLoaded', function (e) {
    let button     = document.querySelector('#connect');
    let userName   = document.querySelector('#username');
    if (button !== null) {
        button.addEventListener('click', function (e) {
            //let socket = io('/rolling-chanel');
            e.preventDefault();

            if (/^\s*$/.test(document.querySelector('#username').value)) {
                return false;
            }

            socket.on('user-connected', function (data) {
                console.log(data[0].myName);
                if (data[0].myName === undefined) {
                    return false;
                }

                let login = document.querySelector('.login-container');
                login.style.right = '100%';
                let clientDiv = document.querySelector('#clientActions');
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
