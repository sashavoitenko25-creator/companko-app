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


/* ========================================
   INIT
======================================== */

export function initMyMarker(){

    window.addEventListener(
        'location:updated',
        event => {

            const position =
                event.detail;

            if(!position)
                return;


            updateMyMarker(
                position.lat,
                position.lng
            );


            if(
                position.heading != null &&
                !Number.isNaN(
                    Number(position.heading)
                )
            ){

                setHeading(
                    Number(position.heading)
                );

            }

        }
    );


    window.addEventListener(
        'live:started',
        () => {

            isLive = true;

            refreshMarker();

        }
    );


    window.addEventListener(
        'live:stopped',
        () => {

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


    if(
        latitude == null ||
        longitude == null
    ){
        return;
    }


    const position = [
        latitude,
        longitude
    ];


    /*
     * Если маркер уже существует —
     * только координаты.
     * Сектор крутится отдельно через CSS.
     */

    if(myMarker){

        myMarker.setLatLng(
            position
        );

        return;

    }


    /*
     * Создаём маркер.
     *
     * В leaflet-rotate маркеры по умолчанию
     * в norotatePane → НЕ крутятся с картой.
     * rotateWithView: false — явно.
     */

    myMarker =
        L.marker(
            position,
            {
                icon: createIcon(),

                zIndexOffset: 1000,

                /* leaflet-rotate: не крутить маркер с картой */
                rotateWithView: false
            }
        )
        .addTo(map);


    /*
     * Центрируем карту
     * только при первом создании.
     */

    if(
        !window.__myMarkerMapCentered
    ){

        window.__myMarkerMapCentered =
            true;

        map.setView(
            position,
            15
        );

    }

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

    /* после смены иконки сразу применить heading */
    applyHeadingToSector();

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
            Number(heading)
        )
    ){

        return;

    }


    currentHeading =
        (
            Number(heading) +
            360
        ) % 360;


    applyHeadingToSector();

}


/*
 * Крутим ТОЛЬКО внутренний сектор,
 * который лежит внутри маркера.
 * Маркер сам не крутится с картой
 * (norotatePane + rotateWithView: false).
 */
function applyHeadingToSector(){

    if(!myMarker)
        return;


    const el =
        myMarker.getElement
            ? myMarker.getElement()
            : myMarker._icon;


    if(!el)
        return;


    const sector =
        el.querySelector(
            '.my-heading-sector-inner'
        );


    if(!sector)
        return;


    if(currentHeading == null){

        sector.style.opacity = '0';
        return;

    }


    sector.style.opacity = '1';

    sector.style.transform =
        `translate(-50%, -100%) rotate(${currentHeading}deg)`;

}


/* ========================================
   ANIMATION LOOP
   (на случай если иконка пересоздаётся)
======================================== */

function startUpdateLoop(){

    if(loopStarted)
        return;


    loopStarted = true;


    const frame = () => {

        applyHeadingToSector();

        requestAnimationFrame(
            frame
        );

    };


    requestAnimationFrame(
        frame
    );

}


/* ========================================
   DEVICE ORIENTATION
   Telegram Mini App + обычные браузеры
======================================== */

function startDeviceOrientation(){

    if(orientationStarted)
        return;


    orientationStarted = true;


    const handleHeading =
        (heading) => {

            if(
                heading == null ||
                Number.isNaN(
                    Number(heading)
                )
            ){
                return;
            }

            setHeading(
                Number(heading)
            );

        };


    /*
     * 1) Официальный API Telegram Mini Apps
     *    Bot API 8.0+
     *    https://core.telegram.org/bots/webapps#deviceorientation
     */

    const tg =
        window.Telegram &&
        window.Telegram.WebApp;


    if(
        tg &&
        tg.DeviceOrientation
    ){

        try{

            tg.DeviceOrientation.start(
                {
                    need_absolute: true
                },
                (started) => {

                    if(!started){
                        console.warn(
                            'TG DeviceOrientation start failed'
                        );
                        fallbackOrientation();
                        return;
                    }

                    tg.onEvent(
                        'deviceOrientationChanged',
                        (data) => {

                            /*
                             * alpha в радианах.
                             * absolute=true → относительно севера.
                             * heading ≈ 360 - alpha° (как в web)
                             */
                            if(
                                data &&
                                data.alpha != null
                            ){

                                const alphaDeg =
                                    Number(data.alpha) *
                                    (180 / Math.PI);

                                let heading =
                                    360 - alphaDeg;

                                heading =
                                    (
                                        heading +
                                        360
                                    ) % 360;

                                handleHeading(
                                    heading
                                );

                            }

                        }
                    );

                }
            );

            return;

        }catch(e){

            console.warn(
                'TG DeviceOrientation error',
                e
            );

        }

    }


    /*
     * 2) Fallback: обычный DeviceOrientationEvent
     */
    fallbackOrientation();


    function fallbackOrientation(){

        const handleOrientation =
            event => {

                let heading = null;


                /* iOS */
                if(
                    event.webkitCompassHeading != null &&
                    !Number.isNaN(
                        Number(
                            event.webkitCompassHeading
                        )
                    )
                ){

                    heading =
                        Number(
                            event.webkitCompassHeading
                        );

                }

                /* Android */
                else if(
                    event.alpha != null &&
                    !Number.isNaN(
                        Number(event.alpha)
                    )
                ){

                    heading =
                        360 -
                        Number(event.alpha);

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


                handleHeading(
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

            let permissionRequested =
                false;


            const requestPermission =
                () => {

                    if(permissionRequested)
                        return;


                    permissionRequested =
                        true;


                    DeviceOrientationEvent
                        .requestPermission()
                        .then(
                            state => {

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
                            error => {

                                console.warn(
                                    'Device orientation permission:',
                                    error
                                );

                            }
                        );

                };


            window.addEventListener(
                'touchend',
                requestPermission,
                {
                    once:true
                }
            );


            window.addEventListener(
                'click',
                requestPermission,
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

            window.addEventListener(
                'deviceorientationabsolute',
                handleOrientation,
                true
            );

        }

    }

}


/* ========================================
   ICON
   Сектор ВНУТРИ маркера
======================================== */

function createIcon(){

    /*
     * =====================================
     * LIVE MARKER
     * =====================================
     */

    if(isLive){

        const profile =
            getProfile();


        return L.divIcon({

            className:
                'my-marker-wrapper',


            html: `

                <div class="my-marker-root">

                    <div class="my-heading-sector-inner">
                        <div class="my-heading-sector__fan"></div>
                    </div>

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

                </div>

            `,


            iconSize: [
                40,
                40
            ],


            iconAnchor: [
                20,
                20
            ]

        });

    }


    /*
     * =====================================
     * ОБЫЧНЫЙ СИНИЙ МАРКЕР + СЕКТОР
     * =====================================
     */

    return L.divIcon({

        className:
            'my-marker-wrapper',


        html: `

            <div class="my-marker-root">

                <div class="my-heading-sector-inner">
                    <div class="my-heading-sector__fan"></div>
                </div>

                <div class="my-location">
                    <div class="my-location__pulse"></div>
                </div>

            </div>

        `,


        iconSize: [
            24,
            24
        ],


        iconAnchor: [
            12,
            12
        ]

    });

}
