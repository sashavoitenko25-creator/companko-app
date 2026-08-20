import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-rotate';


import {
    setMap
} from './mapService';


import {
    loadLiveMarkers,
    clearLiveMarkers
} from './liveMarkerService';


import {
    initLocationRealtime
} from '../supabase/locationRealtimeService';


import {
    watchLocation
} from '../location/locationService';


import {
    initMyMarker,
    updateMyMarker
} from './myMarkerService';


import {
    initLocationEvents
} from './locationEvents';


import {
    getTileUrl,
    setCurrentTileLayer
} from './mapThemeService';




let initialized = false;

let tileLayer = null;




/* =========================================================
   ГРАНИЦЫ ОДНОГО МИРА
========================================================= */

const WORLD_BOUNDS = L.latLngBounds(

    [
        -85.05112878,
        -180
    ],

    [
        85.05112878,
        180
    ]

);




export function initMap(){


    if(initialized)

        return;


    initialized = true;


    console.log(
        'MAP INIT'
    );




    /* =====================================================
       СОЗДАЁМ КАРТУ
    ===================================================== */

    const map = L.map(

        'map',

        {

            zoomControl:false,

            attributionControl:false,


            /* =============================================
               ВРАЩЕНИЕ КАРТЫ
            ============================================= */

            rotate:true,

            touchRotate:true,

            bearing:0,

            rotateControl:false,


            /* =============================================
               ЗАПРЕЩАЕМ ВЫХОД ЗА ПРЕДЕЛЫ ОДНОГО МИРА
            ============================================= */

            maxBounds:WORLD_BOUNDS,

            maxBoundsViscosity:1.0,


            /* =============================================
               НЕ ПОКАЗЫВАЕМ ПОВТОРЯЮЩИЕСЯ МИРЫ
            ============================================= */

            worldCopyJump:false

        }

    );


    /* =====================================================
       НАЧАЛЬНАЯ ПОЗИЦИЯ
    ===================================================== */

    map.setView(

        [
            50.4501,
            30.5234
        ],

        14

    );


    /* =====================================================
       СОХРАНЯЕМ MAP
    ===================================================== */

    setMap(
        map
    );




    /* =====================================================
       TILE LAYER
    ===================================================== */

    tileLayer = L.tileLayer(

        getTileUrl(),

        {

            maxZoom:19,

            minZoom:2,

            noWrap:true,

            bounds:WORLD_BOUNDS

        }

    );


    tileLayer.addTo(
        map
    );


    setCurrentTileLayer(
        tileLayer
    );




    /* =====================================================
       КЛИК ПО КАРТЕ
    ===================================================== */

    map.on(

        'click',

        event => {

            window.dispatchEvent(

                new Event(
                    'ui:close-all'
                )

            );


            window.dispatchEvent(

                new Event(
                    'route:collapse'
                )

            );

        }

    );




    /* =====================================================
       МОЙ МАРКЕР
    ===================================================== */

    initMyMarker();




    /* =====================================================
       СОБЫТИЯ ЛОКАЦИИ
    ===================================================== */

    initLocationEvents();




    /* =====================================================
       ОТСЛЕЖИВАНИЕ ПОЗИЦИИ
    ===================================================== */

    watchLocation(

        (position)=>{


            console.log(

                'LOCATION UPDATED',

                position

            );


            /* =============================================
               МОЯ ПОЗИЦИЯ
            ============================================= */

            window.myLocation = {

                lat:
                position.latitude,

                lng:
                position.longitude

            };




            /* =============================================
               ОБНОВЛЯЕМ МОЙ МАРКЕР
            ============================================= */

            updateMyMarker(

                position.latitude,

                position.longitude

            );




            /* =============================================
               СОБЫТИЕ ОБНОВЛЕНИЯ ЛОКАЦИИ
            ============================================= */

            window.dispatchEvent(

                new CustomEvent(

                    'location:updated',

                    {

                        detail:{

                            lat:
                            position.latitude,

                            lng:
                            position.longitude

                        }

                    }

                )

            );


        }

    );




    /* =====================================================
       PROFILE OPEN
    ===================================================== */

    window.removeEventListener(

        'profile:open',

        focusRoutePanel

    );


    window.addEventListener(

        'profile:open',

        focusRoutePanel

    );




    function focusRoutePanel(){


        window.dispatchEvent(

            new Event(
                'route:collapse'
            )

        );


    }




    /* =====================================================
       LIVE MARKERS
    ===================================================== */

    loadLiveMarkers();




    /* =====================================================
       LOCATION REALTIME
    ===================================================== */

    initLocationRealtime();




    /* =====================================================
       LIVE STARTED
    ===================================================== */

    window.addEventListener(

        'live:started',

        ()=>{


            console.log(
                'LIVE START EVENT'
            );


            clearLiveMarkers();

            loadLiveMarkers();


        }

    );




    /* =====================================================
       LIVE STOPPED
    ===================================================== */

    window.addEventListener(

        'live:stopped',

        ()=>{


            console.log(
                'LIVE STOP EVENT'
            );


            clearLiveMarkers();

            loadLiveMarkers();


        }

    );


}