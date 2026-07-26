import {
    getMap
} from './mapService';

export function centerOnMyLocation(){

    const map = getMap();

    if(!map)
        return;

    if(!navigator.geolocation){

        console.error('No geolocation');

        return;

    }

    navigator.geolocation.getCurrentPosition(

        position=>{

            map.flyTo(

                [

                    position.coords.latitude,

                    position.coords.longitude

                ],

                17,

                {

                    animate:true,
                    duration:1

                }

            );

        },

        error=>{

            console.error(error);

        },

        {

            enableHighAccuracy:true

        }

    );

}