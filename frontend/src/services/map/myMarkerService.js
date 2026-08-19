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
let compensateRafId = null;

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
    startBearingCompensateLoop();
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

    startBearingCompensateLoop();
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

/* ========================================
   Угол поворота карты из DOM (надёжно)
======================================== */

function getMapBearingFromDOM(){
    const map = getMap();

    if(!map)
        return 0;

    // разные варианты панели у leaflet-rotate
    const pane =
        map.getPane?.('mapPane') ||
        map._mapPane ||
        document.querySelector('.leaflet-map-pane') ||
        document.querySelector('.leaflet-rotate-pane') ||
        document.querySelector('.leaflet-proxy');

    if(!pane)
        return 0;

    const style = window.getComputedStyle(pane);
    const transform =
        style.transform ||
        style.webkitTransform ||
        '';

    if(!transform || transform === 'none'){
        // fallback API
        if(typeof map.getBearing === 'function'){
            return map.getBearing() || 0;
        }
        return map._bearing || 0;
    }

    // matrix(a, b, c, d, tx, ty)
    const m2 = transform.match(/matrix\(([^)]+)\)/);
    if(m2){
        const v = m2[1].split(',').map(Number);
        const angle = Math.atan2(v[1], v[0]) * (180 / Math.PI);
        return ((angle % 360) + 360) % 360;
    }

    // matrix3d(...)
    const m3 = transform.match(/matrix3d\(([^)]+)\)/);
    if(m3){
        const v = m3[1].split(',').map(Number);
        const angle = Math.atan2(v[1], v[0]) * (180 / Math.PI);
        return ((angle % 360) + 360) % 360;
    }

    // rotate(Xdeg)
    const r = transform.match(/rotate\((-?[\d.]+)deg\)/);
    if(r){
        const angle = Number(r[1]);
        return ((angle % 360) + 360) % 360;
    }

    if(typeof map.getBearing === 'function'){
        return map.getBearing() || 0;
    }

    return map._bearing || 0;
}

function applyHeadingToDom(){
    if(currentHeading == null)
        return;

    const direction = document.querySelector(
        '.my-location__direction, .my-live-marker__direction'
    );

    if(!direction)
        return;

    const mapBearing = getMapBearingFromDOM();

    // Маркер крутится с картой на mapBearing.
    // Сектор контр-вращаем, чтобы он оставался
    // направленным туда, куда смотрит телефон.
    let angle = currentHeading - mapBearing;
    angle = ((angle % 360) + 360) % 360;

    direction.classList.add('visible');
    direction.style.transform =
        `rotate(${angle}deg)`;
}

/* ========================================
   Постоянная компенсация на каждом кадре
======================================== */

function startBearingCompensateLoop(){
    if(compensateRafId)
        return;

    const tick = ()=>{
        applyHeadingToDom();
        compensateRafId = requestAnimationFrame(tick);
    };

    compensateRafId = requestAnimationFrame(tick);
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