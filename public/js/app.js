/*
    @khrizenriquez: Christofer Enríquez
    christoferen7@gmail.com
*/

'use strict';

function handleOrientation (event) {
    var absolute = event.absolute || 0;
    var alpha    = event.alpha || 0;
    var beta     = event.beta || 0;
    var gamma    = event.gamma || 0;

    var alphaSpan   = document.querySelector('#alpha-position');
    var betaSpan    = document.querySelector('#beta-position');
    var gammaSpan   = document.querySelector('#gamma-position');

    alphaSpan.innerHTML = alpha;
    betaSpan.innerHTML  = beta;
    gammaSpan.innerHTML = gamma;

    document.querySelector('#temp').innerHTML = absolute;
}

function containersSize () {
    document.querySelector('#image-container').style.height     = window.innerHeight + 'px';
    document.querySelector('#options-container').style.height   = window.innerHeight + 'px';
}

//  Obteniendo el valor del alto de la pantalla
document.addEventListener('DOMContentLoaded', function (e) {
    //  Tamaño del fondo
    containersSize();

    //  Manipulación de la orientación del dispositivo
    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", handleOrientation);
    } else {
        console.log("Sorry, your browser doesn't support Device Orientation");
    }
});
