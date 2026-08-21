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

        initialized = true;


        try{

            initMap();

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


    /*
     * Даём Leaflet закончить создание карты.
     */

    setTimeout(()=>{

        setupWorldLimits();

    },100);


    /* =====================================================
       LIVE REFRESH
    ===================================================== */

    window.addEventListener(

        'live:refresh',

        ()=>{

            const map =
                getMap();

            if(!map)
                return;


            setTimeout(()=>{

                map.invalidateSize();

            },100);

        }

    );


    /* =====================================================
       LIVE STARTED
    ===================================================== */

    window.addEventListener(

        'live:started',

        ()=>{

            setTimeout(()=>{

                window.dispatchEvent(

                    new Event(
                        'live:refresh'
                    )

                );

            },300);

        }

    );


    /* =====================================================
       LIVE STOPPED
    ===================================================== */

    window.addEventListener(

        'live:stopped',

        ()=>{

            setTimeout(()=>{

                window.dispatchEvent(

                    new Event(
                        'live:refresh'
                    )

                );

            },300);

        }

    );

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


    map.options.maxBoundsViscosity = 1.0;


    map.options.worldCopyJump = false;


    map.eachLayer(

        layer=>{

            if(
                layer instanceof L.TileLayer
            ){

                layer.options.noWrap = true;

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


    setTimeout(()=>{

        map.invalidateSize();

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

        },100);

    }

);