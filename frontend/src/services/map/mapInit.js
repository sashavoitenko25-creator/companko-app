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
    requestLocation,
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


/* =========================================================
   INIT MAP
========================================================= */

export function initMap(){

    if(initialized)
        return;


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

                maxBoundsViscosity:1,

                worldCopyJump:false

            }

        );


    map.setView(

        [
            50.4501,
            30.5234
        ],

        14

    );


    setMap(map);


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
                new Event('ui:close-all')
            );


            window.dispatchEvent(
                new Event('route:collapse')
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
       LOCATION
    ===================================================== */

    startLocation();


    /* =====================================================
       PROFILE
    ===================================================== */

    window.addEventListener(

        'profile:open',

        ()=>{

            window.dispatchEvent(
                new Event('route:collapse')
            );

        }

    );


    /* =====================================================
       LIVE
    ===================================================== */

    loadLiveMarkers();


    initLocationRealtime();


    window.addEventListener(

        'live:started',

        ()=>{

            clearLiveMarkers();

            loadLiveMarkers();

        }

    );


    window.addEventListener(

        'live:stopped',

        ()=>{

            clearLiveMarkers();

            loadLiveMarkers();

        }

    );


    /* =====================================================
       SIZE
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
   LOCATION
========================================================= */

function startLocation(){

    if(locationStarted)
        return;


    locationStarted = true;


    console.log(
        'REQUEST TELEGRAM LOCATION'
    );


    /*
     * СНАЧАЛА ОДИН РАЗ
     * ПОЛУЧАЕМ КООРДИНАТЫ.
     */

    requestLocation()

        .then(

            position=>{

                if(!position)
                    return;


                console.log(
                    'MY INITIAL LOCATION:',
                    position
                );


                updateMyMarker(

                    position.latitude,

                    position.longitude

                );

            }

        )

        .catch(

            error=>{

                console.error(
                    'LOCATION REQUEST FAILED:',
                    error
                );

            }

        );


    /*
     * ПОТОМ СЛЕДИМ
     * ЗА ИЗМЕНЕНИЕМ.
     */

    watchLocation(

        position=>{

            if(!position)
                return;


            updateMyMarker(

                position.latitude,

                position.longitude

            );

        }

    );

}


/* =========================================================
   WORLD LIMITS
========================================================= */

export function setupWorldLimits(){

    const map =
        document.querySelector('#map');


    if(!map)
        return;

}