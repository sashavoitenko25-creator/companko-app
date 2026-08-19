import L from 'leaflet';

import {
    getMap
} from './mapService';

import {
    getProfile
} from '../../features/profile/profileStore';


let myMarker = null;
let isLive = false;
let currentHeading = null;
let orientationStarted = false;
let loopStarted = false;
let sectorEl = null;
let overlayEl = null;


/* ========================================
   INIT
======================================== */

export function initMyMarker(){

    window.addEventListener('location:updated', event => {

        const position = event.detail;
        if(!position) return;

        updateMyMarker(position.lat, position.lng);

        if(
            position.heading != null &&
            !Number.isNaN(Number(position.heading))
        ){
            setHeading(Number(position.heading));
        }

    });


    window.addEventListener('live:started', () => {
        isLive = true;
        refreshMarker();
    });


    window.addEventListener('live:stopped', () => {
        isLive = false;
        refreshMarker();
    });


    startDeviceOrientation();
    startUpdateLoop();

}


/* ========================================
   UPDATE MARKER
======================================== */

export function updateMyMarker(latitude, longitude){

    const map = getMap();
    if(!map) return;

    if(latitude == null || longitude == null) return;

    const position = [latitude, longitude];


    if(myMarker){
        myMarker.setLatLng(position);
        return;
    }


    myMarker = L.marker(position, {
        icon: createIcon(),
        zIndexOffset: 1000,
        rotateWithView: false
    }).addTo(map);


    ensureSectorOverlay();


    if(!window.__myMarkerMapCentered){
        window.__myMarkerMapCentered = true;
        map.setView(position, 15);
    }

}


/* ========================================
   REFRESH MARKER
======================================== */

function refreshMarker(){

    if(!myMarker) return;
    myMarker.setIcon(createIcon());

}


/* ========================================
   HEADING
======================================== */

function setHeading(heading){

    if(heading == null || Number.isNaN(Number(heading))) return;

    currentHeading = (Number(heading) + 360) % 360;

}


/* ========================================
   OVERLAY + SECTOR (ВНЕ карты)
======================================== */

function ensureSectorOverlay(){

    if(overlayEl && document.body.contains(overlayEl)){
        return sectorEl;
    }


    /*
     * Overlay — sibling карты, НЕ внутри #map.
     * leaflet-rotate крутит только внутренности #map,
     * этот слой не затрагивается.
     */

    const mapEl = document.getElementById('map');
    const parent = mapEl && mapEl.parentElement
        ? mapEl.parentElement
        : document.body;


    overlayEl = document.createElement('div');
    overlayEl.id = 'my-heading-overlay';
    overlayEl.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        pointer-events: none;
        z-index: 5000;
        overflow: visible;
        transform: none !important;
    `;


    sectorEl = document.createElement('div');
    sectorEl.className = 'my-heading-sector';
    sectorEl.innerHTML = `<div class="my-heading-sector__fan"></div>`;

    sectorEl.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        width: 56px;
        height: 70px;
        margin: 0;
        padding: 0;
        pointer-events: none;
        opacity: 1;
        transform-origin: 50% 100%;
        will-change: transform, left, top;
        transform: translate(-50%, -100%) rotate(0deg);
    `;


    overlayEl.appendChild(sectorEl);
    parent.appendChild(overlayEl);


    return sectorEl;

}


function getMarkerElement(){

    if(!myMarker) return null;

    return myMarker.getElement
        ? myMarker.getElement()
        : myMarker._icon;

}


/* ========================================
   UPDATE SCREEN
   позиция = экранные координаты маркера
   угол   = ТОЛЬКО компас (без bearing карты)
======================================== */

function updateScreen(){

    if(!myMarker) return;

    const marker = getMarkerElement();
    if(!marker) return;

    const sector = ensureSectorOverlay();
    if(!sector) return;


    const rect = marker.getBoundingClientRect();
    const parentRect = overlayEl.getBoundingClientRect();


    /*
     * Координаты относительно overlay (absolute),
     * а не fixed — так Telegram WebView
     * не ломает позицию transform-предками.
     */
    const centerX = rect.left + rect.width / 2 - parentRect.left;
    const centerY = rect.top + rect.height / 2 - parentRect.top;


    sector.style.left = `${centerX}px`;
    sector.style.top = `${centerY}px`;


    /*
     * ВАЖНО: только heading телефона.
     * map.getBearing() НЕ используем.
     * Крутишь карту → сектор на экране стоит.
     * Крутишь телефон → сектор крутится.
     */
    const angle = currentHeading == null ? 0 : currentHeading;

    sector.style.transform =
        `translate(-50%, -100%) rotate(${angle}deg)`;

    sector.style.opacity = '1';

}


/* ========================================
   ANIMATION LOOP
======================================== */

function startUpdateLoop(){

    if(loopStarted) return;
    loopStarted = true;

    const frame = () => {
        updateScreen();
        requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);

}


/* ========================================
   DEVICE ORIENTATION (Android + TG)
======================================== */

function startDeviceOrientation(){

    if(orientationStarted) return;
    orientationStarted = true;


    const handleHeading = (heading) => {

        if(heading == null || Number.isNaN(Number(heading))) return;
        setHeading(Number(heading));

    };


    /* 1) Telegram Mini App API */
    const tg = window.Telegram && window.Telegram.WebApp;

    if(tg && tg.DeviceOrientation){

        try{

            const onTg = (data) => {

                if(!data || data.alpha == null) return;

                const alphaDeg = Number(data.alpha) * (180 / Math.PI);
                const heading = (360 - alphaDeg + 360) % 360;
                handleHeading(heading);

            };

            if(typeof tg.onEvent === 'function'){
                tg.onEvent('deviceOrientationChanged', onTg);
                tg.onEvent('device_orientation_changed', onTg);
            }

            tg.DeviceOrientation.start(
                { need_absolute: true },
                (ok) => {
                    console.log('[compass] TG start →', ok);
                }
            );

        }catch(e){
            console.warn('[compass] TG error', e);
        }

    }


    /* 2) Web API (Android обычно без permission) */
    const handleOrientation = (event) => {

        let heading = null;

        if(
            event.webkitCompassHeading != null &&
            !Number.isNaN(Number(event.webkitCompassHeading))
        ){
            heading = Number(event.webkitCompassHeading);
        }
        else if(
            event.alpha != null &&
            !Number.isNaN(Number(event.alpha))
        ){
            heading = 360 - Number(event.alpha);
        }

        if(heading == null || Number.isNaN(heading)) return;

        handleHeading((heading + 360) % 360);

    };


    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);

    console.log('[compass] web listeners attached');

}


/* ========================================
   ICON (без сектора — сектор снаружи)
======================================== */

function createIcon(){

    if(isLive){

        const profile = getProfile();

        return L.divIcon({
            className: 'my-marker-wrapper',
            html: `
                <div class="my-live-marker">
                    <img src="${profile?.photo_url || 'https://i.pravatar.cc/150'}">
                    <div class="my-live-marker__badge">
                        <span class="my-live-marker__badge-dot"></span>
                        LIVE
                    </div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

    }


    return L.divIcon({
        className: 'my-marker-wrapper',
        html: `
            <div class="my-location">
                <div class="my-location__pulse"></div>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

}