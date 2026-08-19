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
let mapRotateBound = false;

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
    bindMapRotate();
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
            zIndexOffset: 1000
        }
    )
    .addTo(map);

    map.setView(
        position,
        15
    );

    bindMapRotate();
}

function refreshMarker(){
    if(!myMarker)
        return;

    myMarker.setIcon(
        createIcon()
    );

    applyHeadingToDom();
}

function setHeading(heading){
    if(
        heading == null ||
        Number.isNaN(heading)
    ){
        return;
    }

    currentHeading = heading;
    applyHeadingToDom();
}

function getMapBearing(){
    const map = getMap();

    if(!map)
        return 0;

    if(typeof map.getBearing === 'function'){
        return map.getBearing() || 0;
    }

    return 0;
}

function applyHeadingToDom(){
    if(currentHeading == null)
        return;

    const direction = document.querySelector(
        '.my-location__direction, .my-live-marker__direction'
    );

    if(!direction)
        return;

    const mapBearing = getMapBearing();

    // направление телефона минус поворот карты
    const visualHeading =
        (currentHeading - mapBearing + 360) % 360;

    direction.classList.add('visible');
    direction.style.transform =
        `rotate(${visualHeading}deg)`;
}

function bindMapRotate(){
    if(mapRotateBound)
        return;

    const map = getMap();

    if(!map)
        return;

    mapRotateBound = true;

    map.on('rotate', ()=>{
        applyHeadingToDom();
    });

    map.on('rotateend', ()=>{
        applyHeadingToDom();
    });

    // на всякий случай при обычном движении карты
    map.on('move', ()=>{
        applyHeadingToDom();
    });
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
                <div class="my-live-marker__direction">
                    <div class="my-live-marker__direction-fan"></div>
                </div>
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
            <div class="my-location__direction">
                <div class="my-location__direction-fan"></div>
            </div>
            <div class="my-location__pulse"></div>
        </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
}