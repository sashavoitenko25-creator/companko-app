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





export function initMap(){


    if(initialized)

        return;



    initialized = true;



    console.log(
        'MAP INIT'
    );





    const map = L.map(

        'map',

        {

            zoomControl:false,

            attributionControl:false,


            /* =================================
               ВРАЩЕНИЕ КАРТЫ
            ================================= */

            rotate:true,

            touchRotate:true,

            bearing:0,


            /*

            Кнопку Leaflet для поворота
            специально не показываем.

            Поворот выполняется
            двумя пальцами.

            */

            rotateControl:false

        }

    )

    .setView(

        [
            50.4501,
            30.5234
        ],

        14

    );





    setMap(
        map
    );





    tileLayer = L.tileLayer(

        getTileUrl(),

        {

            maxZoom:19

        }

    )

    .addTo(map);





    setCurrentTileLayer(
        tileLayer
    );





    /* ========================================
       КЛИК ПО КАРТЕ
    ======================================== */

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





    /* ========================================
       МОЙ МАРКЕР
    ======================================== */

    initMyMarker();





    /* ========================================
       СОБЫТИЯ ЛОКАЦИИ
    ======================================== */

    initLocationEvents();





    /* ========================================
       ОТСЛЕЖИВАНИЕ ПОЗИЦИИ
    ======================================== */

    watchLocation(

        (position)=>{


            console.log(

                'LOCATION UPDATED',

                position

            );





            /* ==============================
               МОЯ ПОЗИЦИЯ
               ДЛЯ МАРШРУТА
            ============================== */

            window.myLocation = {


                lat:

                position.latitude,


                lng:

                position.longitude


            };





            /* ==============================
               ОБНОВЛЯЕМ МОЙ МАРКЕР
            ============================== */

            updateMyMarker(

                position.latitude,

                position.longitude

            );





            /* ==============================
               СОБЫТИЕ ОБНОВЛЕНИЯ ЛОКАЦИИ
            ============================== */

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





    /* ========================================
       PROFILE OPEN
    ======================================== */

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





    /* ========================================
       LIVE MARKERS
    ======================================== */

    loadLiveMarkers();





    /* ========================================
       LOCATION REALTIME
    ======================================== */

    initLocationRealtime();





    /* ========================================
       LIVE STARTED
    ======================================== */

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





    /* ========================================
       LIVE STOPPED
    ======================================== */

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