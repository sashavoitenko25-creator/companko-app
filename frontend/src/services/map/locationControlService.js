import {
    getMap
} from './mapService';

import {
    getCurrentPosition
} from '../location/locationService';

export async function centerOnMyLocation(){

    const map = getMap();

    if(!map)
        return;

    try{

        const position = await getCurrentPosition();

        if(!position)
            return;

        map.flyTo(

            [

                position.latitude,

                position.longitude

            ],

            17,

            {

                animate:true,

                duration:1.2

            }

        );

    }

    catch(error){

        console.error(
            'CENTER LOCATION ERROR',
            error
        );

    }

}