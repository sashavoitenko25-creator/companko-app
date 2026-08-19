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
        updateSectorPosition();
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

    updateSectorPosition();
}

function setHeading(heading){
    if(
        heading == null ||
        Number.isNaN(heading)
    ){
        return;
    }

    currentHeading = heading;
    updateSectorPosition();
}

/* ========================================
   Сектор ВНЕ карты — position:fixed
   Не зависит от leaflet-rotate
======================================== */

function ensureSectorEl(){
    if(sectorEl && document.body.contains(sectorEl))
        return sectorEl;

    sectorEl = document.createElement('div');
    sectorEl.className = 'my-heading-sector';
    sectorEl.innerHTML =
        '<div class="my-heading-sector__fan"></div>';

    // В body — полностью вне #map и leaflet-map-pane
    document.body.appendChild(sectorEl);

    return sectorEl;
}

function updateSectorPosition(){
    if(!myMarker)
        return;

    const el = ensureSectorEl();
    if(!el)
        return;

    if(currentHeading == null){
        el.classList.remove('visible');
        return;
    }

    // Реальные экранные координаты иконки маркера
    const icon = myMarker.getElement
        ? myMarker.getElement()
        : myMarker._icon;

    if(!icon){
        el.classList.remove('visible');
        return;
    }

    const rect = icon.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    el.style.left = cx + 'px';
    el.style.top = cy + 'px';

    // Только компас телефона. Карта НЕ влияет.
    el.style.transform =
        `translate(-50%, -100%) rotate(${currentHeading}deg)`;

    el.classList.add('visible');
}

function startUpdateLoop(){
    if(loopStarted)
        return;

    loopStarted = true;

    const tick = ()=>{
        updateSectorPosition();
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