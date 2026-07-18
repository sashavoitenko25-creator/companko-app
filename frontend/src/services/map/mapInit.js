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






let initialized = false;









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







    setMap(map);









    L.tileLayer(


        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',


        {


            maxZoom:19


        }


    )

    .addTo(map);









    initMyMarker();



    initLocationEvents();








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