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


    /* ГУЛЯТЬ — ЗЕЛЁНЫЙ */

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


    /* КОФЕ — КОРИЧНЕВЫЙ */

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


    /* ВЫПИТЬ — ОРАНЖЕВЫЙ */

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


    /* ОБЩАТЬСЯ — ГОЛУБОЙ */

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


    /* ПО УМОЛЧАНИЮ — ФИОЛЕТОВЫЙ */

    return {

        main: '#9b5cff',
        glow: 'rgba(155,92,255,.75)',
        soft: 'rgba(155,92,255,.28)'

    };

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

        const profile = getProfile();

        /*
        ========================================
        МОЙ USER ID
        ========================================
        */

        const myUserId =
            profile?.user_id ||
            profile?.id ||
            null;


        /*
        ========================================
        МОЙ TELEGRAM ID
        ========================================
        */

        const myTelegramId =
            profile?.telegram_id ||
            null;


        console.log(
            'MY USER ID:',
            myUserId
        );

        console.log(
            'MY TELEGRAM ID:',
            myTelegramId
        );


        /*
        ========================================
        СОЗДАЁМ ТОЛЬКО ЧУЖИЕ LIVE-МАРКЕРЫ
        ========================================
        */

        users.forEach(user => {


            /*
            ====================================
            НЕ ПОКАЗЫВАЕМ СЕБЯ ПО USER ID
            ====================================
            */

            const sameUserId =
                myUserId &&
                user?.user_id &&
                String(user.user_id) ===
                String(myUserId);


            /*
            ====================================
            НЕ ПОКАЗЫВАЕМ СЕБЯ ПО TELEGRAM ID
            ====================================
            */

            const sameTelegramId =
                myTelegramId &&
                user?.telegram_id &&
                String(user.telegram_id) ===
                String(myTelegramId);


            /*
            ====================================
            ЕСЛИ ЭТО Я — ПРОПУСКАЕМ
            ====================================
            */

            if (
                sameUserId ||
                sameTelegramId
            ) {

                console.log(
                    'SKIP MY LIVE MARKER:',
                    user
                );

                return;

            }


            /*
            ====================================
            ПРОВЕРКА КООРДИНАТ
            ====================================
            */

            if (
                user.lat == null ||
                user.lng == null
            ) {

                return;

            }


            /*
            ====================================
            СОЗДАЁМ МАРКЕР ДРУГОГО ПОЛЬЗОВАТЕЛЯ
            ====================================
            */

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


    /* ====================================
       ЦВЕТ
    ==================================== */

    const color =
        getActivityColor(
            user?.activity
        );


    /* ====================================
       АВАТАР
    ==================================== */

    const avatarHTML =
        UserMarker(user);


    /* ====================================
       MARKER HTML
    ==================================== */

    const markerHTML = `

        <div
            class="activity-live-marker"
            style="
                --activity-color: ${color.main};
                --activity-glow: ${color.glow};
                --activity-soft: ${color.soft};
            "
        >

            <div
                class="activity-live-marker__glow">
            </div>


            <div
                class="activity-live-marker__pulse">
            </div>


            <div
                class="activity-live-marker__avatar">

                ${avatarHTML}

            </div>

        </div>

    `;


    /* ====================================
       LEAFLET ICON
    ==================================== */

    const icon =

        L.divIcon({

            className:
                'activity-live-leaflet-icon',

            html:
                markerHTML,

            iconSize: [
                80,
                80
            ],

            iconAnchor: [
                40,
                40
            ]

        });


    /* ====================================
       MARKER
    ==================================== */

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


    /* ====================================
       CLICK
    ==================================== */

    marker.on(

        'click',

        event => {


            if (
                event.originalEvent
            ) {

                event
                    .originalEvent
                    .stopPropagation();

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