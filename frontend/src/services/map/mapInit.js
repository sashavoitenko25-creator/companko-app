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


    /* =====================================================
       MAP
    ===================================================== */

    const map =
        L.map(

            'map',

            {

                zoomControl:false,

                attributionControl:false,


                /*
                 * ROTATION
                 */

                rotate:true,

                touchRotate:true,

                bearing:0,

                rotateControl:false,


                /*
                 * ВАЖНО:
                 * отключаем лишнее вмешательство
                 * в границы карты.
                 */

                worldCopyJump:false,

                inertia:false,


                /*
                 * ZOOM
                 */

                minZoom:2,

                maxZoom:19,

                zoomSnap:1,

                zoomDelta:1,


                /*
                 * Не ставим maxBounds здесь.
                 *
                 * При rotate это может вызывать
                 * скачки карты.
                 */

                maxBoundsViscosity:0


            }

        );


    /*
     * Начальная позиция
     */

    map.setView(

        [
            50.4501,
            30.5234
        ],

        14,

        {
            animate:false
        }

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


                /*
                 * Более стабильная загрузка
                 * при zoom / rotate.
                 */

                updateWhenIdle:true,

                updateWhenZooming:false,

                keepBuffer:5,

                detectRetina:false,


                /*
                 * Оставляем noWrap,
                 * но больше НЕ ограничиваем
                 * карту через maxBounds.
                 */

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
       MY MARKER + COMPASS
    ===================================================== */

    initMyMarker();


    /* =====================================================
       LOCATION EVENTS
    ===================================================== */

    initLocationEvents();


    /* =====================================================
       GEOLOCATION
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

        ()=>{

            if(!map)
                return;

            map.invalidateSize({
                pan:false
            });

        },

        100

    );


    setTimeout(

        ()=>{

            if(!map)
                return;

            map.invalidateSize({
                pan:false
            });

        },

        500

    );


    setTimeout(

        ()=>{

            if(!map)
                return;

            map.invalidateSize({
                pan:false
            });

        },

        1000

    );


    /* =====================================================
       ROTATION SAFETY
    ===================================================== */

    setupRotationSafety(
        map
    );

}


/* =========================================================
   GEOLOCATION
========================================================= */

function startLocation(){

    if(locationStarted)
        return;


    locationStarted = true;


    console.log(
        'STARTING GEOLOCATION'
    );


    if(!navigator.geolocation){

        console.error(
            'GEOLOCATION NOT SUPPORTED'
        );

        return;

    }


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
   ROTATION SAFETY
========================================================= */

function setupRotationSafety(map){

    if(!map)
        return;


    /*
     * После вращения Leaflet иногда
     * может оставить неправильный
     * viewport / tile transform.
     *
     * invalidateSize заставляет Leaflet
     * пересчитать карту без перемещения
     * центра.
     */

    let resizeTimer = null;


    const refreshMap = ()=>{

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(

                ()=>{

                    if(!map)
                        return;


                    const center =
                        map.getCenter();


                    const zoom =
                        map.getZoom();


                    map.invalidateSize({
                        pan:false
                    });


                    /*
                     * Если центр внезапно стал
                     * невалидным — возвращаем
                     * последнюю нормальную позицию.
                     */

                    const lat =
                        Number(
                            center?.lat
                        );


                    const lng =
                        Number(
                            center?.lng
                        );


                    if(

                        !Number.isFinite(lat) ||

                        !Number.isFinite(lng) ||

                        Math.abs(lat) > 90 ||

                        Math.abs(lng) > 180

                    ){

                        console.warn(
                            'INVALID MAP CENTER - RECOVERING'
                        );


                        map.setView(

                            [
                                50.4501,
                                30.5234
                            ],

                            zoom || 14,

                            {
                                animate:false
                            }

                        );

                    }

                },

                80

            );

    };


    /*
     * После zoom
     */

    map.on(
        'zoomend',
        refreshMap
    );


    /*
     * После rotation
     */

    map.on(
        'rotateend',
        refreshMap
    );


    /*
     * После движения
     */

    map.on(
        'moveend',
        refreshMap
    );


    /*
     * При изменении размеров окна
     */

    window.addEventListener(
        'resize',
        refreshMap
    );


    /*
     * При смене ориентации телефона
     */

    window.addEventListener(

        'orientationchange',

        ()=>{

            setTimeout(
                refreshMap,
                300
            );

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


    /*
     * ВАЖНО:
     *
     * Раньше здесь был panInsideBounds()
     * на каждом drag / resize.
     *
     * При rotate это могло насильно
     * перемещать карту в другую точку.
     *
     * Поэтому больше ничего не двигаем.
     */

    map.options.worldCopyJump =
        false;


    /*
     * Только запрещаем повторение
     * мировых тайлов.
     */

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


    /*
     * Просто обновляем размер.
     *
     * Никакого panInsideBounds().
     */

    setTimeout(

        ()=>{

            map.invalidateSize({
                pan:false
            });

        },

        100

    );

}


/* =========================================================
   SAFE MAP
========================================================= */

function getMapSafe(){

    return getMap();

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
                 * Не уничтожаем карту.
                 *
                 * Просто проверяем её состояние.
                 */

                const map =
                    getMap();


                if(map){

                    map.invalidateSize({
                        pan:false
                    });

                }

            },

            100

        );

    }

);