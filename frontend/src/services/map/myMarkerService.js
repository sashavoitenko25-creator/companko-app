import L from 'leaflet';
import { getMap } from './mapService';
import { getProfile } from '../../features/profile/profileStore';


let myMarker = null;

let isLive = false;


/* =========================================================
   HEADING STATE
========================================================= */

let rawHeading = null;

let currentHeading = null;

let orientationStarted = false;

let loopStarted = false;

let followMe = true;

let mapEventsBound = false;


/*
 * Источник направления.
 *
 * gps       → не используем как основной compass
 * telegram  → приоритетный источник в Telegram
 * browser   → fallback
 */
let headingSource = null;


/*
 * Настройки сглаживания.
 */

const HEADING_SMOOTH = 0.16;

const HEADING_MIN_DELTA = 1.0;

const HEADING_HISTORY_SIZE = 5;


/*
 * ВАЖНО:
 *
 * Никакого искусственного смещения.
 *
 * Если после проверки окажется,
 * что именно конкретное устройство
 * систематически показывает +X градусов,
 * можно будет изменить это число.
 */

const HEADING_OFFSET = 0;


let headingHistory = [];


/* =========================================================
   INIT
========================================================= */

export function initMyMarker(){

    window.addEventListener(

        'location:updated',

        event=>{

            const position =
                event.detail;


            if(!position)
                return;


            updateMyMarker(
                position.lat,
                position.lng
            );


            /*
             * НЕ используем position.heading
             * как compass heading.
             *
             * GPS heading показывает направление
             * движения автомобиля/человека,
             * а не направление телефона.
             */

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


    window.addEventListener(

        'map:follow-me',

        ()=>{

            followMe = true;

            centerOnMe(false);

        }

    );


    startDeviceOrientation();

    startUpdateLoop();


    /*
     * DEBUG
     */

    window.__headingDebug = ()=>{

        const map =
            getMap();


        console.log({

            rawHeading,

            heading:
                currentHeading,

            source:
                headingSource,

            bearing:
                getMapBearing(map),

            followMe,

            rotateWithView:
                myMarker?.options?.rotateWithView,

            history:
                headingHistory.slice()

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


    /*
     * rotateWithView:true
     *
     * Маркер остаётся связанным
     * с вращением карты.
     */

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


    document
        .querySelectorAll(
            '.my-heading-sector, #my-heading-overlay'
        )
        .forEach(
            el=>el.remove()
        );


    bindMapEvents(map);


    followMe = true;


    map.setView(
        position,
        15
    );


    window.__myMarkerMapCentered =
        true;


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

        ()=>{

            followMe = false;

        }

    );


    map.on(

        'rotate',

        ()=>{

            /*
             * При каждом вращении карты
             * немедленно пересчитываем сектор.
             */

            applyHeadingToSector();

        }

    );


    map.on(

        'rotateend',

        ()=>{

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

    const map =
        getMap();


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
   NORMALIZE ANGLE
========================================================= */

function normalizeAngle(
    angle
){

    return (
        Number(angle) +
        360
    ) % 360;

}


/*
 * Разница между двумя углами.
 *
 * Например:
 *
 * 359 → 1 = +2°
 *
 * а не -358°.
 */

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


    heading =
        normalizeAngle(
            Number(heading) +
            HEADING_OFFSET
        );


    rawHeading =
        heading;


    headingHistory.push(
        heading
    );


    if(
        headingHistory.length >
        HEADING_HISTORY_SIZE
    ){

        headingHistory.shift();

    }


    /*
     * Первое значение.
     */

    if(currentHeading == null){

        currentHeading =
            heading;


        applyHeadingToSector();

        return;

    }


    /*
     * Переводим значения относительно
     * текущего направления.
     */

    const normalized =
        headingHistory.map(
            value=>{

                return (

                    currentHeading +

                    angleDifference(
                        value,
                        currentHeading
                    )

                );

            }
        );


    normalized.sort(
        (a,b)=>a-b
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


    /*
     * Убираем очень маленькое
     * дрожание датчика.
     */

    if(
        Math.abs(diff) <
        HEADING_MIN_DELTA
    ){

        return;

    }


    /*
     * Большой поворот →
     * быстрее реагируем.
     */

    let smooth;


    if(
        Math.abs(diff) > 60
    ){

        smooth = 0.55;

    }

    else if(
        Math.abs(diff) > 30
    ){

        smooth = 0.35;

    }

    else if(
        Math.abs(diff) > 10
    ){

        smooth = 0.24;

    }

    else{

        smooth =
            HEADING_SMOOTH;

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

function getMapBearing(
    map
){

    if(!map)
        return 0;


    /*
     * Leaflet plugins для rotation
     * могут предоставлять getBearing().
     */

    if(
        typeof map.getBearing ===
        'function'
    ){

        const bearing =
            Number(
                map.getBearing()
            );


        if(
            !Number.isNaN(bearing)
        ){

            return normalizeAngle(
                bearing
            );

        }

    }


    /*
     * Некоторые реализации
     * используют map._bearing.
     */

    if(
        map._bearing != null
    ){

        const bearing =
            Number(
                map._bearing
            );


        if(
            !Number.isNaN(bearing)
        ){

            return normalizeAngle(
                bearing
            );

        }

    }


    return 0;

}


/* =========================================================
   APPLY HEADING
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

        sector.style.opacity =
            '0';


        return;

    }


    sector.style.opacity =
        '1';


    const map =
        getMap();


    /*
     * currentHeading =
     * абсолютное направление телефона.
     *
     * Если карта повернута, маркер
     * rotateWithView уже повернул
     * его вместе с картой.
     *
     * Поэтому внутреннему сектору
     * нужно компенсировать bearing карты.
     */

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


    const frame = ()=>{

        applyHeadingToSector();

        requestAnimationFrame(
            frame
        );

    };


    requestAnimationFrame(
        frame
    );

}


/* =========================================================
   COMPASS FROM ALPHA/BETA/GAMMA
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

        sA *
        sB *
        cG;


    const rB =

        -sA * sG +

        cA *
        sB *
        cG;


    /*
     * ВАЖНО:
     *
     * atan2 намного надёжнее,
     * чем atan(rA / rB).
     */

    let heading =
        Math.atan2(
            rA,
            rB
        );


    if(
        heading < 0
    ){

        heading +=
            2 * Math.PI;

    }


    heading =
        heading *
        (180 / Math.PI);


    /*
     * Ориентация экрана.
     */

    const screenAngle =

        (
            screen.orientation &&
            typeof screen.orientation.angle ===
                'number'
        )

            ?

            screen.orientation.angle

            :

            (
                typeof window.orientation ===
                    'number'

                    ?

                    window.orientation

                    :

                    0
            );


    heading =
        normalizeAngle(

            heading +
            screenAngle

        );


    return heading;

}


/* =========================================================
   DEVICE ORIENTATION
========================================================= */

function startDeviceOrientation(){

    if(orientationStarted)
        return;


    orientationStarted = true;


    let browserOrientationReceived =
        false;


    let telegramStarted =
        false;


    /*
     * ================================================
     * BROWSER ORIENTATION
     * ================================================
     */

    const handleBrowserOrientation = (
        event,
        isAbsolute = false
    )=>{

        /*
         * Если Telegram уже успешно
         * предоставляет compass,
         * browser-данные не смешиваем.
         */

        if(telegramStarted)
            return;


        let heading =
            null;


        /*
         * iOS.
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


            const screenAngle =

                (
                    screen.orientation &&
                    typeof screen.orientation.angle ===
                        'number'
                )

                    ?

                    screen.orientation.angle

                    :

                    (
                        typeof window.orientation ===
                            'number'

                            ?

                            window.orientation

                            :

                            0
                    );


            heading =
                normalizeAngle(

                    heading +
                    screenAngle

                );

        }


        /*
         * Android absolute.
         */

        else if(

            event.alpha != null &&

            event.beta != null &&

            event.gamma != null &&

            !Number.isNaN(
                Number(event.alpha)
            )

        ){

            heading =

                compassHeadingFromOrientation(

                    Number(event.alpha),

                    Number(event.beta),

                    Number(event.gamma)

                );

        }


        /*
         * Простой fallback.
         */

        else if(

            event.alpha != null &&

            !Number.isNaN(
                Number(event.alpha)
            )

        ){

            heading =

                normalizeAngle(

                    360 -
                    Number(event.alpha)

                );

        }


        if(

            heading == null ||

            Number.isNaN(
                Number(heading)
            )

        ){

            return;

        }


        browserOrientationReceived =
            true;


        headingSource =
            isAbsolute
                ? 'browser-absolute'
                : 'browser';


        setHeading(
            heading
        );

    };


    /*
     * Absolute orientation.
     */

    window.addEventListener(

        'deviceorientationabsolute',

        event=>{

            handleBrowserOrientation(
                event,
                true
            );

        },

        true

    );


    /*
     * Обычный orientation —
     * fallback.
     */

    setTimeout(

        ()=>{

            if(

                !browserOrientationReceived &&

                !telegramStarted

            ){

                console.log(
                    '[compass] using browser deviceorientation fallback'
                );


                window.addEventListener(

                    'deviceorientation',

                    event=>{

                        handleBrowserOrientation(
                            event,
                            false
                        );

                    },

                    true

                );

            }

        },

        1500

    );


    /*
     * ================================================
     * TELEGRAM DEVICE ORIENTATION
     * ================================================
     */

    const tg =
        window.Telegram &&
        window.Telegram.WebApp;


    if(
        tg &&
        tg.DeviceOrientation
    ){

        try{

            const onTg =
                data=>{

                    if(
                        !data ||
                        data.alpha == null
                    ){

                        return;

                    }


                    /*
                     * Telegram отдаёт alpha/beta/gamma
                     * в радианах.
                     */

                    const alphaDeg =

                        Number(data.alpha) *
                        (180 / Math.PI);


                    const betaDeg =

                        data.beta != null

                            ?

                            Number(data.beta) *
                            (180 / Math.PI)

                            :

                            0;


                    const gammaDeg =

                        data.gamma != null

                            ?

                            Number(data.gamma) *
                            (180 / Math.PI)

                            :

                            0;


                    const heading =

                        compassHeadingFromOrientation(

                            alphaDeg,

                            betaDeg,

                            gammaDeg

                        );


                    headingSource =
                        'telegram';


                    setHeading(
                        heading
                    );

                };


            tg.onEvent?.(

                'deviceOrientationChanged',

                onTg

            );


            tg.onEvent?.(

                'device_orientation_changed',

                onTg

            );


            tg.DeviceOrientation.start(

                {
                    need_absolute:true
                },

                ok=>{

                    console.log(
                        '[compass] Telegram DeviceOrientation →',
                        ok
                    );


                    /*
                     * Только успешный запуск
                     * делает Telegram источником.
                     */

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
                '[compass] Telegram DeviceOrientation error',
                error
            );

        }

    }

}


/* =========================================================
   CREATE ICON
========================================================= */

function createIcon(){

    if(isLive){

        const profile =
            getProfile();


        return L.divIcon({

            className:
                'my-marker-wrapper',


            html:`

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

                <div class="my-heading-sector-inner">

                    <div class="my-heading-sector__fan"></div>

                </div>


                <div class="my-location">

                    <div class="my-location__pulse"></div>

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