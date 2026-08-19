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


/* ========================================
   INIT
======================================== */

export function initMyMarker(){

    window.addEventListener(
        'location:updated',
        (event)=>{

            const position =
                event.detail;

            updateMyMarker(
                position.lat,
                position.lng
            );

            if(
                position.heading != null &&
                !Number.isNaN(position.heading)
            ){

                setHeading(
                    position.heading
                );

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


/* ========================================
   UPDATE MARKER
======================================== */

export function updateMyMarker(
    latitude,
    longitude
){

    const map =
        getMap();

    if(!map)
        return;


    const position = [
        latitude,
        longitude
    ];


    if(myMarker){

        myMarker.setLatLng(
            position
        );

        return;

    }


    myMarker =
        L.marker(
            position,
            {

                icon:
                    createIcon(),

                zIndexOffset:
                    1000,

                /*
                 * ВАЖНО:
                 * Leaflet rotate не должен
                 * вращать наш marker.
                 */
                rotateWithView:
                    false

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


/* ========================================
   REFRESH ICON
======================================== */

function refreshMarker(){

    if(!myMarker)
        return;


    myMarker.setIcon(
        createIcon()
    );

}


/* ========================================
   HEADING
======================================== */

function setHeading(
    heading
){

    if(
        heading == null ||
        Number.isNaN(heading)
    ){

        return;

    }


    currentHeading =
        (
            Number(heading) + 360
        ) % 360;

}


/* ========================================
   MAP BEARING
======================================== */

function getMapBearingDeg(){

    const map =
        getMap();

    if(!map)
        return 0;


    if(
        typeof map.getBearing ===
        'function'
    ){

        const bearing =
            map.getBearing();

        if(
            typeof bearing === 'number' &&
            !Number.isNaN(bearing)
        ){

            return bearing;

        }

    }


    if(
        typeof map._bearing ===
        'number'
    ){

        return (
            map._bearing *
            (180 / Math.PI)
        );

    }


    return 0;

}


/* ========================================
   SECTOR
======================================== */

function ensureSectorEl(){

    if(
        sectorEl &&
        document.body.contains(
            sectorEl
        )
    ){

        return sectorEl;

    }


    sectorEl =
        document.createElement(
            'div'
        );


    sectorEl.className =
        'my-heading-sector';


    sectorEl.innerHTML = `
        <div class="my-heading-sector__fan"></div>
    `;


    /*
     * Сектор находится поверх карты,
     * поэтому сам Leaflet rotate
     * его не вращает.
     */
    document.body.appendChild(
        sectorEl
    );


    return sectorEl;

}


/* ========================================
   GET MARKER ELEMENT
======================================== */

function getMarkerIcon(){

    if(!myMarker)
        return null;


    return myMarker.getElement
        ? myMarker.getElement()
        : myMarker._icon;

}


/* ========================================
   UPDATE FRAME
======================================== */

function updateFrame(){

    const map =
        getMap();

    if(
        !map ||
        !myMarker
    ){

        return;

    }


    const icon =
        getMarkerIcon();


    if(!icon)
        return;


    const bearing =
        getMapBearingDeg();


    /*
     * ======================================
     * MARKER
     * ======================================
     *
     * Leaflet при вращении карты может
     * передавать transform самому marker.
     *
     * Мы НЕ заменяем transform целиком,
     * потому что это ломает позиционирование
     * Leaflet.
     *
     * Вместо этого компенсируем только
     * rotation через отдельный внутренний
     * элемент.
     */


    const markerContent =
        icon.querySelector(
            '.my-live-marker, .my-location'
        );


    if(markerContent){

        markerContent.style.transform =
            `rotate(${-bearing}deg)`;

    }


    /*
     * ======================================
     * SECTOR
     * ======================================
     */

    const el =
        ensureSectorEl();


    if(
        currentHeading == null
    ){

        el.classList.remove(
            'visible'
        );

        return;

    }


    const rect =
        icon.getBoundingClientRect();


    const cx =
        rect.left +
        rect.width / 2;


    const cy =
        rect.top +
        rect.height / 2;


    /*
     * Сектор позиционируется
     * относительно экрана.
     *
     * Поэтому вращение карты
     * на него не влияет.
     */

    el.style.left =
        `${cx}px`;


    el.style.top =
        `${cy}px`;


    /*
     * heading телефона —
     * единственный источник
     * направления сектора.
     */

    el.style.transform =
        `
        translate(-50%, -100%)
        rotate(${currentHeading}deg)
        `;


    el.classList.add(
        'visible'
    );

}


/* ========================================
   ANIMATION LOOP
======================================== */

function startUpdateLoop(){

    if(loopStarted)
        return;


    loopStarted = true;


    const tick = ()=>{

        updateFrame();

        requestAnimationFrame(
            tick
        );

    };


    requestAnimationFrame(
        tick
    );

}


/* ========================================
   DEVICE ORIENTATION
======================================== */

function startDeviceOrientation(){

    if(orientationStarted)
        return;


    orientationStarted = true;


    const handleOrientation =
        (event)=>{

            let heading =
                null;


            if(
                event.webkitCompassHeading != null
            ){

                heading =
                    event.webkitCompassHeading;

            }

            else if(
                event.alpha != null
            ){

                heading =
                    360 -
                    event.alpha;

            }


            if(
                heading == null ||
                Number.isNaN(heading)
            ){

                return;

            }


            heading =
                (
                    heading +
                    360
                ) % 360;


            setHeading(
                heading
            );

        };


    if(
        typeof DeviceOrientationEvent !==
        'undefined' &&

        typeof DeviceOrientationEvent
            .requestPermission ===
        'function'
    ){

        const request =
            ()=>{

                DeviceOrientationEvent
                    .requestPermission()
                    .then(
                        state=>{

                            if(
                                state ===
                                'granted'
                            ){

                                window.addEventListener(
                                    'deviceorientation',
                                    handleOrientation,
                                    true
                                );

                            }

                        }
                    )
                    .catch(
                        ()=>{}
                    );

            };


        window.addEventListener(
            'touchend',
            request,
            {
                once:true
            }
        );


        window.addEventListener(
            'click',
            request,
            {
                once:true
            }
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


/* ========================================
   ICON
======================================== */

function createIcon(){

    if(isLive){

        const profile =
            getProfile();


        return L.divIcon({

            className:'',


            html:`

                <div
                    class="my-live-marker"
                >

                    <img
                        src="${
                            profile?.photo_url ||
                            'https://i.pravatar.cc/150'
                        }"
                    >

                    <div
                        class="my-live-marker__badge"
                    >

                        <span
                            class="my-live-marker__badge-dot"
                        ></span>

                        LIVE

                    </div>

                </div>

            `,


            iconSize:[
                40,
                40
            ],


            iconAnchor:[
                20,
                20
            ]

        });

    }


    return L.divIcon({

        className:'',


        html:`

            <div
                class="my-location"
            >

                <div
                    class="my-location__pulse"
                ></div>

            </div>

        `,


        iconSize:[
            24,
            24
        ],


        iconAnchor:[
            12,
            12
        ]

    });

}