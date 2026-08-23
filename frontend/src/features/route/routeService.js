import L from 'leaflet';


import {
    getMap
} from '../../services/map/mapService';


import {
    supabase
} from '../../services/supabase/supabaseClient';


import {
    getCurrentPosition,
    watchLocation
} from '../../services/location/locationService';


/* =========================================================
   STATE
========================================================= */

let routeLine = null;

let activeUser = null;

let activeMode = 'car';

let animationFrame = null;

let mapListenersAttached = false;

let locationWatch = null;

let targetRefreshTimer = null;

let routeUpdateTimer = null;

let routeBuilding = false;

let lastRouteBuildTime = 0;

let lastFromLat = null;
let lastFromLng = null;

let lastToLat = null;
let lastToLng = null;

let latestOwnPosition = null;


/*
 * =========================================================
 * ROUTE SESSION
 * =========================================================
 *
 * Каждый новый маршрут получает новый ID.
 *
 * Если старый async-запрос закончится после stopRoute(),
 * он больше не имеет права создавать линию.
 */

let routeSessionId = 0;


/*
 * Текущий async-build.
 *
 * Нужен для дополнительной защиты от старых запросов.
 */

let activeBuildSessionId = 0;


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

    /*
     * Полностью завершаем предыдущий маршрут.
     */

    stopRoute();


    /*
     * Создаём новую сессию маршрута.
     */

    const sessionId =
        routeSessionId;


    activeUser = {
        ...user
    };


    activeMode =
        mode;


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


    /*
     * За время получения GPS маршрут
     * мог быть уже закрыт.
     */

    if(
        sessionId !== routeSessionId ||
        !activeUser
    ){

        return null;

    }


    if(!position){

        return null;

    }


    latestOwnPosition =
        position;


    const result =
        await buildRoute(

            position.latitude,
            position.longitude,

            activeUser.lat,
            activeUser.lng,

            sessionId

        );


    /*
     * buildRoute мог закончиться после stopRoute().
     */

    if(
        sessionId !== routeSessionId ||
        !activeUser
    ){

        return null;

    }


    if(!result){

        return null;

    }


    startDynamicRoute(
        sessionId
    );


    return result;

}


/* =========================================================
   STOP ROUTE
========================================================= */

export function stopRoute(){

    /*
     * Самое важное:
     *
     * инвалидируем все старые async-запросы.
     */

    routeSessionId++;

    activeBuildSessionId =
        routeSessionId;


    /*
     * Останавливаем динамическое обновление.
     */

    stopDynamicRoute();


    /*
     * Останавливаем animation frame.
     */

    if(animationFrame){

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;

    }


    /*
     * Получаем карту.
     */

    const map =
        getMap();


    /*
     * Удаляем маршрут с карты.
     */

    if(routeLine){

        try{

            /*
             * Если линия всё ещё принадлежит карте,
             * удаляем её через removeLayer.
             */

            if(
                map &&
                map.hasLayer &&
                map.hasLayer(routeLine)
            ){

                map.removeLayer(
                    routeLine
                );

            }

        }
        catch(error){

            console.warn(
                'Route layer remove error:',
                error
            );

        }

    }


    /*
     * В любом случае полностью забываем линию.
     */

    routeLine = null;


    /*
     * Удаляем слушатели карты.
     */

    if(map){

        removeMapListeners(
            map
        );

    }


    /*
     * Полностью очищаем состояние.
     */

    activeUser = null;

    latestOwnPosition = null;


    lastFromLat = null;
    lastFromLng = null;

    lastToLat = null;
    lastToLng = null;

    lastRouteBuildTime = 0;

    routeBuilding = false;

}


/* =========================================================
   BUILD ROUTE
========================================================= */

async function buildRoute(

    fromLat,
    fromLng,

    toLat,
    toLng,

    sessionId = routeSessionId

){

    const map =
        getMap();


    if(!map){

        return null;

    }


    /*
     * Если маршрут уже был закрыт —
     * старый build запрещён.
     */

    if(
        sessionId !== routeSessionId ||
        !activeUser
    ){

        return null;

    }


    if(routeBuilding){

        return null;

    }


    routeBuilding = true;

    activeBuildSessionId =
        sessionId;


    try{

        console.log(
            'Building route:',
            {

                fromLat,
                fromLng,

                toLat,
                toLng,

                mode:
                    activeMode,

                sessionId

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


        /*
         * ==========================================
         * ПРОВЕРКА ПОСЛЕ ASYNC ЗАПРОСА
         * ==========================================
         *
         * Это ключевой момент.
         */

        if(
            sessionId !== routeSessionId ||
            activeBuildSessionId !== sessionId ||
            !activeUser
        ){

            console.log(
                'Ignoring outdated route build'
            );

            return null;

        }


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


        if(
            !fullPath.length
        ){

            return null;

        }


        /*
         * ==========================================
         * ЕЩЁ ОДНА ПРОВЕРКА
         * ==========================================
         */

        if(
            sessionId !== routeSessionId ||
            !activeUser
        ){

            return null;

        }


        /*
         * ==========================================
         * СОЗДАНИЕ ЛИНИИ
         * ==========================================
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
         * ==========================================
         * ПРОВЕРКА ПЕРЕД РИСОВАНИЕМ
         * ==========================================
         */

        if(
            sessionId !== routeSessionId ||
            !activeUser
        ){

            if(routeLine){

                try{

                    if(
                        map.hasLayer &&
                        map.hasLayer(routeLine)
                    ){

                        map.removeLayer(
                            routeLine
                        );

                    }

                }
                catch(error){

                    console.warn(
                        'Old route cleanup error:',
                        error
                    );

                }

                routeLine = null;

            }

            return null;

        }


        /*
         * ==========================================
         * ОСТАНАВЛИВАЕМ СТАРУЮ АНИМАЦИЮ
         * ==========================================
         */

        if(animationFrame){

            cancelAnimationFrame(
                animationFrame
            );

            animationFrame = null;

        }


        /*
         * ==========================================
         * ОБНОВЛЯЕМ ЛИНИЮ
         * ==========================================
         */

        routeLine.setLatLngs(
            fullPath
        );


        refreshRouteRenderer();


        /*
         * ==========================================
         * FIT BOUNDS ТОЛЬКО ПРИ ПЕРВОМ ПОСТРОЕНИИ
         * ==========================================
         */

        if(
            lastFromLat === null &&
            sessionId === routeSessionId
        ){

            /*
             * Проверяем ещё раз перед изменением карты.
             */

            if(
                activeUser &&
                sessionId === routeSessionId
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

        }


        /*
         * ==========================================
         * LISTENERS
         * ==========================================
         */

        attachMapListeners(
            map
        );


        /*
         * ==========================================
         * СОХРАНЯЕМ КООРДИНАТЫ
         * ==========================================
         */

        lastFromLat =
            fromLat;


        lastFromLng =
            fromLng;


        lastToLat =
            toLat;


        lastToLng =
            toLng;


        /*
         * ==========================================
         * РЕЗУЛЬТАТ
         * ==========================================
         */

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
         * Отправляем событие только если
         * маршрут всё ещё активен.
         */

        if(
            sessionId === routeSessionId &&
            activeUser
        ){

            window.dispatchEvent(

                new CustomEvent(

                    'route:updated',

                    {

                        detail:
                            result

                    }

                )

            );

        }


        return result;

    }

    catch(error){

        /*
         * Если маршрут уже закрыт,
         * не показываем ошибку как активную.

         */

        if(
            sessionId !== routeSessionId
        ){

            return null;

        }


        console.error(
            'Route error:',
            error
        );

        return null;

    }

    finally{

        /*
         * Важно:
         * только текущий build может менять routeBuilding.
         */

        if(
            activeBuildSessionId === sessionId
        ){

            routeBuilding =
                false;

        }

    }

}


/* =========================================================
   DYNAMIC ROUTE
========================================================= */

function startDynamicRoute(
    sessionId
){

    /*
     * Если маршрут уже закрыт —
     * ничего не запускаем.
     */

    if(
        sessionId !== routeSessionId ||
        !activeUser
    ){

        return;

    }


    stopDynamicRoute();


    /*
     * ==========================================
     * ОБЩАЯ ГЕОЛОКАЦИЯ
     * ==========================================
     */

    locationWatch =
        watchLocation(

            position => {

                /*
                 * Старый watcher больше не должен
                 * менять закрытый маршрут.
                 */

                if(
                    sessionId !== routeSessionId ||
                    !activeUser
                ){

                    return;

                }


                if(!position)
                    return;


                latestOwnPosition = {

                    latitude:
                        position.latitude,

                    longitude:
                        position.longitude,

                    accuracy:
                        position.accuracy,

                    heading:
                        position.heading

                };


                checkRouteUpdate(
                    sessionId
                );

            }

        );


    /*
     * ==========================================
     * ОБНОВЛЕНИЕ ПОЗИЦИИ ЦЕЛИ
     * ==========================================
     */

    targetRefreshTimer =
        setInterval(

            () => {

                if(
                    sessionId !== routeSessionId
                ){

                    return;

                }


                refreshTargetPosition(
                    sessionId
                );

            },

            TARGET_REFRESH_INTERVAL

        );


    /*
     * ==========================================
     * ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА
     * ==========================================
     */

    routeUpdateTimer =
        setInterval(

            () => {

                if(
                    sessionId !== routeSessionId
                ){

                    return;

                }


                checkRouteUpdate(
                    sessionId
                );

            },

            ROUTE_UPDATE_INTERVAL

        );


    refreshTargetPosition(
        sessionId
    );

}


/* =========================================================
   STOP DYNAMIC ROUTE
========================================================= */

function stopDynamicRoute(){

    /*
     * Не останавливаем общий watcher.
     *
     * Только отписываемся от него.
     */

    if(
        locationWatch &&
        typeof locationWatch.stop === 'function'
    ){

        try{

            locationWatch.stop();

        }
        catch(error){

            console.warn(
                'Location watcher stop error:',
                error
            );

        }

    }


    locationWatch =
        null;


    if(targetRefreshTimer){

        clearInterval(
            targetRefreshTimer
        );

        targetRefreshTimer =
            null;

    }


    if(routeUpdateTimer){

        clearInterval(
            routeUpdateTimer
        );

        routeUpdateTimer =
            null;

    }

}


/* =========================================================
   REFRESH TARGET POSITION
========================================================= */

async function refreshTargetPosition(
    sessionId = routeSessionId
){

    if(
        sessionId !== routeSessionId ||
        !activeUser
    ){

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


        /*
         * За время запроса маршрут мог быть закрыт.
         */

        if(
            sessionId !== routeSessionId ||
            !activeUser
        ){

            return;

        }


        if(error){

            console.warn(
                'Target live position error:',
                error
            );

            return;

        }


        /*
         * ==========================================
         * LIVE ЗАКОНЧИЛСЯ
         * ==========================================
         */

        if(!data){

            window.dispatchEvent(

                new CustomEvent(

                    'live:user-ended',

                    {

                        detail:{

                            userId:
                                targetId

                        }

                    }

                )

            );

            return;

        }


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


        checkRouteUpdate(
            sessionId
        );

    }

    catch(error){

        if(
            sessionId !== routeSessionId
        ){

            return;

        }


        console.warn(
            'Target position refresh error:',
            error
        );

    }

}


/* =========================================================
   CHECK ROUTE UPDATE
========================================================= */

async function checkRouteUpdate(
    sessionId = routeSessionId
){

    if(
        sessionId !== routeSessionId
    ){

        return;

    }


    if(!activeUser)
        return;


    if(!latestOwnPosition)
        return;


    if(routeBuilding)
        return;


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
     * ==========================================
     * ПЕРВОЕ ОБНОВЛЕНИЕ
     * ==========================================
     */

    if(
        lastFromLat === null ||
        lastToLat === null
    ){

        await rebuildDynamicRoute(

            fromLat,
            fromLng,

            toLat,
            toLng,

            sessionId

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
     * Никто заметно не двигался.
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
        now -
        lastRouteBuildTime <
        MIN_ROUTE_REBUILD_INTERVAL
    ){

        return;

    }


    await rebuildDynamicRoute(

        fromLat,
        fromLng,

        toLat,
        toLng,

        sessionId

    );

}


/* =========================================================
   REBUILD DYNAMIC ROUTE
========================================================= */

async function rebuildDynamicRoute(

    fromLat,
    fromLng,

    toLat,
    toLng,

    sessionId = routeSessionId

){

    if(
        sessionId !== routeSessionId ||
        !activeUser
    ){

        return;

    }


    if(routeBuilding)
        return;


    lastRouteBuildTime =
        Date.now();


    const result =
        await buildRoute(

            fromLat,
            fromLng,

            toLat,
            toLng,

            sessionId

        );


    if(
        sessionId !== routeSessionId
    ){

        return;

    }


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

    if(!user)
        return null;


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
            lat2 -
            lat1
        ) *
        Math.PI /
        180;


    const dLng =
        (
            lng2 -
            lng1
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

    if(mapListenersAttached)
        return;


    mapListenersAttached =
        true;


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

    if(!mapListenersAttached)
        return;


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


    mapListenersAttached =
        false;

}


/* =========================================================
   REFRESH ROUTE RENDERER
========================================================= */

function refreshRouteRenderer(){

    /*
     * Если маршрут уже закрыт,
     * ничего не перерисовываем.
     */

    if(
        !routeLine ||
        !activeUser
    ){

        return;

    }


    const renderer =
        routeLine._renderer;


    if(
        renderer &&
        typeof renderer._update === 'function'
    ){

        try{

            renderer._update();

        }
        catch(error){

            console.warn(
                'Route renderer update error:',
                error
            );

        }

    }


    if(
        typeof routeLine.redraw === 'function'
    ){

        try{

            routeLine.redraw();

        }
        catch(error){

            console.warn(
                'Route redraw error:',
                error
            );

        }

    }

}