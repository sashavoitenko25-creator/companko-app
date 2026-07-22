import {
    supabase
} from '../supabase/supabaseClient';


import {
    clearLiveMarkers,
    loadLiveMarkers
} from './liveMarkerService';



let channel = null;



export function initLiveSessionRealtime(){


    if(channel)

        return;




    channel = supabase


        .channel('live-session-changes')



        .on(


            'postgres_changes',


            {


                event:'UPDATE',


                schema:'public',


                table:'live_sessions'


            },



            async(payload)=>{



                const oldStatus =

                payload.old.status;



                const newSession =

                payload.new;





                if(


                    oldStatus === 'active'


                    &&


                    newSession.status !== 'active'


                ){



                    clearLiveMarkers();



                    await loadLiveMarkers();



                }



            }


        )



        .subscribe();



}