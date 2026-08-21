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
    watchLocation,
    getCurrentPosition
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


/* =========================================================
   INIT MAP
========================================================= */

export function initMap(){

    if(initialized){

        console.log(
            'MAP ALREADY INITIALIZED'
        );

        return;

    }


    const mapElement =
        document.querySelector('#map');


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
       LEAFLET
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
                    [-85.05112878,-180],
                    [85.05112878,180]
                ],

                maxBoundsViscosity:1.0,

                worldCopyJump:false

            }

        );


    /* =====================================================
       START VIEW
    ===================================================== */

    map.setView(

        [
            50.4501,
            30.5234
        ],

        14

    );


    /* =====================================================
       SAVE MAP
    ===================================================== */

    setMap(map);


    /* =====================================================
       TILE
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


    tileLayer.addTo(map);


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
       MY MARKER
    ===================================================== */

    initMyMarker();


    /* =====================================================
       LOCATION EVENTS
    ===================================================== */

    initLocationEvents();


    /* =====================================================
       GEOLOCATION
    ===================================================== */

    startLocationTracking();


    /* =====================================================
       PROFILE
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
                'LIVE START'
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
                'LIVE STOP'
            );


            clearLiveMarkers();


            loadLiveMarkers();

        }

    );


    /* =====================================================
       MAP SIZE
    ===================================================== */

    setTimeout(()=>{

        map.invalidateSize(true);

    },100);


    setTimeout(()=>{

        map.invalidateSize(true);

    },500);


    setTimeout(()=>{

        map.invalidateSize(true);

    },1000);


    console.log(
        'MAP INIT COMPLETE'
    );

}


/* =========================================================
   START LOCATION
========================================================= */

function startLocationTracking(){

    if(locationStarted){

        console.log(
            'LOCATION TRACKING ALREADY STARTED'
        );

        return;

    }


    locationStarted = true;


    console.log(
        'REQUESTING GEOLOCATION...'
    );


    /* =====================================================
       ПРОВЕРКА GEOLOCATION
    ===================================================== */

    if(
        !navigator.geolocation
    ){

        console.error(
            'GEOLOCATION IS NOT SUPPORTED'
        );

        return;

    }


    /* =====================================================
       СРАЗУ ЗАПРАШИВАЕМ ПОЗИЦИЮ
    ===================================================== */

    getCurrentPosition()

        .then(

            position=>{

                console.log(
                    'INITIAL LOCATION:',
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

        )

        .catch(

            error=>{

                console.error(
                    'INITIAL GEOLOCATION ERROR:',
                    error
                );

            }

        );


    /* =====================================================
       СЛЕДИМ ЗА ПОЗИЦИЕЙ
    ===================================================== */

    watchLocation(

        position=>{

            console.log(
                'LOCATION UPDATED:',
                position
            );


            if(!position)
                return;


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

}


/* =========================================================
   WORLD LIMITS
========================================================= */

export function setupWorldLimits(){

    const map =
        document.querySelector('#map')
            ? requireMap()
            : null;


    if(!map)
        return;


    const bounds =
        L.latLngBounds(

            [-85.05112878,-180],

            [85.05112878,180]

        );


    map.setMaxBounds(
        bounds
    );


    map.options.maxBoundsViscosity =
        1.0;


    map.options.worldCopyJump =
        false;


    map.eachLayer(

        layer=>{

            if(
                layer instanceof L.TileLayer
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

                bounds,

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

                bounds,

                {
                    animate:false
                }

            );

        }

    );

}


/* =========================================================
   GET MAP
========================================================= */

function requireMap(){

    const map =
        document.querySelector('#map');


    if(!map)
        return null;


    return import('./mapService')

        ? null
        : null;

}


/* =========================================================
   PROFILE CREATED
========================================================= */

window.addEventListener(

    'profile:created',

    ()=>{

        console.log(
            'PROFILE CREATED → LOCATION'
        );


        setTimeout(()=>{

            startLocationTracking();

        },300);

    }

);