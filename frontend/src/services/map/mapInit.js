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









    // ==========================
    // MAP THEME
    // ==========================


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









    // ==========================
    // CLOSE WINDOWS
    // ==========================


    map.on(

        'click',

        ()=>{


            window.dispatchEvent(

                new Event(

                    'ui:close-all'

                )

            );


        }

    );









    // ==========================
    // MY MARKER
    // ==========================


    initMyMarker();





    initLocationEvents();









    // ==========================
    // LOCATION
    // ==========================


    watchLocation(

        (position)=>{


            console.log(

                'LOCATION UPDATED',

                position

            );





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









    // ==========================
    // LIVE
    // ==========================


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