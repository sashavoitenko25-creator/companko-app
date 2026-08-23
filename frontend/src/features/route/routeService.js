import L from 'leaflet';

import { getMap } from '../../services/map/mapService';

import { supabase } from '../../services/supabase/supabaseClient';

import {
    getCurrentPosition,
    watchLocation
} from '../../services/location/locationService';


let routeLine = null;
let activeUser = null;
let activeMode = 'car';

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

let mapRedrawBound = false;
let redrawRaf = null;


const ROUTE_UPDATE_INTERVAL = 4000;
const TARGET_REFRESH_INTERVAL = 3000;
const MIN_ROUTE_REBUILD_INTERVAL = 4000;
const MIN_MOVEMENT_METERS = 8;


/* =========================================================
   FORCE LOCK TO STREETS
   (перепроецируем линию на каждом кадре взаимодействия)
========================================================= */

function forceRouteLock() {

    if (!routeLine)
        return;

    /*
     * Берём те же координаты и заново
     * проецируем в текущий transform карты.
     * Это единственный способ, который
     * стабильно держит линию на улицах
     * при leaflet-rotate.
     */
    const latlngs = routeLine.getLatLngs();

    if (!latlngs || !latlngs.length)
        return;

    routeLine.setLatLngs(latlngs);

}


function scheduleRouteLock() {

    if (redrawRaf)
        return;

    redrawRaf = requestAnimationFrame(() => {
        redrawRaf = null;
        forceRouteLock();
    });

}


function bindMapRedraw(map) {

    if (!map || mapRedrawBound)
        return;

    mapRedrawBound = true;

    map.on('move', scheduleRouteLock);
    map.on('rotate', scheduleRouteLock);
    map.on('zoom', scheduleRouteLock);
    map.on('viewreset', scheduleRouteLock);
    map.on('zoomanim', scheduleRouteLock);
    map.on('moveend', forceRouteLock);
    map.on('rotateend', forceRouteLock);
    map.on('zoomend', forceRouteLock);

}


function unbindMapRedraw(map) {

    if (!map || !mapRedrawBound)
        return;

    map.off('move', scheduleRouteLock);
    map.off('rotate', scheduleRouteLock);
    map.off('zoom', scheduleRouteLock);
    map.off('viewreset', scheduleRouteLock);
    map.off('zoomanim', scheduleRouteLock);
    map.off('moveend', forceRouteLock);
    map.off('rotateend', forceRouteLock);
    map.off('zoomend', forceRouteLock);

    if (redrawRaf) {
        cancelAnimationFrame(redrawRaf);
        redrawRaf = null;
    }

    mapRedrawBound = false;

}


/* =========================================================
   START ROUTE
========================================================= */

export async function startRoute(user, mode = 'car') {

    stopRoute();

    activeUser = { ...user };
    activeMode = mode;

    if (
        activeUser.lat == null ||
        activeUser.lng == null
    ) {
        console.warn('Target has no coordinates');
        return null;
    }

    const position = await getCurrentPosition();

    if (!position)
        return null;

    latestOwnPosition = position;

    const result = await buildRoute(
        position.latitude,
        position.longitude,
        activeUser.lat,
        activeUser.lng
    );

    if (!result)
        return null;

    startDynamicRoute();

    return result;

}


/* =========================================================
   STOP ROUTE
========================================================= */

export function stopRoute() {

    stopDynamicRoute();

    const map = getMap();

    unbindMapRedraw(map);

    if (routeLine && map) {
        map.removeLayer(routeLine);
    }

    routeLine = null;

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
    toLng
) {

    const map = getMap();

    if (!map || routeBuilding)
        return null;

    routeBuilding = true;

    try {

        const { data, error } =
            await supabase.functions.invoke(
                'route',
                {
                    body: {
                        fromLat,
                        fromLng,
                        toLat,
                        toLng,
                        mode: activeMode
                    }
                }
            );

        if (error) {
            console.error(
                'Route function error:',
                error
            );
            return null;
        }

        if (!data?.geometry) {
            console.error(
                'No route geometry:',
                data
            );
            return null;
        }

        const path =
            data.geometry.coordinates.map(
                ([lng, lat]) => [lat, lng]
            );


        /* ==========================================
           СОЗДАЁМ POLYLINE ТОЛЬКО ОДИН РАЗ
        ========================================== */

        if (!routeLine) {

            /*
             * Используем Canvas + жёсткую
             * перепроекцию на каждом кадре.
             */
            const renderer = L.canvas({
                padding: 0.5
            });

            routeLine = L.polyline(
                path,
                {
                    color: '#7c3aed',
                    weight: 6,
                    opacity: 0.95,
                    lineCap: 'round',
                    lineJoin: 'round',
                    renderer,
                    smoothFactor: 1,
                    interactive: false
                }
            ).addTo(map);

            bindMapRedraw(map);

            map.fitBounds(
                routeLine.getBounds(),
                {
                    padding: [80, 80],
                    animate: true,
                    duration: 1
                }
            );

        } else {

            /*
             * Только обновляем точки.
             */
            routeLine.setLatLngs(path);
            forceRouteLock();

        }


        lastFromLat = fromLat;
        lastFromLng = fromLng;

        lastToLat = toLat;
        lastToLng = toLng;

        lastRouteBuildTime = Date.now();


        const distance =
            Number(data.distance) || 0;

        const duration =
            Number(data.duration) || 0;


        const result = {
            distance,
            duration: Math.max(
                1,
                Math.round(duration / 60)
            )
        };


        window.dispatchEvent(
            new CustomEvent(
                'route:updated',
                {
                    detail: result
                }
            )
        );


        return result;

    } catch (error) {

        console.error(
            'Route error:',
            error
        );

        return null;

    } finally {

        routeBuilding = false;

    }

}


/* =========================================================
   DYNAMIC ROUTE
========================================================= */

function startDynamicRoute() {

    stopDynamicRoute();


    locationWatch = watchLocation(
        position => {

            if (!position)
                return;

            latestOwnPosition = {
                latitude: position.latitude,
                longitude: position.longitude,
                accuracy: position.accuracy,
                heading: position.heading
            };

            checkRouteUpdate();

        }
    );


    targetRefreshTimer = setInterval(
        refreshTargetPosition,
        TARGET_REFRESH_INTERVAL
    );


    routeUpdateTimer = setInterval(
        checkRouteUpdate,
        ROUTE_UPDATE_INTERVAL
    );


    refreshTargetPosition();

}


/* =========================================================
   STOP DYNAMIC ROUTE
========================================================= */

function stopDynamicRoute() {

    if (
        locationWatch &&
        typeof locationWatch.stop === 'function'
    ) {
        locationWatch.stop();
    }

    locationWatch = null;


    if (targetRefreshTimer) {
        clearInterval(targetRefreshTimer);
        targetRefreshTimer = null;
    }


    if (routeUpdateTimer) {
        clearInterval(routeUpdateTimer);
        routeUpdateTimer = null;
    }

}


/* =========================================================
   REFRESH TARGET
========================================================= */

async function refreshTargetPosition() {

    if (!activeUser)
        return;

    const targetId =
        getUserId(activeUser);

    if (!targetId)
        return;

    try {

        const { data, error } =
            await supabase
                .from('live_sessions')
                .select('*')
                .eq('user_id', targetId)
                .eq('status', 'active')
                .order(
                    'created_at',
                    {
                        ascending: false
                    }
                )
                .limit(1)
                .maybeSingle();

        if (error) {
            console.warn(
                'Target live position error:',
                error
            );
            return;
        }


        if (!data) {

            window.dispatchEvent(
                new CustomEvent(
                    'live:user-ended',
                    {
                        detail: {
                            userId: targetId
                        }
                    }
                )
            );

            return;

        }


        const lat = Number(
            data.lat ??
            data.latitude ??
            activeUser.lat
        );

        const lng = Number(
            data.lng ??
            data.longitude ??
            activeUser.lng
        );

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {
            return;
        }

        activeUser = {
            ...activeUser,
            lat,
            lng
        };

        checkRouteUpdate();

    } catch (error) {

        console.warn(
            'Target position refresh error:',
            error
        );

    }

}


/* =========================================================
   CHECK ROUTE UPDATE
========================================================= */

async function checkRouteUpdate() {

    if (!activeUser)
        return;

    if (!latestOwnPosition)
        return;

    if (routeBuilding)
        return;


    const fromLat =
        latestOwnPosition.latitude;

    const fromLng =
        latestOwnPosition.longitude;

    const toLat =
        Number(activeUser.lat);

    const toLng =
        Number(activeUser.lng);


    if (
        !Number.isFinite(fromLat) ||
        !Number.isFinite(fromLng) ||
        !Number.isFinite(toLat) ||
        !Number.isFinite(toLng)
    ) {
        return;
    }


    if (
        lastFromLat === null ||
        lastToLat === null
    ) {
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


    if (
        ownMoved < MIN_MOVEMENT_METERS &&
        targetMoved < MIN_MOVEMENT_METERS
    ) {
        return;
    }


    if (
        Date.now() - lastRouteBuildTime <
        MIN_ROUTE_REBUILD_INTERVAL
    ) {
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
   REBUILD ROUTE
========================================================= */

async function rebuildDynamicRoute(
    fromLat,
    fromLng,
    toLat,
    toLng
) {

    if (routeBuilding)
        return;


    const result =
        await buildRoute(
            fromLat,
            fromLng,
            toLat,
            toLng
        );


    if (result) {
        console.log(
            'DYNAMIC ROUTE UPDATED',
            result
        );
    }

}


/* =========================================================
   GET USER ID
========================================================= */

function getUserId(user) {

    if (!user)
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
) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1) *
        Math.PI /
        180;

    const dLng =
        (lng2 - lng1) *
        Math.PI /
        180;

    const a =
        Math.sin(dLat / 2) ** 2 +
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
        Math.sin(dLng / 2) ** 2;

    return (
        R *
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        )
    );

}