/*
    @khrizenriquez: Christofer Enríquez
    christoferen7@gmail.com
*/

'use strict';
var droneActions;

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
                txtResponse += `<div id="${element.id}">${element.action} <span class="userAction">+</span></div>`;
            });
            droneActions        = response;
            element.innerHTML   = txtResponse;

            userAction();
        }
    };
    xhr.open('GET', 'data.json', true);
    xhr.send(null);
}();
