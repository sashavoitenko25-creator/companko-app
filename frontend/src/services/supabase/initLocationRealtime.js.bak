import {
    supabase
} from './supabaseClient';


import {
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


        (payload)=>{


            window.dispatchEvent(
                new Event(
                    'live:refresh'
                )
            );


        }

    )


    // старт/стоп LIVE
    .on(

        'postgres_changes',

        {
            event:'*',
            schema:'public',
            table:'live_sessions'
        },


        (payload)=>{


            console.log(
                'LIVE SESSION CHANGE',
                payload
            );


            window.dispatchEvent(
                new Event(
                    'live:refresh'
                )
            );


        }

    )


    // изменение профиля
    .on(

        'postgres_changes',

        {
            event:'*',
            schema:'public',
            table:'profiles'
        },


        ()=>{


            window.dispatchEvent(
                new Event(
                    'live:refresh'
                )
            );


        }

    )


    .subscribe(

        status=>{


            console.log(
                'REALTIME STATUS:',
                status
            );


        }

    );


}