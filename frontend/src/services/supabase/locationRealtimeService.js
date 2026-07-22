import {
    supabase
} from './supabaseClient';



import {
    updateLiveMarkerPosition,
    loadLiveMarkers
} from '../map/liveMarkerService';




let channel = null;








export function initLocationRealtime(){



    if(channel)

        return;






    channel = supabase

        .channel(
            'app-realtime'
        )







        // движение пользователей

        .on(

            'postgres_changes',

            {

                event:'*',

                schema:'public',

                table:'locations'

            },


            payload=>{



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








        // включение / выключение LIVE

        .on(

            'postgres_changes',

            {

                event:'*',

                schema:'public',

                table:'live_sessions'

            },


            payload=>{



                console.log(

                    'LIVE SESSION CHANGE',

                    payload

                );






                window.dispatchEvent(

                    new Event(

                        'live:refresh'

                    )

                );






                setTimeout(()=>{


                    loadLiveMarkers();



                },500);



            }

        )








        // изменение профилей

        .on(

            'postgres_changes',

            {

                event:'*',

                schema:'public',

                table:'profiles'

            },


            payload=>{



                console.log(

                    'PROFILE CHANGE',

                    payload

                );






                window.dispatchEvent(

                    new Event(

                        'live:refresh'

                    )

                );





                setTimeout(()=>{


                    loadLiveMarkers();



                },500);



            }

        )








        .subscribe(

            status=>{


                console.log(

                    'REALTIME STATUS',

                    status

                );


            }

        );



}