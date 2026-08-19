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

                !Number.isNaN(
                    position.heading
                )

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
   UPDATE MY MARKER
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


    myMarker = L.marker(

        position,

        {

            icon:
                createIcon(),

            zIndexOffset:
                1000,

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
   REFRESH MARKER
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

        Number.isNaN(
            heading
        )

    ){

        return;

    }


    currentHeading =
        heading;


}


/* ========================================
   SECTOR ELEMENT
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

        <div
            class="my-heading-sector__fan">
        </div>

    `;


    document.body.appendChild(
        sectorEl
    );


    return sectorEl;

}


/* ========================================
   GET MARKER SCREEN POSITION
======================================== */

function getMyScreenPosition(){

    const map =
        getMap();


    if(
        !map ||
        !myMarker
    ){

        return null;

    }


    const latLng =
        myMarker.getLatLng();


    if(!latLng)
        return null;


    const point =
        map.latLngToContainerPoint(
            latLng
        );


    const mapContainer =
        map.getContainer();


    const rect =
        mapContainer.getBoundingClientRect();


    return {

        x:
            rect.left +
            point.x,

        y:
            rect.top +
            point.y

    };

}


/* ========================================
   UPDATE SECTOR
======================================== */

function updateSector(){

    const el =
        ensureSectorEl();


    if(!el)
        return;


    if(
        currentHeading == null ||
        !myMarker
    ){

        el.classList.remove(
            'visible'
        );

        return;

    }


    const position =
        getMyScreenPosition();


    if(!position){

        el.classList.remove(
            'visible'
        );

        return;

    }


    /*
    ========================================
    ПОЗИЦИЯ

    Сектор всегда находится
    прямо над моей точкой.

    Он НЕ является частью карты.
    ========================================
    */


    el.style.left =
        position.x + 'px';


    el.style.top =
        position.y + 'px';


    /*
    ========================================
    ВАЖНО

    Здесь НЕТ map bearing.

    Поэтому вращение карты
    НЕ вращает сектор.

    Сектор меняет направление
    только когда меняется heading
    телефона.
    ========================================
    */


    el.style.transform =

        `translate(-50%, -50%) rotate(${currentHeading}deg)`;


    el.classList.add(
        'visible'
    );

}


/* ========================================
   UPDATE MARKER
======================================== */

function updateMarker(){

    if(!myMarker)
        return;


    const icon =
        myMarker.getElement();


    if(!icon)
        return;


    /*
    Leaflet сам управляет
    transform у marker.

    Поэтому НЕ трогаем
    transform самого icon.
    */


    const content =
        icon.querySelector(
            '.my-marker-content'
        );


    if(!content)
        return;


    const map =
        getMap();


    if(!map)
        return;


    let bearing = 0;


    if(
        typeof map.getBearing ===
        'function'
    ){

        const value =
            map.getBearing();


        if(
            typeof value === 'number' &&
            !Number.isNaN(value)
        ){

            bearing = value;

        }

    }


    else if(
        typeof map._bearing ===
        'number'
    ){

        bearing =
            map._bearing *
            (180 / Math.PI);

    }


    /*
    ========================================
    МАРКЕР КОНТР-ВРАЩАЕТСЯ

    Карта повернулась на +30°
    → содержимое маркера поворачиваем
    на -30°.

    Сам Leaflet transform
    НЕ изменяем.
    ========================================
    */


    content.style.transform =

        `rotate(${-bearing}deg)`;

}


/* ========================================
   UPDATE FRAME
======================================== */

function updateFrame(){

    const map =
        getMap();


    if(!map)
        return;


    updateMarker();

    updateSector();

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

            let heading = null;


            /*
            iPhone / Safari
            */

            if(
                event.webkitCompassHeading != null
            ){

                heading =
                    event.webkitCompassHeading;

            }


            /*
            Android / другие браузеры
            */

            else if(
                event.alpha != null
            ){

                heading =
                    360 -
                    event.alpha;

            }


            if(

                heading == null ||

                Number.isNaN(
                    heading
                )

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


    /*
    ========================================
    IOS PERMISSION
    ========================================
    */

    if(

        typeof DeviceOrientationEvent !==
        'undefined' &&

        typeof DeviceOrientationEvent
            .requestPermission ===
            'function'

    ){

        const request = ()=>{

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
   CREATE MARKER ICON
======================================== */

function createIcon(){


    if(isLive){

        const profile =
            getProfile();


        return L.divIcon({

            className:
                '',

            html:`

                <div
                    class="my-marker-content">

                    <div
                        class="my-live-marker">

                        <img
                            src="${
                                profile?.photo_url ||
                                'https://i.pravatar.cc/150'
                            }"
                        >

                        <div
                            class="my-live-marker__badge">

                            <span
                                class="my-live-marker__badge-dot">
                            </span>

                            LIVE

                        </div>

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

        className:
            '',

        html:`

            <div
                class="my-marker-content">

                <div
                    class="my-location">

                    <div
                        class="my-location__pulse">
                    </div>

                </div>

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