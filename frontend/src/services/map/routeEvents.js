import {
    drawRoute,
    clearRoute
} from './routeMapService';

import {
    getCurrentPosition
} from '../location/locationService';

import {
    getMap
} from './mapService';

export function initRouteEvents(){

    window.addEventListener(

        'route:started',

        (event)=>{

            const user = event.detail;

            const start = getCurrentPosition();

            if(!start)
                return;

            drawRoute(

                getMap(),

                [

                    start.lat,

                    start.lng

                ],

                [

                    user.lat,

                    user.lng

                ]

            );

        }

    );

    window.addEventListener(

        'route:stopped',

        ()=>{

            clearRoute(

                getMap()

            );

        }

    );

}