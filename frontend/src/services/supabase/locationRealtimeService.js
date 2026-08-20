import {
    supabase
} from './supabaseClient';


import {
    updateLiveMarkerPosition,
    loadLiveMarkers
} from '../map/liveMarkerService';


let channel = null;


/* =========================================================
   INIT REALTIME
========================================================= */

export function initLocationRealtime(){

    if(channel)
        return;


    channel =
        supabase

            .channel(
                'app-realtime'
            )


            /* =================================================
               LOCATIONS
            ================================================= */

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


            /* =================================================
               LIVE SESSIONS
            ================================================= */

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


                    /*
                     * Определяем актуальную запись.
                     *
                     * Для INSERT / UPDATE используется new.
                     * Для DELETE остаётся old.
                     */

                    const data =
                        payload.new ||
                        payload.old;


                    /*
                     * Если LIVE завершился,
                     * сообщаем приложению ID пользователя.
                     */

                    if(

                        data &&

                        data.user_id &&

                        data.status ===
                            'finished'

                    ){

                        window.dispatchEvent(

                            new CustomEvent(

                                'live:user-ended',

                                {

                                    detail:{

                                        userId:
                                            data.user_id,

                                        sessionId:
                                            data.id

                                    }

                                }

                            )

                        );

                    }


                    /*
                     * Оставляем существующее
                     * обновление карты.
                     */

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


            /* =================================================
               PROFILES
            ================================================= */

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


            /* =================================================
               SUBSCRIBE
            ================================================= */

            .subscribe(

                status=>{

                    console.log(

                        'REALTIME STATUS',

                        status

                    );

                }

            );

}