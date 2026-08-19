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


    if(myMarker){

        myMarker.setLatLng(
            position
        );

        return;

    }


    /*
     * Маркер в norotatePane (leaflet-rotate).
     * rotateWithView: false — не крутится с картой.
     */

    myMarker =
        L.marker(
            position,
            {
                icon: createIcon(),

                zIndexOffset: 1000,

                rotateWithView: false
            }
        )
        .addTo(map);


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


    /* сразу показать сектор (даже без компаса) */
    applyHeadingToSector();

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
 * Крутим только внутренний сектор.
 * Маркер сам не крутится с картой.
 *
 * Если компаса ещё нет — сектор всё равно
 * виден (смотрит «вверх» = 0°), чтобы
 * было понятно, что он есть.
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


    const angle =
        currentHeading == null
            ? 0
            : currentHeading;


    sector.style.opacity = '1';

    sector.style.transform =
        `translate(-50%, -100%) rotate(${angle}deg)`;

}


/* ========================================
   ANIMATION LOOP
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
     * ------------------------------------
     * 1) Telegram Mini App API (Bot API 8+)
     * Компас — ОТДЕЛЬНОЕ разрешение,
     * НЕ входит в Location.
     * ------------------------------------
     */

    const tg =
        window.Telegram &&
        window.Telegram.WebApp;


    if(
        tg &&
        tg.DeviceOrientation
    ){

        try{

            const onTgOrientation =
                (data) => {

                    if(!data)
                        return;

                    /*
                     * alpha в радианах.
                     * need_absolute: true →
                     * относительно магнитного севера.
                     */
                    if(
                        data.alpha != null &&
                        !Number.isNaN(
                            Number(data.alpha)
                        )
                    ){

                        const alphaDeg =
                            Number(data.alpha) *
                            (180 / Math.PI);

                        let heading =
                            (
                                360 - alphaDeg + 360
                            ) % 360;

                        handleHeading(
                            heading
                        );

                    }

                };


            /*
             * Событие может называться
             * по-разному в разных версиях клиента.
             */
            if(typeof tg.onEvent === 'function'){

                tg.onEvent(
                    'deviceOrientationChanged',
                    onTgOrientation
                );

                tg.onEvent(
                    'device_orientation_changed',
                    onTgOrientation
                );

            }


            tg.DeviceOrientation.start(
                {
                    need_absolute: true
                },
                (ok) => {

                    console.log(
                        '[compass] TG DeviceOrientation.start →',
                        ok
                    );

                    if(!ok){
                        startWebOrientation();
                    }

                }
            );


            /*
             * На всякий случай параллельно
             * поднимаем и web-fallback.
             * Лишним не будет.
             */
            startWebOrientation();

            return;

        }catch(e){

            console.warn(
                '[compass] TG DeviceOrientation error',
                e
            );

        }

    }


    /*
     * ------------------------------------
     * 2) Обычный Web API
     * ------------------------------------
     */
    startWebOrientation();


    function startWebOrientation(){

        const handleOrientation =
            (event) => {

                let heading = null;


                /* iOS Safari / Telegram iOS */
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

                /* Android / остальные */
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


        /*
         * iOS требует явного permission
         * (это НЕ то же самое, что Location).
         */
        if(
            typeof DeviceOrientationEvent !==
            'undefined' &&

            typeof DeviceOrientationEvent
                .requestPermission ===
            'function'
        ){

            let asked = false;


            const ask = () => {

                if(asked)
                    return;

                asked = true;


                DeviceOrientationEvent
                    .requestPermission()
                    .then(
                        (state) => {

                            console.log(
                                '[compass] iOS permission →',
                                state
                            );

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
                        (err) => {

                            console.warn(
                                '[compass] iOS permission error',
                                err
                            );

                        }
                    );

            };


            window.addEventListener(
                'touchend',
                ask,
                {
                    once: true
                }
            );

            window.addEventListener(
                'click',
                ask,
                {
                    once: true
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

            console.log(
                '[compass] web DeviceOrientation listeners attached'
            );

        }

    }

}


/* ========================================
   ICON — сектор внутри маркера
======================================== */

function createIcon(){

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
