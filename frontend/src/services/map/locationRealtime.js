import {
    supabase
} from '../supabase/supabaseClient';


import {
    updateLiveMarkerPosition
} from './liveMarkerService';



let channel = null;




export function initLocationRealtime(){



    if(channel)

        return;





    channel = supabase


        .channel('location-changes')



        .on(


            'postgres_changes',


            {


                event:'INSERT',


                schema:'public',


                table:'locations'


            },



            (payload)=>{



                const location =

                payload.new;




                if(!location)

                    return;





                updateLiveMarkerPosition(



                    location.user_id,



                    [


                        location.latitude,


                        location.longitude


                    ]



                );



            }


        )



        .subscribe();



}