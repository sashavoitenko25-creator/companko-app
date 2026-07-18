import {
    supabase
} from '../supabase/supabaseClient';


import {
    getProfile
} from '../../features/profile/profileStore';



let channel = null;



export function initLiveRealtime(){


    if(channel)

        return;



    const profile = getProfile();



    if(!profile)

        return;



    const userId =

    profile.id ||

    profile.user_id;





    channel = supabase


        .channel('live-realtime')



        .on(


            'postgres_changes',


            {


                event:'UPDATE',


                schema:'public',


                table:'live_sessions'


            },



            (payload)=>{



                const live = payload.new;




                if(

                    live.user_id !== userId

                )

                    return;






                if(

                    live.status === 'active'

                ){



                    window.dispatchEvent(

                        new Event(

                            'live:started'

                        )

                    );



                }







                if(

                    live.status !== 'active'

                ){



                    window.dispatchEvent(

                        new Event(

                            'live:stopped'

                        )

                    );



                }



            }


        )



        .subscribe();



}