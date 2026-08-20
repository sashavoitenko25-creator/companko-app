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
   INIT MAP
========================================================= */

export function initMap(){

    if(initialized)
        return;


    const mapElement =
        document.querySelector(
            '#map'
        );


    if(!mapElement)
        return;


    initialized = true;


    console.log(
        'MAP INIT'
    );


    /* =====================================================
       MAP
    ===================================================== */

    const map = L.map(

        'map',

        {

            zoomControl:false,

            attributionControl:false,


            /* ---------------------------------------------
               ВРАЩЕНИЕ
            --------------------------------------------- */

            rotate:true,

            touchRotate:true,

            bearing:0,

            rotateControl:false,


            /* ---------------------------------------------
               МИНИМАЛЬНЫЙ / МАКСИМАЛЬНЫЙ ZOOM
            --------------------------------------------- */

            minZoom:2,

            maxZoom:19,


            /* ---------------------------------------------
               НЕ ДАЁМ УЙТИ ЗА ПРЕДЕЛЫ МИРА
            --------------------------------------------- */

            maxBounds:[
                [-85.05112878, -180],
                [ 85.05112878,  180]
            ],

            maxBoundsViscosity:1.0,


            /* ---------------------------------------------
               ПОВЕДЕНИЕ ПРИ ZOOM
            --------------------------------------------- */

            zoomSnap:1,

            zoomDelta:1

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
       Сохраняем карту
    ===================================================== */

    setMap(
        map
    );


    /* =====================================================
       TILE LAYER
    ===================================================== */

    tileLayer =
        L.tileLayer(

            getTileUrl(),

            {

                minZoom:2,

                maxZoom:19,

                maxNativeZoom:19,

                tileSize:256,

                updateWhenIdle:false,

                updateWhenZooming:true,

                keepBuffer:2,

                crossOrigin:true

            }

        );


    /* =====================================================
       ОШИБКА ЗАГРУЗКИ TILE
    ===================================================== */

    tileLayer.on(

        'tileerror',

        event=>{

            console.warn(
                'MAP TILE ERROR:',
                event.coords,
                event.tile?.src
            );

        }

    );


    /* =====================================================
       ДОБАВЛЯЕМ КАРТУ
    ===================================================== */

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

        event=>{

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

        position=>{

            console.log(
                'LOCATION UPDATED',
                position
            );


            /* ---------------------------------------------
               МОЯ ПОЗИЦИЯ
            --------------------------------------------- */

            window.myLocation = {

                lat:
                    position.latitude,

                lng:
                    position.longitude

            };


            /* ---------------------------------------------
               МОЙ МАРКЕР
            --------------------------------------------- */

            updateMyMarker(

                position.latitude,

                position.longitude

            );


            /* ---------------------------------------------
               СОБЫТИЕ
            --------------------------------------------- */

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


    /* =====================================================
       RESIZE
    ===================================================== */

    setTimeout(()=>{

        map.invalidateSize();

    },100);


    setTimeout(()=>{

        map.invalidateSize();

    },500);


    setTimeout(()=>{

        map.invalidateSize();

    },1000);

}