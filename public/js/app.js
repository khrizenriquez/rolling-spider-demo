/*
    @khrizenriquez: Christofer Enríquez
    christoferen7@gmail.com
*/

'use strict';

/*
*   Obtenemos las acciones que el drone podrá ejecutar
*/
var getDroneActions = function () {
    let xhr = new XMLHttpRequest();
    let element = document.querySelector('#options-container');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            let response    = JSON.parse(xhr.responseText);
            let actionPart  = document.createElement("div");
            let txtResponse = '';
            response.some(function (element, index, arr) {
                txtResponse+= `<div>${element.action}</div>`;
            });
            element.innerHTML += txtResponse;
        }
    };
    xhr.open('GET', 'data.json', true);
    xhr.send(null);
}();
