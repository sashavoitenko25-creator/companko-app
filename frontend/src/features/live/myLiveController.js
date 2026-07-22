import {
    getProfile
} from '../profile/profileStore';


import {
    getLiveState
} from '../../store/liveStore';



let initialized = false;





export function initMyLiveController(){



    if(initialized)

        return;



    initialized = true;





    document.addEventListener(

        'click',

        event=>{



            const target =
                event.target.closest(
                    '.my-live-marker'
                );



            if(!target)

                return;





            const profile =
                getProfile();



            const live =
                getLiveState();





            if(!profile)

                return;







            window.dispatchEvent(


                new CustomEvent(

                    'my-live:selected',

                    {

                        detail:{


                            profile,


                            live



                        }


                    }

                )


            );



        }


    );


}