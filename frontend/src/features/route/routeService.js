import L from 'leaflet';

import {
    getMap
} from '../../services/map/mapService';

let routeLine = null;

let activeUser = null;

export async function startRoute(user){

    activeUser = user;

    if(
        user.lat == null ||
        user.lng == null
    ){
        return;
    }

    const position = await getCurrentPosition();

    if(!position)
        return;

    await buildRoute(

        position.latitude,
        position.longitude,

        user.lat,
        user.lng

    );

}

export function stopRoute(){

    const map = getMap();

    if(routeLine && map){

        map.removeLayer(routeLine);

    }

    routeLine = null;
    activeUser = null;

}

export function getRoute(){

    return activeUser;

}

async function buildRoute(

    fromLat,
    fromLng,

    toLat,
    toLng

){

    const map = getMap();

    if(!map)
        return;

    if(routeLine){

        map.removeLayer(routeLine);

    }

    try{

        const response = await fetch(

            `https://router.project-osrm.org/route/v1/driving/`

            +

            `${fromLng},${fromLat};${toLng},${toLat}`

            +

            `?overview=full&geometries=geojson`

        );

        const json = await response.json();

        if(!json.routes?.length)
            return;

        const coordinates = json.routes[0]

            .geometry

            .coordinates

            .map(item=>[

                item[1],
                item[0]

            ]);

        routeLine = L.polyline(

            coordinates,

            {

                color:'#7c3aed',

                weight:6,

                opacity:.9

            }

        ).addTo(map);

        map.fitBounds(

            routeLine.getBounds(),

            {

                padding:[60,60]

            }

        );

    }

    catch(error){

        console.error(error);

    }

}

function getCurrentPosition(){

    return new Promise(resolve=>{

        navigator.geolocation.getCurrentPosition(

            position=>resolve({

                latitude:position.coords.latitude,
                longitude:position.coords.longitude

            }),

            ()=>resolve(null),

            {

                enableHighAccuracy:true

            }

        );

    });

}