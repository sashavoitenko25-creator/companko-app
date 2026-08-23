import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import 'leaflet-rotate';


import {
    setMap,
    getMap
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

let locationStarted = false;

let locationSubscription = null;


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


    initialized =
        true;


    console.log(
        'MAP INIT'
    );


    /* =====================================================
       MAP
    ===================================================== */

    const map =
        L.map(

            'map',

            {

                zoomControl:false,

                attributionControl:false,

                rotate:true,

                touchRotate:true,

                bearing:0,

                rotateControl:false,

                minZoom:2,

                maxZoom:19,

                zoomSnap:1,

                zoomDelta:1,

                maxBounds:[

                    [
                        -85.05112878,
                        -180
                    ],

                    [
                        85.05112878,
                        180
                    ]

                ],

                maxBoundsViscosity:1.0

            }

        );


    map.setView(

        [
            50.4501,
            30.5234
        ],

        14

    );


    setMap(
        map
    );


    /* =====================================================
       TILES
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

                keepBuffer:3,

                detectRetina:false,

                noWrap:true,

                attribution:
                    '&copy; OpenStreetMap contributors'

            }

        );


    tileLayer.addTo(
        map
    );


    setCurrentTileLayer(
        tileLayer
    );


    /* =====================================================
       MAP CLICK
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
       MY MARKER + COMPASS
    ===================================================== */

    initMyMarker();


    /* =====================================================
       LOCATION EVENTS
    ===================================================== */

    initLocationEvents();


    /* =====================================================
       GEOLOCATION
       ОДИН ОБЩИЙ WATCHER
    ===================================================== */

    startLocation();


    /* =====================================================
       PROFILE OPEN
    ===================================================== */

    window.addEventListener(

        'profile:open',

        ()=>{

            window.dispatchEvent(

                new Event(
                    'route:collapse'
                )

            );

        }

    );


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

            clearLiveMarkers();

            loadLiveMarkers();

        }

    );


    /* =====================================================
       MAP SIZE
    ===================================================== */

    setTimeout(

        ()=>map.invalidateSize(true),

        100

    );


    setTimeout(

        ()=>map.invalidateSize(true),

        500

    );


    setTimeout(

        ()=>map.invalidateSize(true),

        1000

    );

}


/* =========================================================
   GEOLOCATION
========================================================= */

function startLocation(){

    if(locationStarted)
        return;


    locationStarted =
        true;


    console.log(
        'STARTING GLOBAL GEOLOCATION'
    );


    /*
     * ВАЖНО:
     *
     * Здесь запускается единственный watcher
     * всего приложения.
     *
     * Он будет:
     *
     * - один раз запросить разрешение;
     * - получать новые координаты;
     * - обновлять marker;
     * - отправлять location:updated.
     */

    locationSubscription =
        watchLocation(

            position=>{

                if(!position)
                    return;


                console.log(
                    'LOCATION UPDATED:',
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


                /*
                 * locationService уже отправляет
                 * location:updated.
                 *
                 * Поэтому здесь второй раз
                 * отправлять событие НЕ нужно.
                 */

            }

        );

}


/* =========================================================
   WORLD LIMITS
========================================================= */

export function setupWorldLimits(){

    const map =
        getMap();


    if(!map)
        return;


    const southWest =
        L.latLng(

            -85.05112878,
            -180

        );


    const northEast =
        L.latLng(

            85.05112878,
            180

        );


    const worldBounds =
        L.latLngBounds(

            southWest,
            northEast

        );


    map.setMaxBounds(
        worldBounds
    );


    map.options.maxBoundsViscosity =
        1.0;


    map.options.worldCopyJump =
        false;


    map.eachLayer(

        layer=>{

            if(
                layer instanceof
                L.TileLayer
            ){

                layer.options.noWrap =
                    true;

            }

        }

    );


    map.on(

        'drag',

        ()=>{

            map.panInsideBounds(

                worldBounds,

                {
                    animate:false
                }

            );

        }

    );


    map.on(

        'resize',

        ()=>{

            map.panInsideBounds(

                worldBounds,

                {
                    animate:false
                }

            );

        }

    );


    setTimeout(

        ()=>map.invalidateSize(true),

        100

    );

}


/* =========================================================
   PROFILE CREATED
========================================================= */

window.addEventListener(

    'profile:created',

    ()=>{

        setTimeout(

            ()=>{

                /*
                 * Не сбрасываем геолокацию.
                 *
                 * При пересоздании карты
                 * разрешение повторно не нужно.
                 */

                initialized =
                    false;


                const mapElement =
                    document.querySelector(
                        '#map'
                    );


                if(mapElement){

                    initMap();

                }

            },

            100

        );

    }

);