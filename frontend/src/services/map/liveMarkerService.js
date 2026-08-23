import L from 'leaflet';

import {
    UserMarker
} from '../../components/UserMarker';

import {
    getMap
} from './mapService';

import {
    getLiveUsers
} from '../supabase/liveService';

import {
    getProfile
} from '../../features/profile/profileStore';

import {
    getFilters
} from '../../store/filterStore';

import {
    getCachedLocation
} from '../location/locationService';


let liveMarkers = [];
let liveMarkerMap = {};
let refreshTimer = null;


/* ========================================
   ЦВЕТ АКТИВНОСТИ
======================================== */

function getActivityColor(activity) {

    const value =
        String(activity || '')
            .toLowerCase()
            .trim();


    if (
        value === 'walk' ||
        value === 'walking' ||
        value.includes('гуля')
    ) {
        return {
            main: '#45e879',
            glow: 'rgba(69,232,121,.75)',
            soft: 'rgba(69,232,121,.28)'
        };
    }


    if (
        value === 'coffee' ||
        value.includes('кофе')
    ) {
        return {
            main: '#c58a5a',
            glow: 'rgba(197,138,90,.75)',
            soft: 'rgba(197,138,90,.28)'
        };
    }


    if (
        value === 'beer' ||
        value === 'alcohol' ||
        value.includes('алког') ||
        value.includes('выпит')
    ) {
        return {
            main: '#ffad32',
            glow: 'rgba(255,173,50,.8)',
            soft: 'rgba(255,173,50,.3)'
        };
    }


    if (
        value === 'chat' ||
        value === 'talking' ||
        value.includes('общ')
    ) {
        return {
            main: '#4dbfff',
            glow: 'rgba(77,191,255,.75)',
            soft: 'rgba(77,191,255,.28)'
        };
    }


    return {
        main: '#9b5cff',
        glow: 'rgba(155,92,255,.75)',
        soft: 'rgba(155,92,255,.28)'
    };

}


/* ========================================
   DISTANCE
======================================== */

function distanceMeters(
    lat1,
    lng1,
    lat2,
    lng2
) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLng =
        (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
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


function normalizeActivity(activity) {

    const value =
        String(activity || '')
            .toLowerCase()
            .trim();


    if (
        value === 'beer' ||
        value === 'alcohol' ||
        value.includes('алког') ||
        value.includes('выпит')
    ) {
        return 'beer';
    }


    if (
        value === 'coffee' ||
        value.includes('кофе')
    ) {
        return 'coffee';
    }


    if (
        value === 'walk' ||
        value === 'walking' ||
        value.includes('гуля')
    ) {
        return 'walk';
    }


    if (
        value === 'chat' ||
        value === 'talking' ||
        value === 'talk' ||
        value.includes('общ')
    ) {
        return 'chat';
    }


    return value;

}


/* ========================================
   APPLY FILTERS
======================================== */

function applyFilters(users) {

    const filters =
        getFilters();


    const myLocation =
        getCachedLocation() ||
        (
            window.myLocation
                ? {
                    latitude: window.myLocation.lat,
                    longitude: window.myLocation.lng
                }
                : null
        );


    return users.filter(user => {

        /*
         * Активность
         */
        if (
            filters.activities &&
            filters.activities.length > 0
        ) {

            const activity =
                normalizeActivity(
                    user.activity
                );


            if (
                !filters.activities.includes(
                    activity
                )
            ) {
                return false;
            }

        }


        /*
         * Возраст
         */
        const age =
            Number(user.age);


        if (
            filters.ageFrom != null &&
            Number.isFinite(age) &&
            age < Number(filters.ageFrom)
        ) {
            return false;
        }


        if (
            filters.ageTo != null &&
            Number.isFinite(age) &&
            age > Number(filters.ageTo)
        ) {
            return false;
        }


        /*
         * Если возраст обязателен фильтром,
         * а у пользователя его нет — скрываем.
         */
        if (
            (
                filters.ageFrom != null ||
                filters.ageTo != null
            ) &&
            !Number.isFinite(age)
        ) {
            return false;
        }


        /*
         * Статус отношений
         */
        if (
            filters.relationshipStatuses &&
            filters.relationshipStatuses.length > 0
        ) {

            const status =
                user.relationship_status ||
                'not_specified';


            if (
                !filters.relationshipStatuses.includes(
                    status
                )
            ) {
                return false;
            }

        }


        /*
         * Радиус
         */
        if (
            filters.radiusMeters != null &&
            myLocation &&
            user.lat != null &&
            user.lng != null
        ) {

            const dist =
                distanceMeters(
                    myLocation.latitude,
                    myLocation.longitude,
                    Number(user.lat),
                    Number(user.lng)
                );


            if (
                dist > Number(filters.radiusMeters)
            ) {
                return false;
            }

        }


        return true;

    });

}


/* ========================================
   LOAD LIVE MARKERS
======================================== */

export async function loadLiveMarkers() {

    const map = getMap();

    if (!map) {
        return;
    }

    try {

        clearLiveMarkers();

        const users = await getLiveUsers();

        const filteredUsers =
            applyFilters(
                users
            );

        const profile = getProfile();


        const myUserId =
            profile?.user_id ||
            profile?.id ||
            null;


        const myTelegramId =
            profile?.telegram_id ||
            null;


        filteredUsers.forEach(user => {

            const sameUserId =
                myUserId &&
                user?.user_id &&
                String(user.user_id) ===
                String(myUserId);


            const sameTelegramId =
                myTelegramId &&
                user?.telegram_id &&
                String(user.telegram_id) ===
                String(myTelegramId);


            if (
                sameUserId ||
                sameTelegramId
            ) {
                return;
            }


            if (
                user.lat == null ||
                user.lng == null
            ) {
                return;
            }


            const marker =
                createMarker(
                    map,
                    user
                );


            liveMarkers.push(
                marker
            );


            liveMarkerMap[
                user.user_id
            ] = marker;

        });

    }

    catch (error) {

        console.error(
            'LIVE MARKERS LOAD ERROR',
            error
        );

    }

}


/* ========================================
   CREATE MARKER
======================================== */

function createMarker(
    map,
    user
) {

    const color =
        getActivityColor(
            user?.activity
        );


    const avatarHTML =
        UserMarker(user);


    const markerHTML = `
        <div
            class="activity-live-marker"
            style="
                --activity-color: ${color.main};
                --activity-glow: ${color.glow};
                --activity-soft: ${color.soft};
            "
        >
            <div class="activity-live-marker__glow"></div>
            <div class="activity-live-marker__pulse"></div>
            <div class="activity-live-marker__avatar">
                ${avatarHTML}
            </div>
        </div>
    `;


    const icon =
        L.divIcon({
            className:
                'activity-live-leaflet-icon',
            html:
                markerHTML,
            iconSize: [80, 80],
            iconAnchor: [40, 40]
        });


    const marker =
        L.marker(
            [
                user.lat,
                user.lng
            ],
            {
                icon,
                zIndexOffset: 500
            }
        )
        .addTo(map);


    marker.on(
        'click',
        event => {

            if (event.originalEvent) {
                event.originalEvent.stopPropagation();
            }


            window.dispatchEvent(
                new CustomEvent(
                    'user:selected',
                    {
                        detail: user
                    }
                )
            );

        }
    );


    return marker;

}


/* ========================================
   UPDATE POSITION
======================================== */

export function updateLiveMarkerPosition(
    userId,
    position
) {

    const marker =
        liveMarkerMap[userId];


    if (marker) {
        marker.setLatLng(
            position
        );
    }

}


/* ========================================
   CLEAR MARKERS
======================================== */

export function clearLiveMarkers() {

    const map =
        getMap();


    if (!map) {
        return;
    }


    liveMarkers.forEach(
        marker => {
            map.removeLayer(
                marker
            );
        }
    );


    liveMarkers = [];
    liveMarkerMap = {};

}


/* ========================================
   LIVE REFRESH
======================================== */

window.addEventListener(
    'live:refresh',
    () => {

        clearTimeout(
            refreshTimer
        );


        refreshTimer =
            setTimeout(
                () => {
                    loadLiveMarkers();
                },
                500
            );

    }
);