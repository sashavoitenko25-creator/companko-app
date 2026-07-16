import './Map.css';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import { UserMarker } from '../UserMarker';

import { getLiveUsers } from '../../services/live/liveService';



let map;



export function Map(){


    setTimeout(initMap);


    return `

        <div id="map" class="map"></div>

    `;


}




function initMap(){


    if(map) return;



    map = L.map(
        'map',
        {
            zoomControl:false,
            attributionControl:false
        }
    )
    .setView(
        [50.4501,30.5234],
        14
    );



    L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
            maxZoom:19
        }
    )
    .addTo(map);



    const users =
    getLiveUsers();



    users.forEach(user=>{


        const icon =
        L.divIcon({

            className:'',

            html:
            UserMarker(user),

            iconSize:[
                58,
                58
            ],

            iconAnchor:[
                29,
                29
            ]

        });



        L.marker(

            [
                user.lat,
                user.lng
            ],

            {
                icon
            }

        )
        .addTo(map);


    });


}