import L from 'leaflet';


import {
    getMap
} from './mapService';


import {
    getProfile
} from '../../features/profile/profileStore';




let myMarker = null;

let isLive = false;









export function initMyMarker(){



    window.addEventListener(


        'location:updated',


        (event)=>{



            const position = event.detail;



            updateMyMarker(

                position.lat,

                position.lng

            );


        }


    );







    window.addEventListener(


        'live:started',


        ()=>{


            isLive = true;


            refreshMarker();


        }


    );








    window.addEventListener(


        'live:stopped',


        ()=>{


            isLive = false;


            refreshMarker();


        }


    );



}













export function updateMyMarker(

    latitude,

    longitude

){



    const map = getMap();




    if(!map)

        return;





    const position = [


        latitude,


        longitude


    ];






    if(myMarker){



        myMarker.setLatLng(

            position

        );


        return;


    }







    myMarker = L.marker(


        position,


        {


            icon:createIcon(),


            zIndexOffset:1000


        }


    )

    .addTo(map);






    map.setView(


        position,


        15


    );


}














function refreshMarker(){



    if(!myMarker)

        return;




    myMarker.setIcon(

        createIcon()

    );


}













function createIcon(){



    if(isLive){



        const profile = getProfile();




        return L.divIcon({



            className:'',



            html:`



            <div class="my-live-marker">


                <img

                src="${

                    profile?.photo_url ||

                    'https://i.pravatar.cc/150'

                }"

                >


            </div>


            `,



            iconSize:[60,60],



            iconAnchor:[30,30]



        });



    }









    return L.divIcon({



        className:'',



        html:`



        <div class="my-location">


            <div class="my-location__pulse"></div>


        </div>



        `,



        iconSize:[40,40],



        iconAnchor:[20,20]



    });



}