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
let latestOwnPosition = null;
let lastFromLat = null;
let lastFromLng = null;
let lastToLat = null;
let lastToLng = null;
let lastRouteBuildTime = 0;
let routeSession = 0;

const TARGET_REFRESH_INTERVAL = 3000;
const ROUTE_UPDATE_INTERVAL = 4000;
const MIN_ROUTE_REBUILD_INTERVAL = 4000;
const MIN_MOVEMENT_METERS = 8;

/* =========================================================
   START ROUTE
========================================================= */

export async function startRoute(user, mode = 'car') {
    const map = getMap();

    if (!map || !user)
        return null;

    const userId = getUserId(user);

    if (!userId)
        return null;

    const isNewRoute =
        !activeUser ||
        String(getUserId(activeUser)) !== String(userId) ||
        activeMode !== mode;

    if (isNewRoute) {
        stopRoute();

        activeUser = { ...user };
        activeMode = mode;
        routeSession++;

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

        const session = routeSession;

        const result = await buildRoute(
            position.latitude,
            position.longitude,
            activeUser.lat,
            activeUser.lng,
            true,
            session
        );

        if (!result)
            return null;

        startDynamicRoute();

        return result;
    }

    return getCurrentRouteInfo();
}

/* =========================================================
   STOP ROUTE
========================================================= */

export function stopRoute() {
    routeSession++;

    stopDynamicRoute();

    routeBuilding = false;

    const map = getMap();

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
}

/* =========================================================
   BUILD ROUTE
========================================================= */

async function buildRoute(
    fromLat,
    fromLng,
    toLat,
    toLng,
    fitMap = false,
    session = routeSession
) {
    const map = getMap();

    if (!map)
        return null;

    if (!Number.isFinite(fromLat) ||
        !Number.isFinite(fromLng) ||
        !Number.isFinite(toLat) ||
        !Number.isFinite(toLng)
    ) {
        return null;
    }

    if (routeBuilding)
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

        if (session !== routeSession || !activeUser)
            return null;

        if (error) {
            console.error(
                'Route function error:',
                error
            );
            return null;
        }

        if (!data?.geometry?.coordinates) {
            console.error(
                'No route geometry:',
                data
            );
            return null;
        }

        const fullPath =
            data.geometry.coordinates.map(
                ([lng, lat]) => [lat, lng]
            );

        if (!routeLine) {
            routeLine = L.polyline(
                fullPath,
                {
                    color: '#7c3aed',
                    weight: 6,
                    opacity: 0.95,
                    lineCap: 'round',
                    lineJoin: 'round'
                }
            ).addTo(map);
        } else {
            routeLine.setLatLngs(fullPath);
        }

        /*
         * Масштабируем карту ТОЛЬКО
         * при первом построении.
         */
        if (fitMap) {
            map.fitBounds(
                routeLine.getBounds(),
                {
                    padding: [80, 80],
                    animate: true,
                    duration: 0.8
                }
            );
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

    locationWatch =
        watchLocation(position => {
            if (!position || !activeUser)
                return;

            latestOwnPosition = {
                latitude: position.latitude,
                longitude: position.longitude,
                accuracy: position.accuracy,
                heading: position.heading
            };

            checkRouteUpdate();
        });

    targetRefreshTimer =
        setInterval(
            refreshTargetPosition,
            TARGET_REFRESH_INTERVAL
        );

    routeUpdateTimer =
        setInterval(
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
   REFRESH TARGET POSITION
========================================================= */

async function refreshTargetPosition() {
    if (!activeUser)
        return;

    const targetId =
        getUserId(activeUser);

    if (!targetId)
        return;

    try {
        const {
            data,
            error
        } = await supabase
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

        /*
         * Live цели завершился.
         */
        if (!data) {
            const endedUserId =
                targetId;

            stopRoute();

            window.dispatchEvent(
                new CustomEvent(
                    'live:user-ended',
                    {
                        detail: {
                            userId: endedUserId
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

    /*
     * Если маршрут ещё не построен.
     */
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

    const now = Date.now();

    if (
        now - lastRouteBuildTime <
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
   REBUILD DYNAMIC ROUTE
========================================================= */

async function rebuildDynamicRoute(
    fromLat,
    fromLng,
    toLat,
    toLng
) {
    if (routeBuilding)
        return;

    const session =
        routeSession;

    const result =
        await buildRoute(
            fromLat,
            fromLng,
            toLat,
            toLng,
            false,
            session
        );

    if (result) {
        console.log(
            'DYNAMIC ROUTE UPDATED',
            result
        );
    }
}

/* =========================================================
   CURRENT ROUTE INFO
========================================================= */

function getCurrentRouteInfo() {
    if (!routeLine)
        return null;

    return null;
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
            lat1 * Math.PI / 180
        ) *
        Math.cos(
            lat2 * Math.PI / 180
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