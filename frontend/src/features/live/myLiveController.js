import {
    MyLiveCard
} from './MyLiveCard';


import {
    getProfile
} from '../profile/profileStore';



import {
    setActivity,
    setDuration,
    setLiveSession
} from '../../store/liveStore';



import {
    restoreActiveLive
} from '../../services/supabase/liveSessionService';



let initialized = false;





export async function initMyLiveController(){



    if(initialized)

        return;



    initialized = true;





    const container = document.querySelector(

        '#my-live-container'

    );



    if(!container)

        return;







    const profile = getProfile();





    if(profile){



        const userId =

        profile.id ||

        profile.user_id;






        const live = await restoreActiveLive(

            userId

        );







        if(live){



            console.log(

                'MY LIVE RESTORED',

                live

            );




            setLiveSession(

                live

            );





            setActivity(

                live.activity

            );





            setDuration(

                live.duration

            );







            window.dispatchEvent(

                new CustomEvent(

                    'live:started',

                    {

                        detail:live

                    }

                )

            );



        }



    }







    render();







    window.addEventListener(

        'live:started',

        ()=>{


            render();


        }

    );







    window.addEventListener(

        'live:stopped',

        ()=>{


            render();


        }

    );





}








function render(){



    const container = document.querySelector(

        '#my-live-container'

    );



    if(!container)

        return;





    container.innerHTML =

        MyLiveCard();



}