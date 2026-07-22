import {
    getMap
} from './mapService';


import {
    getCurrentPosition
} from '../location/locationService';




export function centerOnMyLocation(){



    const map = getMap();



    const position = getCurrentPosition();




    if(
        !map ||
        !position
    )

        return;






    map.setView(


        [

            position.lat,

            position.lng

        ],


        16,


        {

            animate:true,

            duration:0.8

        }


    );


}