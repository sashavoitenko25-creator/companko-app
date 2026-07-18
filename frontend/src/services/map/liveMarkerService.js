import L from 'leaflet';

import { UserMarker } from '../../components/UserMarker';
import { getMap } from './mapService';
import { getLiveUsers } from '../supabase/liveService';

import {
    getProfile
} from '../../features/profile/profileStore';



let liveMarkers = [];

let liveMarkerMap = {};








export async function loadLiveMarkers(){



    const map = getMap();



    if(!map)

        return;





    clearLiveMarkers();





    const users = await getLiveUsers();



    const profile = getProfile();



    const myId =

    profile?.id ||

    profile?.user_id;








    users.forEach(user=>{





        // НЕ рисуем себя

        if(

            String(user.user_id)

            ===

            String(myId)

        ){

            return;

        }







        if(

            user.lat == null ||

            user.lng == null

        )

            return;








        const marker = createMarker(

            map,

            user

        );





        liveMarkers.push(marker);



        liveMarkerMap[user.user_id] = marker;



    });



}









function createMarker(map,user){



    const icon = L.divIcon({



        className:'',



        html:UserMarker(user),



        iconSize:[64,64],



        iconAnchor:[32,32]



    });







    const marker = L.marker(



        [


            user.lat,


            user.lng


        ],



        {

            icon,


            zIndexOffset:500


        }



    )

    .addTo(map);







    marker.on(


        'click',


        ()=>{



            console.log(

                'LIVE MARKER CLICK',

                user

            );



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





    return marker;



}









export function updateLiveMarkerPosition(

    userId,

    position

){



    const marker =

    liveMarkerMap[userId];



    if(!marker)

        return;



    marker.setLatLng(

        position

    );



}









export function clearLiveMarkers(){



    const map = getMap();



    if(!map)

        return;





    liveMarkers.forEach(marker=>{


        map.removeLayer(marker);


    });




    liveMarkers=[];



    liveMarkerMap={};



}








window.addEventListener(


    'live:refresh',


    ()=>{


        loadLiveMarkers();



    }


);