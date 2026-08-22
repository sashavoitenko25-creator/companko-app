import L from 'leaflet';
import { getMap } from './mapService';
import { getProfile } from '../../features/profile/profileStore';


let myMarker = null;

let isLive = false;

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

const HEADING_SMOOTH = 0.22;

const HEADING_MIN_DELTA = 0.5;

const HEADING_OFFSET = 0;


/* =========================================================
   INIT
========================================================= */

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

        console.log({

            rawHeading,

            currentHeading,

            source: headingSource,

            mapBearing:
                getMapBearing(
                    getMap()
                )

        });

    };

}


/* =========================================================
   UPDATE MARKER
========================================================= */

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
    )
        return;


    const position = [
        latitude,
        longitude
    ];


    if(myMarker){

        myMarker.setLatLng(
            position
        );


        if(followMe){

            map.panTo(
                position,
                {
                    animate:false
                }
            );

        }


        applyHeadingToSector();

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

                rotateWithView:
                    true
            }
        ).addTo(map);


    bindMapEvents(map);


    followMe = true;


    map.setView(
        position,
        15
    );


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

    const map =
        getMap();

    if(
        !map ||
        !myMarker
    )
        return;


    map.panTo(
        myMarker.getLatLng(),
        {
            animate
        }
    );

}


/* =========================================================
   REFRESH
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
        Number(angle) +
        360
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
   HEADING
========================================================= */

function setHeading(heading){

    if(
        heading == null ||
        Number.isNaN(
            Number(heading)
        )
    )
        return;


    heading =
        normalizeAngle(
            Number(heading) +
            HEADING_OFFSET
        );


    rawHeading =
        heading;


    if(currentHeading == null){

        currentHeading =
            heading;

        applyHeadingToSector();

        return;

    }


    const diff =
        angleDifference(
            heading,
            currentHeading
        );


    if(
        Math.abs(diff) <
        HEADING_MIN_DELTA
    )
        return;


    let smooth =
        HEADING_SMOOTH;


    if(Math.abs(diff) > 60)
        smooth = 0.65;

    else if(Math.abs(diff) > 30)
        smooth = 0.45;

    else if(Math.abs(diff) > 10)
        smooth = 0.32;


    currentHeading =
        normalizeAngle(
            currentHeading +
            diff * smooth
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

        const value =
            Number(
                map.getBearing()
            );


        if(!Number.isNaN(value))
            return normalizeAngle(value);

    }


    if(map._bearing != null){

        const value =
            Number(
                map._bearing
            );


        if(!Number.isNaN(value))
            return normalizeAngle(value);

    }


    return 0;

}


/* =========================================================
   APPLY SECTOR
========================================================= */

function applyHeadingToSector(){

    const el =
        getMarkerElement();


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


    const map =
        getMap();


    const bearing =
        getMapBearing(map);


    const relativeHeading =
        normalizeAngle(
            currentHeading -
            bearing
        );


    sector.style.transform =
        `translate(-50%, -100%) rotate(${relativeHeading}deg)`;

}


/* =========================================================
   LOOP
========================================================= */

function startUpdateLoop(){

    if(loopStarted)
        return;


    loopStarted = true;


    function frame(){

        applyHeadingToSector();

        requestAnimationFrame(
            frame
        );

    }


    requestAnimationFrame(
        frame
    );

}


/* =========================================================
   COMPASS
========================================================= */

function compassHeadingFromOrientation(
    alpha,
    beta,
    gamma
){

    const deg =
        Math.PI / 180;


    const a =
        alpha * deg;

    const b =
        beta * deg;

    const g =
        gamma * deg;


    const cA =
        Math.cos(a);

    const sA =
        Math.sin(a);

    const cB =
        Math.cos(b);

    const sB =
        Math.sin(b);

    const cG =
        Math.cos(g);

    const sG =
        Math.sin(g);


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


    if(heading < 0)
        heading +=
            2 * Math.PI;


    heading =
        heading *
        (180 / Math.PI);


    const screenAngle =
        screen.orientation &&
        typeof screen.orientation.angle === 'number'
            ? screen.orientation.angle
            : (
                typeof window.orientation === 'number'
                    ? window.orientation
                    : 0
            );


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

    function handleBrowserOrientation(event){

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


                setHeading(
                    heading
                );

            }


            return;

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


                setHeading(
                    heading
                );

            }

        }

    }


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

            const readTelegramOrientation = () => {

                const data =
                    tg.DeviceOrientation;


                if(!data)
                    return;


                if(
                    data.alpha == null ||
                    data.beta == null ||
                    data.gamma == null
                )
                    return;


                /*
                 * Telegram → радианы
                 */

                const alpha =
                    Number(data.alpha) *
                    180 /
                    Math.PI;


                const beta =
                    Number(data.beta) *
                    180 /
                    Math.PI;


                const gamma =
                    Number(data.gamma) *
                    180 /
                    Math.PI;


                const heading =
                    compassHeadingFromOrientation(

                        alpha,
                        beta,
                        gamma

                    );


                if(Number.isNaN(heading))
                    return;


                headingSource =
                    'telegram';


                setHeading(
                    heading
                );

            };


            /*
             * Telegram событие
             */

            if(
                typeof tg.onEvent ===
                'function'
            ){

                tg.onEvent(
                    'deviceOrientationChanged',
                    readTelegramOrientation
                );

            }


            /*
             * Запуск
             */

            tg.DeviceOrientation.start(

                {
                    refresh_rate:50,
                    need_absolute:true
                },

                ok => {

                    console.log(
                        '[COMPASS] Telegram:',
                        ok
                    );


                    if(ok){

                        telegramStarted =
                            true;


                        headingSource =
                            'telegram';


                        readTelegramOrientation();

                    }

                }

            );

        }
        catch(error){

            console.error(
                '[COMPASS] Telegram ERROR:',
                error
            );

        }

    }


    /* =====================================================
       IOS PERMISSION
    ===================================================== */

    async function requestCompassPermission(){

        try{

            if(
                typeof DeviceOrientationEvent !==
                'undefined' &&

                typeof DeviceOrientationEvent.requestPermission ===
                'function'
            ){

                const permission =
                    await DeviceOrientationEvent
                        .requestPermission();


                console.log(
                    '[COMPASS] iOS permission:',
                    permission
                );

            }

        }
        catch(error){

            console.warn(
                '[COMPASS] permission:',
                error
            );

        }


        try{

            if(
                tg &&
                tg.DeviceOrientation
            ){

                tg.DeviceOrientation.start(

                    {
                        refresh_rate:50,
                        need_absolute:true
                    },

                    ok => {

                        console.log(
                            '[COMPASS] Telegram after tap:',
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
                '[COMPASS] Telegram after tap:',
                error
            );

        }

    }


    document.addEventListener(
        'click',
        requestCompassPermission,
        {
            once:true
        }
    );


    document.addEventListener(
        'touchstart',
        requestCompassPermission,
        {
            once:true,
            passive:true
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


            html:`

                <div class="my-marker-root">

                    <div
                        class="my-heading-sector-inner"
                    >

                        <div
                            class="my-heading-sector__fan"
                        ></div>

                    </div>


                    <div class="my-live-marker">

                        <img
                            src="${photo}"
                        >

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
            'my-marker-wrapper',


        html:`

            <div class="my-marker-root">

                <div
                    class="my-heading-sector-inner"
                >

                    <div
                        class="my-heading-sector__fan"
                    ></div>

                </div>


                <div class="my-location">

                    <div
                        class="my-location__pulse"
                    ></div>

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