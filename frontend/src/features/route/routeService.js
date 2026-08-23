import L from 'leaflet';

import {
    getMap
} from '../../services/map/mapService';

import {
    supabase
} from '../../services/supabase/supabaseClient';


/* =========================================================
   STATE
========================================================= */

let routeLine = null;

let activeUser = null;

let activeMode = 'car';

let animationFrame = null;

let mapListenersAttached = false;

let locationWatchId = null;

let targetRefreshTimer = null;

let routeUpdateTimer = null;

let routeBuilding = false;

let lastRouteBuildTime = 0;

let lastFromLat = null;
let lastFromLng = null;

let lastToLat = null;
let lastToLng = null;

let latestOwnPosition = null;

const ROUTE_UPDATE_INTERVAL = 4000;

const TARGET_REFRESH_INTERVAL = 3000;

const MIN_ROUTE_REBUILD_INTERVAL = 4000;

const MIN_MOVEMENT_METERS = 8;


/* =========================================================
   START ROUTE
========================================================= */

export async function startRoute(
    user,
    mode = 'car'
){

    stopRoute();

    activeUser = {
        ...user
    };

    activeMode = mode;

    if(
        activeUser.lat == null ||
        activeUser.lng == null
    ){

        console.warn(
            'Target has no coordinates'
        );

        return null;

    }


    const position =
        await getCurrentPosition();


    if(!position){

        return null;

    }


    latestOwnPosition = position;


    const result =
        await buildRoute(

            position.latitude,
            position.longitude,

            activeUser.lat,
            activeUser.lng

        );


    if(!result){

        return null;

    }


    startDynamicRoute();


    return result;

}


/* =========================================================
   STOP ROUTE
========================================================= */

export function stopRoute(){

    stopDynamicRoute();


    const map =
        getMap();


    if(animationFrame){

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;

    }


    if(
        routeLine &&
        map
    ){

        map.removeLayer(
            routeLine
        );

    }


    routeLine = null;


    if(map){

        removeMapListeners(
            map
        );

    }


    activeUser = null;

    latestOwnPosition = null;


    lastFromLat = null;
    lastFromLng = null;

    lastToLat = null;
    lastToLng = null;

}


/* =========================================================
   BUILD ROUTE
========================================================= */

async function buildRoute(

    fromLat,
    fromLng,

    toLat,
    toLng

){

    const map =
        getMap();


    if(!map){

        return null;

    }


    if(routeBuilding){

        return null;

    }


    routeBuilding = true;


    try{

        console.log(
            'Building route:',
            {
                fromLat,
                fromLng,
                toLat,
                toLng,
                mode: activeMode
            }
        );


        const {
            data,
            error
        } =
            await supabase.functions.invoke(

                'route',

                {

                    body:{

                        fromLat,

                        fromLng,

                        toLat,

                        toLng,

                        mode:
                            activeMode

                    }

                }

            );


        if(error){

            console.error(
                'Route function error:',
                error
            );

            return null;

        }


        if(!data?.geometry){

            console.error(
                'No route geometry:',
                data
            );

            return null;

        }


        const fullPath =
            data.geometry.coordinates.map(

                ([lng, lat]) => [

                    lat,
                    lng

                ]

            );


        /*
         * Первый запуск создаёт линию.
         *
         * При последующих обновлениях
         * просто меняем координаты линии.
         */

        if(!routeLine){

            routeLine =
                L.polyline(

                    [],

                    {

                        color:
                            '#7c3aed',

                        weight:
                            6,

                        opacity:
                            0.95,

                        lineCap:
                            'round',

                        lineJoin:
                            'round',

                        renderer:
                            L.canvas()

                    }

                ).addTo(map);

        }


        /*
         * Обновляем маршрут.
         */

        if(animationFrame){

            cancelAnimationFrame(
                animationFrame
            );

            animationFrame = null;

        }


        animateRoute(
            fullPath
        );


        /*
         * Только при первом построении
         * двигаем карту.
         */

        if(
            lastFromLat === null
        ){

            map.fitBounds(

                fullPath,

                {

                    padding:[
                        80,
                        80
                    ],

                    animate:true,

                    duration:1

                }

            );

        }


        attachMapListeners(
            map
        );


        lastFromLat = fromLat;
        lastFromLng = fromLng;

        lastToLat = toLat;
        lastToLng = toLng;


        const distance =
            Number(
                data.distance
            ) || 0;


        const duration =
            Number(
                data.duration
            ) || 0;


        const result = {

            distance,

            duration:
                Math.max(

                    1,

                    Math.round(
                        duration / 60
                    )

                )

        };


        /*
         * Сообщаем RoutePanel,
         * что маршрут обновился.
         */

        window.dispatchEvent(

            new CustomEvent(
                'route:updated',

                {
                    detail: result
                }

            )

        );


        return result;

    }

    catch(error){

        console.error(
            'Route error:',
            error
        );

        return null;

    }

    finally{

        routeBuilding = false;

    }

}


/* =========================================================
   DYNAMIC ROUTE
========================================================= */

function startDynamicRoute(){

    stopDynamicRoute();


    /*
     * Следим за своей позицией.
     */

    if(
        navigator.geolocation
    ){

        locationWatchId =
            navigator.geolocation.watchPosition(

                position => {

                    latestOwnPosition = {

                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude

                    };

                    checkRouteUpdate();

                },

                error => {

                    console.warn(
                        'Route location watch error:',
                        error
                    );

                },

                {

                    enableHighAccuracy:true,

                    maximumAge:2000,

                    timeout:10000

                }

            );

    }


    /*
     * Периодически получаем
     * актуальную позицию цели.
     */

    targetRefreshTimer =
        setInterval(

            refreshTargetPosition,

            TARGET_REFRESH_INTERVAL

        );


    /*
     * Дополнительная проверка.
     */

    routeUpdateTimer =
        setInterval(

            checkRouteUpdate,

            ROUTE_UPDATE_INTERVAL

        );


    /*
     * Сразу проверяем цель.
     */

    refreshTargetPosition();

}


/* =========================================================
   STOP DYNAMIC ROUTE
========================================================= */

function stopDynamicRoute(){

    if(locationWatchId !== null){

        navigator.geolocation?.clearWatch(
            locationWatchId
        );

        locationWatchId = null;

    }


    if(targetRefreshTimer){

        clearInterval(
            targetRefreshTimer
        );

        targetRefreshTimer = null;

    }


    if(routeUpdateTimer){

        clearInterval(
            routeUpdateTimer
        );

        routeUpdateTimer = null;

    }

}


/* =========================================================
   REFRESH TARGET POSITION
========================================================= */

async function refreshTargetPosition(){

    if(!activeUser){

        return;

    }


    const targetId =
        getUserId(
            activeUser
        );


    if(!targetId){

        return;

    }


    try{

        const {
            data,
            error
        } =
            await supabase

                .from('live_sessions')

                .select('*')

                .eq(
                    'user_id',
                    targetId
                )

                .eq(
                    'status',
                    'active'
                )

                .order(
                    'created_at',
                    {
                        ascending:false
                    }
                )

                .limit(1)
                .maybeSingle();


        if(error){

            console.warn(
                'Target live position error:',
                error
            );

            return;

        }


        /*
         * Live больше нет.
         */

        if(!data){

            return;

        }


        /*
         * Поддерживаем разные названия
         * координат в таблице.
         */

        const lat =
            Number(
                data.lat ??
                data.latitude ??
                activeUser.lat
            );


        const lng =
            Number(
                data.lng ??
                data.longitude ??
                activeUser.lng
            );


        if(
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ){

            return;

        }


        activeUser = {

            ...activeUser,

            lat,

            lng

        };


        checkRouteUpdate();

    }

    catch(error){

        console.warn(
            'Target position refresh error:',
            error
        );

    }

}


/* =========================================================
   CHECK ROUTE UPDATE
========================================================= */

async function checkRouteUpdate(){

    if(!activeUser){

        return;

    }


    if(!latestOwnPosition){

        return;

    }


    if(routeBuilding){

        return;

    }


    const fromLat =
        latestOwnPosition.latitude;


    const fromLng =
        latestOwnPosition.longitude;


    const toLat =
        Number(
            activeUser.lat
        );


    const toLng =
        Number(
            activeUser.lng
        );


    if(
        !Number.isFinite(fromLat) ||
        !Number.isFinite(fromLng) ||
        !Number.isFinite(toLat) ||
        !Number.isFinite(toLng)
    ){

        return;

    }


    /*
     * Первый запуск.
     */

    if(
        lastFromLat === null ||
        lastToLat === null
    ){

        await rebuildDynamicRoute(

            fromLat,
            fromLng,

            toLat,
            toLng

        );

        return;

    }


    const ownMoved =
        distanceMeters(

            fromLat,
            fromLng,

            lastFromLat,
            lastFromLng

        );


    const targetMoved =
        distanceMeters(

            toLat,
            toLng,

            lastToLat,
            lastToLng

        );


    /*
     * Если никто заметно не сдвинулся,
     * маршрут не трогаем.
     */

    if(
        ownMoved < MIN_MOVEMENT_METERS &&
        targetMoved < MIN_MOVEMENT_METERS
    ){

        return;

    }


    const now =
        Date.now();


    if(
        now - lastRouteBuildTime <
        MIN_ROUTE_REBUILD_INTERVAL
    ){

        return;

    }


    await rebuildDynamicRoute(

        fromLat,
        fromLng,

        toLat,
        toLng

    );

}


/* =========================================================
   REBUILD DYNAMIC ROUTE
========================================================= */

async function rebuildDynamicRoute(

    fromLat,
    fromLng,

    toLat,
    toLng

){

    if(routeBuilding){

        return;

    }


    lastRouteBuildTime =
        Date.now();


    const result =
        await buildRoute(

            fromLat,
            fromLng,

            toLat,
            toLng

        );


    if(result){

        console.log(
            'DYNAMIC ROUTE UPDATED',
            result
        );

    }

}


/* =========================================================
   GET USER ID
========================================================= */

function getUserId(user){

    if(!user){

        return null;

    }


    return (

        user.user_id ||

        user.id ||

        user.profile_id ||

        null

    );

}


/* =========================================================
   DISTANCE
========================================================= */

function distanceMeters(

    lat1,
    lng1,

    lat2,
    lng2

){

    const R =
        6371000;


    const dLat =
        (
            lat2 - lat1
        ) *
        Math.PI /
        180;


    const dLng =
        (
            lng2 - lng1
        ) *
        Math.PI /
        180;


    const a =

        Math.sin(
            dLat / 2
        ) ** 2 +

        Math.cos(
            lat1 *
            Math.PI /
            180
        ) *

        Math.cos(
            lat2 *
            Math.PI /
            180
        ) *

        Math.sin(
            dLng / 2
        ) ** 2;


    return (

        R *

        2 *

        Math.atan2(

            Math.sqrt(a),

            Math.sqrt(
                1 - a
            )

        )

    );

}


/* =========================================================
   MAP LISTENERS
========================================================= */

function attachMapListeners(map){

    if(mapListenersAttached){

        return;

    }


    mapListenersAttached = true;


    map.on(
        'move',
        refreshRouteRenderer
    );


    map.on(
        'zoom',
        refreshRouteRenderer
    );


    map.on(
        'rotate',
        refreshRouteRenderer
    );


    map.on(
        'moveend',
        refreshRouteRenderer
    );


    map.on(
        'zoomend',
        refreshRouteRenderer
    );

}


/* =========================================================
   REMOVE MAP LISTENERS
========================================================= */

function removeMapListeners(map){

    if(!mapListenersAttached){

        return;

    }


    map.off(
        'move',
        refreshRouteRenderer
    );


    map.off(
        'zoom',
        refreshRouteRenderer
    );


    map.off(
        'rotate',
        refreshRouteRenderer
    );


    map.off(
        'moveend',
        refreshRouteRenderer
    );


    map.off(
        'zoomend',
        refreshRouteRenderer
    );


    mapListenersAttached = false;

}


/* =========================================================
   REFRESH RENDERER
========================================================= */

function refreshRouteRenderer(){

    if(!routeLine){

        return;

    }


    const renderer =
        routeLine._renderer;


    if(
        renderer &&
        typeof renderer._update === 'function'
    ){

        renderer._update();

    }


    if(
        typeof routeLine.redraw === 'function'
    ){

        routeLine.redraw();

    }

}


/* =========================================================
   ANIMATE ROUTE
========================================================= */

function animateRoute(points){

    if(!routeLine){

        return;

    }


    let i = 0;


    function draw(){

        if(!routeLine){

            return;

        }


        i += 8;


        routeLine.setLatLngs(

            points.slice(
                0,
                i
            )

        );


        refreshRouteRenderer();


        if(
            i < points.length
        ){

            animationFrame =
                requestAnimationFrame(
                    draw
                );

        }

        else{

            animationFrame = null;

        }

    }


    draw();

}


/* =========================================================
   CURRENT POSITION
========================================================= */

function getCurrentPosition(){

    return new Promise(
        resolve => {

            if(
                !navigator.geolocation
            ){

                resolve(null);

                return;

            }


            navigator.geolocation.getCurrentPosition(

                position => {

                    resolve({

                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude

                    });

                },

                error => {

                    console.error(
                        'Geolocation error:',
                        error
                    );

                    resolve(null);

                },

                {

                    enableHighAccuracy:true,

                    maximumAge:2000,

                    timeout:10000

                }

            );

        }

    );

}