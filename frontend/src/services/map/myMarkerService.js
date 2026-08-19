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
     * Если маркер уже существует,
     * только меняем его координаты.
     *
     * НЕ меняем transform.
     * НЕ вращаем Leaflet marker вручную.
     */

    if(myMarker){

        myMarker.setLatLng(
            position
        );

        return;

    }


    /*
     * Создаём маркер.
     */

    myMarker =
        L.marker(
            position,
            {
                icon: createIcon(),

                zIndexOffset: 1000
            }
        )
        .addTo(map);


    /*
     * Создаём независимый
     * экранный сектор.
     */

    ensureSector();


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

}


/* ========================================
   CREATE INDEPENDENT SECTOR
======================================== */

function ensureSector(){

    if(
        sectorEl &&
        document.body.contains(
            sectorEl
        )
    ){

        return sectorEl;

    }


    /*
     * Создаём сектор ВНЕ любого
     * transformed-контейнера.
     *
     * leaflet-rotate вешает transform
     * на pane карты. Если сектор
     * окажется внутри такого родителя,
     * position:fixed ломается и сектор
     * начинает крутиться вместе с картой.
     *
     * Поэтому всегда append в document.body
     * и принудительно сбрасываем transform.
     */

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


    /*
     * Жёстко фиксируем стили,
     * чтобы Telegram WebView / CSS
     * карты не могли их перебить.
     */

    sectorEl.style.cssText = `
        position: fixed !important;
        left: 0;
        top: 0;
        width: 42px;
        height: 52px;
        margin: 0;
        padding: 0;
        pointer-events: none;
        z-index: 99999;
        opacity: 0;
        transform-origin: 50% 100%;
        will-change: transform, left, top;
        transform: none;
    `;


    document.body.appendChild(
        sectorEl
    );


    return sectorEl;

}


/* ========================================
   GET MARKER ELEMENT
======================================== */

function getMarkerElement(){

    if(!myMarker)
        return null;


    return myMarker.getElement
        ? myMarker.getElement()
        : myMarker._icon;

}


/* ========================================
   UPDATE SCREEN
======================================== */

function updateScreen(){

    if(!myMarker)
        return;


    const marker =
        getMarkerElement();


    if(!marker)
        return;


    /*
     * =====================================
     * СЕКТОР — ТОЛЬКО ТЕЛЕФОН
     * =====================================
     *
     * Угол = ТОЛЬКО currentHeading компаса.
     * Bearing карты НЕ учитываем.
     *
     * Крутишь карту → сектор НЕ крутится.
     * Крутишь телефон → сектор крутится.
     *
     * Сектор живёт в body (position:fixed),
     * вне transform leaflet-rotate.
     */


    const sector =
        ensureSector();


    if(!sector)
        return;


    /*
     * Если компас ещё
     * не дал направление —
     * сектор скрываем.
     */

    if(
        currentHeading == null
    ){

        sector.classList.remove(
            'visible'
        );

        sector.style.opacity = '0';

        return;

    }


    /*
     * Получаем реальное
     * экранное положение
     * Leaflet-маркера.
     * getBoundingClientRect работает
     * корректно даже при повороте карты.
     */

    const rect =
        marker.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;


    const centerY =
        rect.top +
        rect.height / 2;


    /*
     * Сектор следует
     * за маркером по экрану.
     */

    sector.style.left =
        `${centerX}px`;


    sector.style.top =
        `${centerY}px`;


    /*
     * ТОЛЬКО heading телефона.
     * Никакого map.getBearing().
     */

    sector.style.transform =
        `translate(-50%, -100%) rotate(${currentHeading}deg)`;


    sector.classList.add(
        'visible'
    );

    sector.style.opacity = '1';

}


/* ========================================
   ANIMATION LOOP
======================================== */

function startUpdateLoop(){

    if(loopStarted)
        return;


    loopStarted = true;


    const frame = () => {

        updateScreen();


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


    const handleOrientation =
        event => {

            let heading = null;


            /*
             * iPhone / iOS / Telegram iOS
             */

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


            /*
             * Android / Telegram Android
             * и другие браузеры
             */

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


            setHeading(
                heading
            );

        };


    /*
     * iPhone / Telegram iOS требует
     * разрешение на компас.
     * В Mini App разрешение часто
     * запрашивается после первого тапа.
     */

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

        /*
         * Android / Telegram Android
         */

        window.addEventListener(
            'deviceorientation',
            handleOrientation,
            true
        );

        /*
         * Дополнительно absolute-версия
         * (на некоторых Android даёт
         * более стабильный компас)
         */

        window.addEventListener(
            'deviceorientationabsolute',
            handleOrientation,
            true
        );

    }

}


/* ========================================
   ICON
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
     * ОБЫЧНЫЙ СИНИЙ МАРКЕР
     * =====================================
     */

    return L.divIcon({

        className:
            'my-marker-wrapper',


        html: `

            <div
                class="my-location">

                <div
                    class="my-location__pulse">
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