import L from 'leaflet';
import { getMap } from './mapService';
import { getProfile } from '../../features/profile/profileStore';


let myMarker = null;

let isLive = false;


/* =========================================================
   HEADING
========================================================= */

let rawHeading = null;
let currentHeading = null;

let orientationStarted = false;
let loopStarted = false;

let followMe = true;
let mapEventsBound = false;

let headingSource = null;


/* =========================================================
   НАСТРОЙКИ
========================================================= */

const HEADING_SMOOTH = 0.18;
const HEADING_MIN_DELTA = 1.0;
const HEADING_HISTORY_SIZE = 5;
const HEADING_OFFSET = 0;

let headingHistory = [];


/* =========================================================
   INIT
========================================================= */

export function initMyMarker(){

    window.addEventListener(
        'location:updated',
        event => {

            const position = event.detail;

            if(!position)
                return;

            updateMyMarker(
                position.lat,
                position.lng
            );

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


    window.addEventListener(
        'map:follow-me',
        () => {

            followMe = true;

            centerOnMe(false);

        }
    );


    startDeviceOrientation();

    startUpdateLoop();


    window.__headingDebug = () => {

        const map = getMap();

        console.log({
            rawHeading,
            currentHeading,
            source: headingSource,
            mapBearing: getMapBearing(map),
            history: headingHistory
        });

    };

}


/* =========================================================
   UPDATE MY MARKER
========================================================= */

export function updateMyMarker(
    latitude,
    longitude
){

    const map = getMap();

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

        myMarker.setLatLng(position);


        if(followMe){

            map.panTo(
                position,
                {
                    animate: false
                }
            );

        }


        applyHeadingToSector();

        return;

    }


    myMarker = L.marker(
        position,
        {
            icon: createIcon(),
            zIndexOffset: 1000,
            rotateWithView: true
        }
    ).addTo(map);


    bindMapEvents(map);


    followMe = true;


    map.setView(
        position,
        15
    );


    window.__myMarkerMapCentered = true;


    applyHeadingToSector();

}


/* =========================================================
   MAP EVENTS
========================================================= */

function bindMapEvents(map){

    if(mapEventsBound)
        return;


    mapEventsBound = true;


    map.on(
        'dragstart',
        () => {

            followMe = false;

        }
    );


    map.on(
        'rotate',
        () => {

            applyHeadingToSector();

        }
    );


    map.on(
        'rotateend',
        () => {

            if(followMe){
                centerOnMe(false);
            }

            applyHeadingToSector();

        }
    );

}


/* =========================================================
   CENTER
========================================================= */

function centerOnMe(
    animate = false
){

    const map = getMap();

    if(
        !map ||
        !myMarker
    ){
        return;
    }


    map.panTo(
        myMarker.getLatLng(),
        {
            animate
        }
    );

}


/* =========================================================
   REFRESH MARKER
========================================================= */

function refreshMarker(){

    if(!myMarker)
        return;


    myMarker.setIcon(
        createIcon()
    );


    applyHeadingToSector();

}


/* =========================================================
   ANGLES
========================================================= */

function normalizeAngle(angle){

    return (
        Number(angle) + 360
    ) % 360;

}


function angleDifference(
    target,
    current
){

    return (
        (
            target -
            current +
            540
        ) % 360
    ) - 180;

}


/* =========================================================
   SET HEADING
========================================================= */

function setHeading(heading){

    if(
        heading == null ||
        Number.isNaN(Number(heading))
    ){
        return;
    }


    heading = normalizeAngle(
        Number(heading) +
        HEADING_OFFSET
    );


    rawHeading = heading;


    headingHistory.push(heading);


    if(
        headingHistory.length >
        HEADING_HISTORY_SIZE
    ){
        headingHistory.shift();
    }


    if(currentHeading == null){

        currentHeading = heading;

        applyHeadingToSector();

        return;

    }


    const normalized =
        headingHistory.map(value => {

            return (
                currentHeading +
                angleDifference(
                    value,
                    currentHeading
                )
            );

        });


    normalized.sort(
        (a, b) => a - b
    );


    const median =
        normalized[
            Math.floor(
                normalized.length / 2
            )
        ];


    const diff =
        angleDifference(
            median,
            currentHeading
        );


    if(
        Math.abs(diff) <
        HEADING_MIN_DELTA
    ){
        return;
    }


    let smooth;


    if(Math.abs(diff) > 60){

        smooth = 0.60;

    }
    else if(Math.abs(diff) > 30){

        smooth = 0.42;

    }
    else if(Math.abs(diff) > 10){

        smooth = 0.30;

    }
    else{

        smooth = HEADING_SMOOTH;

    }


    currentHeading +=
        diff * smooth;


    currentHeading =
        normalizeAngle(
            currentHeading
        );


    applyHeadingToSector();

}


/* =========================================================
   MARKER ELEMENT
========================================================= */

function getMarkerElement(){

    if(!myMarker)
        return null;


    return myMarker.getElement
        ? myMarker.getElement()
        : myMarker._icon;

}


/* =========================================================
   MAP BEARING
========================================================= */

function getMapBearing(map){

    if(!map)
        return 0;


    if(
        typeof map.getBearing ===
        'function'
    ){

        const bearing =
            Number(
                map.getBearing()
            );


        if(!Number.isNaN(bearing)){

            return normalizeAngle(
                bearing
            );

        }

    }


    if(map._bearing != null){

        const bearing =
            Number(
                map._bearing
            );


        if(!Number.isNaN(bearing)){

            return normalizeAngle(
                bearing
            );

        }

    }


    return 0;

}


/* =========================================================
   APPLY HEADING TO SECTOR
========================================================= */

function applyHeadingToSector(){

    const element =
        getMarkerElement();


    if(!element)
        return;


    const sector =
        element.querySelector(
            '.my-heading-sector-inner'
        );


    if(!sector)
        return;


    if(currentHeading == null){

        sector.style.opacity = '0';

        return;

    }


    sector.style.opacity = '1';


    const map = getMap();

    const mapBearing =
        getMapBearing(map);


    const relativeHeading =
        normalizeAngle(
            currentHeading -
            mapBearing
        );


    sector.style.transform =
        `translate(-50%, -100%) rotate(${relativeHeading}deg)`;

}


/* =========================================================
   UPDATE LOOP
========================================================= */

function startUpdateLoop(){

    if(loopStarted)
        return;


    loopStarted = true;


    const frame = () => {

        applyHeadingToSector();

        requestAnimationFrame(frame);

    };


    requestAnimationFrame(frame);

}


/* =========================================================
   COMPASS CALCULATION
========================================================= */

function compassHeadingFromOrientation(
    alpha,
    beta,
    gamma
){

    const deg =
        Math.PI / 180;


    const a = alpha * deg;
    const b = beta * deg;
    const g = gamma * deg;


    const cA = Math.cos(a);
    const sA = Math.sin(a);

    const cB = Math.cos(b);
    const sB = Math.sin(b);

    const cG = Math.cos(g);
    const sG = Math.sin(g);


    const rA =
        -cA * sG -
        sA * sB * cG;


    const rB =
        -sA * sG +
        cA * sB * cG;


    let heading =
        Math.atan2(
            rA,
            rB
        );


    if(heading < 0){

        heading +=
            2 * Math.PI;

    }


    heading =
        heading *
        (180 / Math.PI);


    let screenAngle = 0;


    if(
        screen.orientation &&
        typeof screen.orientation.angle === 'number'
    ){

        screenAngle =
            screen.orientation.angle;

    }
    else if(
        typeof window.orientation === 'number'
    ){

        screenAngle =
            window.orientation;

    }


    return normalizeAngle(
        heading +
        screenAngle
    );

}


/* =========================================================
   DEVICE ORIENTATION
========================================================= */

function startDeviceOrientation(){

    if(orientationStarted)
        return;


    orientationStarted = true;


    let telegramStarted = false;


    /* =====================================================
       BROWSER
    ===================================================== */

    const handleBrowserOrientation = (
        event
    ) => {

        if(telegramStarted)
            return;


        let heading = null;


        /* iPhone */

        if(
            event.webkitCompassHeading != null
        ){

            heading =
                Number(
                    event.webkitCompassHeading
                );


            if(!Number.isNaN(heading)){

                headingSource =
                    'browser-ios';

                setHeading(heading);

                return;

            }

        }


        /* Android */

        if(
            event.alpha != null &&
            event.beta != null &&
            event.gamma != null
        ){

            heading =
                compassHeadingFromOrientation(
                    Number(event.alpha),
                    Number(event.beta),
                    Number(event.gamma)
                );


            if(!Number.isNaN(heading)){

                headingSource =
                    'browser';

                setHeading(heading);

            }

        }

    };


    /*
     * Сразу подключаем orientation.
     */

    window.addEventListener(
        'deviceorientationabsolute',
        handleBrowserOrientation,
        true
    );


    window.addEventListener(
        'deviceorientation',
        handleBrowserOrientation,
        true
    );


    /* =====================================================
       TELEGRAM
    ===================================================== */

    const tg =
        window.Telegram &&
        window.Telegram.WebApp;


    if(
        tg &&
        tg.DeviceOrientation
    ){

        try{

            const onTelegramOrientation =
                data => {

                    if(
                        !data ||
                        data.alpha == null
                    ){
                        return;
                    }


                    const alpha =
                        Number(data.alpha) *
                        (180 / Math.PI);


                    const beta =
                        data.beta != null
                            ? Number(data.beta) *
                              (180 / Math.PI)
                            : 0;


                    const gamma =
                        data.gamma != null
                            ? Number(data.gamma) *
                              (180 / Math.PI)
                            : 0;


                    const heading =
                        compassHeadingFromOrientation(
                            alpha,
                            beta,
                            gamma
                        );


                    headingSource =
                        'telegram';


                    setHeading(heading);

                };


            if(
                typeof tg.onEvent ===
                'function'
            ){

                tg.onEvent(
                    'deviceOrientationChanged',
                    onTelegramOrientation
                );

            }


            /*
             * Запускаем Telegram Compass.
             */

            tg.DeviceOrientation.start(
                {
                    need_absolute: true
                },
                ok => {

                    console.log(
                        '[compass] Telegram DeviceOrientation:',
                        ok
                    );


                    if(ok){

                        telegramStarted =
                            true;


                        headingSource =
                            'telegram';

                    }

                }
            );

        }
        catch(error){

            console.warn(
                '[compass] Telegram error:',
                error
            );

        }

    }


    /* =====================================================
       ПОВТОРНЫЙ ЗАПУСК ПО НАЖАТИЮ
       Нужно для iPhone / разрешений
    ===================================================== */

    const startAfterUserAction = () => {

        try{

            if(
                tg &&
                tg.DeviceOrientation
            ){

                tg.DeviceOrientation.start(
                    {
                        need_absolute: true
                    },
                    ok => {

                        console.log(
                            '[compass] start after tap:',
                            ok
                        );


                        if(ok){

                            telegramStarted =
                                true;

                            headingSource =
                                'telegram';

                        }

                    }
                );

            }

        }
        catch(error){

            console.warn(
                '[compass] permission error:',
                error
            );

        }


        if(
            typeof DeviceOrientationEvent !==
            'undefined' &&
            typeof DeviceOrientationEvent.requestPermission ===
            'function'
        ){

            DeviceOrientationEvent
                .requestPermission()
                .then(permission => {

                    console.log(
                        '[compass] iOS permission:',
                        permission
                    );

                    if(
                        permission === 'granted'
                    ){

                        window.addEventListener(
                            'deviceorientation',
                            handleBrowserOrientation,
                            true
                        );

                    }

                })
                .catch(error => {

                    console.warn(
                        '[compass] iOS permission error:',
                        error
                    );

                });

        }


        document.removeEventListener(
            'touchstart',
            startAfterUserAction
        );

        document.removeEventListener(
            'click',
            startAfterUserAction
        );

    };


    document.addEventListener(
        'touchstart',
        startAfterUserAction,
        {
            once: true,
            passive: true
        }
    );


    document.addEventListener(
        'click',
        startAfterUserAction,
        {
            once: true
        }
    );

}


/* =========================================================
   CREATE ICON
========================================================= */

function createIcon(){

    if(isLive){

        const profile =
            getProfile();


        const photo =
            profile?.photo_url ||
            'https://i.pravatar.cc/150';


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
                            src="${photo}"
                        >

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