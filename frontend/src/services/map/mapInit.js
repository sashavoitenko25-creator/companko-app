import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


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

            attributionControl:false

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









    initMyMarker();



    initLocationEvents();









    watchLocation(

        (position)=>{



            console.log(

                'LOCATION UPDATED',

                position

            );






            // ==========================
            // СОХРАНЯЕМ МОЮ ПОЗИЦИЮ
            // ДЛЯ МАРШРУТА
            // ==========================


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
            new Event('route:collapse')
        );

    }



    loadLiveMarkers();



    initLocationRealtime();









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