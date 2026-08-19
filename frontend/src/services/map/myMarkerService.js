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
let sectorEl = null;
let loopStarted = false;

export function initMyMarker(){

    window.addEventListener(
        'location:updated',
        (event)=>{
            const position = event.detail;

            updateMyMarker(
                position.lat,
                position.lng
            );

            if(
                position.heading != null &&
                !Number.isNaN(position.heading)
            ){
                setHeading(position.heading);
            }
        }
    );

    window.addEventListener(
        'live:started',
        ()=>{
            isLive = true;
            refreshMarker();
        }
    );

    window.addEventListener(
        'live:stopped',
        ()=>{
            isLive = false;
            refreshMarker();
        }
    );

    startDeviceOrientation();
    startUpdateLoop();
}

export function updateMyMarker(
    latitude,
    longitude
){
    const map = getMap();

    if(!map)
        return;

    const position = [
        latitude,
        longitude
    ];

    if(myMarker){
        myMarker.setLatLng(position);
        return;
    }

    myMarker = L.marker(
        position,
        {
            icon: createIcon(),
            zIndexOffset: 1000,
            rotateWithView: false
        }
    )
    .addTo(map);

    ensureSectorEl();

    map.setView(
        position,
        15
    );

    startUpdateLoop();
}

function refreshMarker(){
    if(!myMarker)
        return;

    myMarker.setIcon(
        createIcon()
    );
}

function setHeading(heading){
    if(
        heading == null ||
        Number.isNaN(heading)
    ){
        return;
    }

    currentHeading = heading;
}

function getMapBearingDeg(){
    const map = getMap();

    if(!map)
        return 0;

    if(typeof map.getBearing === 'function'){
        const b = map.getBearing();
        if(typeof b === 'number' && !Number.isNaN(b)){
            return b;
        }
    }

    // _bearing в радианах
    if(typeof map._bearing === 'number'){
        return map._bearing * (180 / Math.PI);
    }

    return 0;
}

function ensureSectorEl(){
    if(sectorEl && document.body.contains(sectorEl))
        return sectorEl;

    sectorEl = document.createElement('div');
    sectorEl.className = 'my-heading-sector';
    sectorEl.innerHTML =
        '<div class="my-heading-sector__fan"></div>';

    document.body.appendChild(sectorEl);

    return sectorEl;
}

function getMarkerIcon(){
    if(!myMarker)
        return null;

    return myMarker.getElement
        ? myMarker.getElement()
        : myMarker._icon;
}

/* ========================================
   Каждый кадр:
   1) маркер контр-вращаем → не крутится с картой
   2) сектор fixed → только компас
======================================== */

function updateFrame(){
    const map = getMap();

    if(!map || !myMarker)
        return;

    const bearing = getMapBearingDeg();
    const icon = getMarkerIcon();

    // --- 1. Маркер всегда «стоит» на экране ---
    if(icon){
        const pos = L.DomUtil.getPosition(icon);

        if(pos){
            icon.style.transform =
                `translate3d(${pos.x}px, ${pos.y}px, 0px) rotate(${-bearing}deg)`;
        }
    }

    // --- 2. Сектор ---
    const el = ensureSectorEl();

    if(!el)
        return;

    if(currentHeading == null || !icon){
        el.classList.remove('visible');
        return;
    }

    const rect = icon.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    el.style.left = cx + 'px';
    el.style.top = cy + 'px';

    // Только направление телефона.
    // Карта на сектор не влияет.
    el.style.transform =
        `translate(-50%, -100%) rotate(${currentHeading}deg)`;

    el.classList.add('visible');
}

function startUpdateLoop(){
    if(loopStarted)
        return;

    loopStarted = true;

    const tick = ()=>{
        updateFrame();
        requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
}

function startDeviceOrientation(){
    if(orientationStarted)
        return;

    orientationStarted = true;

    const handleOrientation = (event)=>{
        let heading = null;

        if(event.webkitCompassHeading != null){
            heading = event.webkitCompassHeading;
        }
        else if(event.alpha != null){
            heading = 360 - event.alpha;
        }

        if(
            heading == null ||
            Number.isNaN(heading)
        ){
            return;
        }

        heading = (heading + 360) % 360;
        setHeading(heading);
    };

    if(
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
    ){
        const request = ()=>{
            DeviceOrientationEvent
                .requestPermission()
                .then(state=>{
                    if(state === 'granted'){
                        window.addEventListener(
                            'deviceorientation',
                            handleOrientation,
                            true
                        );
                    }
                })
                .catch(()=>{});
        };

        window.addEventListener(
            'touchend',
            request,
            { once: true }
        );

        window.addEventListener(
            'click',
            request,
            { once: true }
        );
    }
    else{
        window.addEventListener(
            'deviceorientation',
            handleOrientation,
            true
        );
    }
}

function createIcon(){

    if(isLive){
        const profile = getProfile();

        return L.divIcon({
            className: '',
            html: `
            <div class="my-live-marker">
                <img
                    src="${
                        profile?.photo_url ||
                        'https://i.pravatar.cc/150'
                    }"
                >
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
        className: '',
        html: `
        <div class="my-location">
            <div class="my-location__pulse"></div>
        </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
}