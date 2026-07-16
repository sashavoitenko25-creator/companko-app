import './Map.css';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import { MapMarker } from '../MapMarker';


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



    const icon = L.divIcon({

        className:'custom-marker',

        html:MapMarker(),

        iconSize:[60,60],

        iconAnchor:[30,30]

    });



    L.marker(
        [50.4501,30.5234],
        {
            icon
        }
    )
    .addTo(map);


}