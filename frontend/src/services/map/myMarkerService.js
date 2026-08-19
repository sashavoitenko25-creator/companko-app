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


            /*
             * Если locationService уже
             * передал heading —
             * используем его.
             */

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
     * Маркер уже существует —
     * просто двигаем его.
     *
     * НИКАКОГО вращения здесь нет.
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

                zIndexOffset: 1000,

                /*
                 * Leaflet-маркер
                 * не должен вращаться
                 * вместе с картой.
                 */

                rotationAngle: 0,

                rotationOrigin:
                    'center center'
            }
        )
        .addTo(map);


    /*
     * Создаём независимый
     * DOM-элемент сектора.
     */

    ensureSector();


    /*
     * Только первый раз
     * центрируем карту.
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
   SECTOR
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
     * Очень важно:
     *
     * Сектор добавляется
     * прямо в body.
     *
     * Поэтому он НЕ находится
     * внутри Leaflet-карты.
     */

    document.body.appendChild(
        sectorEl
    );


    return sectorEl;

}


/* ========================================
   MARKER ELEMENT
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
     * МАРКЕР
     * =====================================
     *
     * Здесь НЕТ:
     *
     * getMapBearing()
     *
     * rotate(-bearing)
     *
     *
     * Leaflet сам отвечает
     * за положение маркера.
     *
     * Поэтому вращение карты
     * не должно менять rotation
     * нашего маркера.
     */


    /*
     * =====================================
     * СЕКТОР
     * =====================================
     *
     * Сектор полностью независим
     * от карты.
     */

    const sector =
        ensureSector();


    if(
        !sector
    ){

        return;

    }


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

        return;

    }


    /*
     * Получаем экранные координаты
     * маркера.
     *
     * Это важно:
     *
     * карта может вращаться,
     * двигаться и масштабироваться,
     * а сектор просто следует
     * за текущим положением
     * маркера на экране.
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
     * Сектор ставим ровно
     * в центр маркера.
     */

    sector.style.left =
        `${centerX}px`;


    sector.style.top =
        `${centerY}px`;


    /*
     * ВАЖНО:
     *
     * Здесь используется
     * ТОЛЬКО heading телефона.
     *
     * Bearing карты сюда
     * НЕ добавляется.
     *
     * Поэтому:
     *
     * карта вращается
     * ↓
     * сектор остаётся
     * направленным туда же
     *
     * телефон поворачивается
     * ↓
     * heading меняется
     * ↓
     * сектор поворачивается.
     */

    sector.style.transform =
        `
        translate(-50%, -100%)
        rotate(${currentHeading}deg)
        `;


    sector.classList.add(
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
             * iPhone / iOS
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
             * Android / другие браузеры
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
     * iPhone требует
     * отдельное разрешение
     * на использование компаса.
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


        /*
         * Нужно действие пользователя,
         * чтобы iOS разрешил компас.
         */

        window.addEventListener(
            'touchend',
            requestPermission,
            {
                once: true
            }
        );


        window.addEventListener(
            'click',
            requestPermission,
            {
                once: true
            }
        );

    }

    else{

        /*
         * Android / Desktop
         */

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