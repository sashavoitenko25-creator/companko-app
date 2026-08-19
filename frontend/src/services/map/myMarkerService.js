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


    /* отладка из консоли: window.__headingDebug() */
    window.__headingDebug = () => {

        const map = getMap();
        const sector = sectorEl;

        console.log({
            heading: currentHeading,
            bearing: map && map.getBearing ? map.getBearing() : null,
            sectorInBody: !!(sector && sector.parentElement === document.body),
            sectorTransform: sector ? sector.style.transform : null,
            parentTransform: sector && sector.parentElement
                ? getComputedStyle(sector.parentElement).transform
                : null
        });

    };

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

    ensureSector();

    if(!window.__myMarkerMapCentered){
        window.__myMarkerMapCentered = true;
        map.setView(position, 15);
    }

}


function refreshMarker(){

    if(!myMarker) return;
    myMarker.setIcon(createIcon());

}


function setHeading(heading){

    if(heading == null || Number.isNaN(Number(heading))) return;
    currentHeading = (Number(heading) + 360) % 360;

}


/* ========================================
   SECTOR — только document.body + fixed
======================================== */

function ensureSector(){

    if(sectorEl && document.body.contains(sectorEl)){
        return sectorEl;
    }

    sectorEl = document.createElement('div');
    sectorEl.className = 'my-heading-sector';
    sectorEl.innerHTML = `<div class="my-heading-sector__fan"></div>`;

    /*
     * КРИТИЧНО:
     * только body + position:fixed
     * иначе любой transform у родителя
     * (Telegram WebView / leaflet)
     * крутит сектор вместе с картой
     */
    sectorEl.style.cssText = `
        position: fixed !important;
        left: 0px;
        top: 0px;
        width: 56px;
        height: 70px;
        margin: 0;
        padding: 0;
        pointer-events: none;
        z-index: 2147483647;
        opacity: 1;
        transform-origin: 50% 100%;
        will-change: transform;
        transform: translate3d(0px, 0px, 0px) rotate(0deg);
    `;

    document.body.appendChild(sectorEl);
    return sectorEl;

}


function getMarkerElement(){

    if(!myMarker) return null;
    return myMarker.getElement ? myMarker.getElement() : myMarker._icon;

}


function updateScreen(){

    if(!myMarker) return;

    const marker = getMarkerElement();
    if(!marker) return;

    const sector = ensureSector();
    if(!sector) return;

    const rect = marker.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const angle = currentHeading == null ? 0 : currentHeading;

    /*
     * Угол = ТОЛЬКО компас.
     * bearing карты НЕ используем.
     */
    sector.style.transform =
        `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%) rotate(${angle}deg)`;

}


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
   COMPASS
======================================== */

function startDeviceOrientation(){

    if(orientationStarted) return;
    orientationStarted = true;

    const handleHeading = (heading) => {
        if(heading == null || Number.isNaN(Number(heading))) return;
        setHeading(Number(heading));
    };


    const tg = window.Telegram && window.Telegram.WebApp;

    if(tg && tg.DeviceOrientation){

        try{

            const onTg = (data) => {
                if(!data || data.alpha == null) return;
                const alphaDeg = Number(data.alpha) * (180 / Math.PI);
                handleHeading((360 - alphaDeg + 360) % 360);
            };

            if(typeof tg.onEvent === 'function'){
                tg.onEvent('deviceOrientationChanged', onTg);
                tg.onEvent('device_orientation_changed', onTg);
            }

            tg.DeviceOrientation.start({ need_absolute: true }, (ok) => {
                console.log('[compass] TG start →', ok);
            });

        }catch(e){
            console.warn('[compass] TG error', e);
        }

    }


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
   ICON
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