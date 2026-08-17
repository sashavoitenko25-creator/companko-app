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
   АКТИВНОСТЬ → ЦВЕТ
======================================== */

function getActivityClass(activity) {

    if (!activity) {

        return 'activity-default';

    }


    const value =
        String(activity)
            .toLowerCase()
            .trim();


    /* ====================================
       ГУЛЯТЬ
    ==================================== */

    if (

        value === 'walk' ||

        value === 'walking' ||

        value.includes('гуля')

    ) {

        return 'activity-walk';

    }


    /* ====================================
       КОФЕ
    ==================================== */

    if (

        value === 'coffee' ||

        value.includes('кофе')

    ) {

        return 'activity-coffee';

    }


    /* ====================================
       ВЫПИТЬ
    ==================================== */

    if (

        value === 'beer' ||

        value === 'alcohol' ||

        value.includes('алког') ||

        value.includes('выпит')

    ) {

        return 'activity-beer';

    }


    /* ====================================
       ОБЩАТЬСЯ
    ==================================== */

    if (

        value === 'chat' ||

        value === 'talking' ||

        value.includes('общ')

    ) {

        return 'activity-chat';

    }


    return 'activity-default';

}


/* ========================================
   LOAD LIVE MARKERS
======================================== */

export async function loadLiveMarkers() {


    const map =
        getMap();


    if (!map) {

        return;

    }


    try {


        clearLiveMarkers();


        const users =
            await getLiveUsers();


        const profile =
            getProfile();


        const myId =

            profile?.id ||

            profile?.user_id;


        users.forEach(user => {


            /* ================================
               НЕ ПОКАЗЫВАЕМ СЕБЯ
            ================================= */

            if (

                String(user.user_id)

                ===

                String(myId)

            ) {

                return;

            }


            /* ================================
               ПРОВЕРКА КООРДИНАТ
            ================================= */

            if (

                user.lat == null ||

                user.lng == null

            ) {

                return;

            }


            /* ================================
               СОЗДАЁМ МАРКЕР
            ================================= */

            const marker =

                createMarker(

                    map,

                    user

                );


            liveMarkers.push(marker);


            liveMarkerMap[user.user_id] =
                marker;


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
       ОПРЕДЕЛЯЕМ АКТИВНОСТЬ
    ==================================== */

    const activityClass =
        getActivityClass(
            user?.activity
        );


    /* ====================================
       HTML МАРКЕРА
    ==================================== */

    const markerHTML = `

        <div
            class="live-marker-glow ${activityClass}">

            <div
                class="live-marker-glow__pulse">
            </div>

            <div
                class="live-marker-glow__user">

                ${UserMarker(user)}

            </div>

        </div>

    `;


    /* ====================================
       LEAFLET ICON
    ==================================== */

    const icon =

        L.divIcon({

            className: '',

            html:
                markerHTML,

            iconSize: [
                64,
                64
            ],

            iconAnchor: [
                32,
                32
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


            /* ============================
               НЕ ПЕРЕДАЁМ КЛИК КАРТЕ
            ============================ */

            if (
                event.originalEvent
            ) {

                event
                    .originalEvent
                    .stopPropagation();

            }


            /* ============================
               ОТКРЫВАЕМ КАРТОЧКУ
            ============================ */

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