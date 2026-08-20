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


    if(!mapElement){

        console.error(
            'MAP ELEMENT NOT FOUND'
        );

        return;

    }


    initialized = true;


    console.log(
        'MAP INIT'
    );


    /* =====================================================
       LEAFLET MAP
    ===================================================== */

    const map =
        L.map(

            'map',

            {

                zoomControl:false,

                attributionControl:false,


                /* -----------------------------------------
                   ROTATE
                ----------------------------------------- */

                rotate:true,

                touchRotate:true,

                bearing:0,

                rotateControl:false,


                /* -----------------------------------------
                   ZOOM
                ----------------------------------------- */

                minZoom:2,

                maxZoom:19,

                zoomSnap:1,

                zoomDelta:1,


                /* -----------------------------------------
                   ГРАНИЦЫ ЗЕМЛИ
                ----------------------------------------- */

                maxBounds:[
                    [-85.05112878, -180],
                    [ 85.05112878,  180]
                ],

                maxBoundsViscosity:1.0

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

    console.log(
        'MAP TILE URL:',
        getTileUrl()
    );


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

                keepBuffer:3,

                detectRetina:false,

                attribution:
                    '&copy; OpenStreetMap contributors'

            }

        );


    /* =====================================================
       TILE LOAD
    ===================================================== */

    tileLayer.on(

        'tileload',

        ()=>{

            console.log(
                'MAP TILE LOADED'
            );

        }

    );


    /* =====================================================
       TILE ERROR
    ===================================================== */

    tileLayer.on(

        'tileerror',

        event=>{

            console.error(
                'MAP TILE ERROR:',
                event.tile?.src
            );

        }

    );


    /* =====================================================
       ДОБАВЛЯЕМ TILE LAYER
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

        ()=>{

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
       LOCATION EVENTS
    ===================================================== */

    initLocationEvents();


    /* =====================================================
       LOCATION WATCH
    ===================================================== */

    watchLocation(

        position=>{

            console.log(
                'LOCATION UPDATED',
                position
            );


            window.myLocation = {

                lat:
                    position.latitude,

                lng:
                    position.longitude

            };


            updateMyMarker(

                position.latitude,

                position.longitude

            );


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
       REALTIME
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
       INVALIDATE SIZE
    ===================================================== */

    setTimeout(()=>{

        map.invalidateSize(
            true
        );

    },100);


    setTimeout(()=>{

        map.invalidateSize(
            true
        );

    },500);


    setTimeout(()=>{

        map.invalidateSize(
            true
        );

    },1000);

}