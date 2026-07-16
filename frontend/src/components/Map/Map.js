import './Map.css';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';


import { UserMarker } from '../UserMarker';

import { getLiveUsers } from '../../services/live/liveService';


import {
    drawRoute,
    clearRoute
} from '../../services/map/routeMapService';



let map;

let userLocation = [
    50.4501,
    30.5234
];



export function Map(){


    setTimeout(initMap);


    return `

        <div 
        id="map" 
        class="map">
        </div>

    `;


}





function initMap(){


    if(map)
        return;



    map = L.map(

        'map',

        {

            zoomControl:false,

            attributionControl:false

        }

    )
    .setView(

        userLocation,

        14

    );




    L.tileLayer(

        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',

        {

            maxZoom:19

        }

    )
    .addTo(map);





    createMyLocation();

    createUsers();

    initRouteEvents();


}







function createMyLocation(){



    const icon =

    L.divIcon({

        className:'',

        html:`

            <div class="my-location">

                <div class="my-location__pulse">
                </div>

            </div>

        `,


        iconSize:[
            30,
            30
        ],

        iconAnchor:[
            15,
            15
        ]

    });




    L.marker(

        userLocation,

        {

            icon

        }

    )
    .addTo(map);



}







function createUsers(){



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





        const marker =

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





        marker.on(

            'click',

            ()=>{


                window.dispatchEvent(

                    new CustomEvent(

                        'user:selected',

                        {

                            detail:user

                        }

                    )

                );


            }

        );



    });



}







function initRouteEvents(){



    window.addEventListener(

        'route:started',

        (event)=>{


            const user =
            event.detail;



            drawRoute(

                map,

                userLocation,

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
                map
            );


        }

    );


}