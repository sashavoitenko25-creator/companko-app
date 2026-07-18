import {
    supabase
} from './supabaseClient';


import {
    updateLiveMarkerPosition
} from '../map/liveMarkerService';






let channel = null;






export function initLocationRealtime(){



    if(channel)

        return;





    channel = supabase


        .channel(

            'locations-realtime'

        )



        .on(


            'postgres_changes',


            {


                event:'*',


                schema:'public',


                table:'locations'


            },



            (payload)=>{





                const data =

                payload.new;






                if(!data)

                    return;








                updateLiveMarkerPosition(



                    data.user_id,



                    [

                        data.latitude,

                        data.longitude

                    ]



                );



            }



        )



        .subscribe();



}