import {
    getProfile
} from '../../features/profile/profileStore';


import {
    getLiveState
} from '../../store/liveStore';



export function initLocationEvents(){


    window.addEventListener(

        'location:updated',

        (event)=>{


            const position = event.detail;


            if(!position)
                return;



            // просто передаем координаты
            // маркер создаёт myMarkerService

            window.dispatchEvent(

                new CustomEvent(

                    'my-location:update',

                    {

                        detail:position

                    }

                )

            );


        }

    );





    window.addEventListener(

        'live:started',

        ()=>{


            refreshMyProfile();


        }

    );





    window.addEventListener(

        'live:stopped',

        ()=>{


            refreshMyProfile();


        }

    );



}





function refreshMyProfile(){


    const profile =
        getProfile();


    const live =
        getLiveState();



    if(!profile)
        return;




    window.dispatchEvent(

        new CustomEvent(

            'my-live:update',

            {

                detail:{


                    ...profile,


                    activity:

                    live.activity || 'LIVE',



                    duration:

                    live.duration || 0,



                    isLive:

                    !!live.session_id,



                    own:true


                }


            }

        )

    );


}