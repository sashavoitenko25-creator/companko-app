import L from 'leaflet';

import './Map.css';

import {
    initMap
} from '../../services/map/mapInit';

import {
    getMap
} from '../../services/map/mapService';


let initialized = false;


/* =========================================================
   MAP COMPONENT
========================================================= */

export function Map(){

    setTimeout(()=>{

        initMapSafe();

    },0);


    return `

<div
    id="map"
    class="map">
</div>


<div
    id="selected-user-container">
</div>

`;

}


/* =========================================================
   INIT MAP
========================================================= */

function initMapSafe(){

    const mapElement =
        document.querySelector(
            '#map'
        );


    if(!mapElement)
        return;


    if(!initialized){

        try{

            initMap();

            initialized = true;

        }

        catch(error){

            console.error(
                'MAP INIT ERROR',
                error
            );

            initialized = false;

            return;

        }

    }


    setTimeout(()=>{

        const map =
            getMap();

        if(!map)
            return;


        setupWorldLimits();


        map.invalidateSize(
            true
        );


    },100);


    /* =====================================================
       LIVE REFRESH
    ===================================================== */

    window.removeEventListener(
        'live:refresh',
        handleLiveRefresh
    );

    window.addEventListener(
        'live:refresh',
        handleLiveRefresh
    );


    /* =====================================================
       LIVE STARTED
    ===================================================== */

    window.removeEventListener(
        'live:started',
        handleLiveStarted
    );

    window.addEventListener(
        'live:started',
        handleLiveStarted
    );


    /* =====================================================
       LIVE STOPPED
    ===================================================== */

    window.removeEventListener(
        'live:stopped',
        handleLiveStopped
    );

    window.addEventListener(
        'live:stopped',
        handleLiveStopped
    );

}


/* =========================================================
   LIVE REFRESH
========================================================= */

function handleLiveRefresh(){

    const map =
        getMap();

    if(!map)
        return;


    setTimeout(()=>{

        map.invalidateSize(
            true
        );

    },100);

}


/* =========================================================
   LIVE STARTED
========================================================= */

function handleLiveStarted(){

    setTimeout(()=>{

        window.dispatchEvent(

            new Event(
                'live:refresh'
            )

        );

    },300);

}


/* =========================================================
   LIVE STOPPED
========================================================= */

function handleLiveStopped(){

    setTimeout(()=>{

        window.dispatchEvent(

            new Event(
                'live:refresh'
            )

        );

    },300);

}


/* =========================================================
   WORLD LIMITS
========================================================= */

function setupWorldLimits(){

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
                layer instanceof L.TileLayer
            ){

                layer.options.noWrap =
                    true;

            }

        }

    );


    if(!map.__worldLimitsBound){

        map.__worldLimitsBound =
            true;


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

    }


    setTimeout(()=>{

        map.invalidateSize(
            true
        );

    },100);

}


/* =========================================================
   PROFILE CREATED
========================================================= */

window.addEventListener(

    'profile:created',

    ()=>{

        setTimeout(()=>{

            initialized = false;

            initMapSafe();

        },300);

    }

);