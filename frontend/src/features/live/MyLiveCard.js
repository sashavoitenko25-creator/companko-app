import {
    getProfile
} from '../profile/profileStore';


import {
    getLiveState
} from '../../store/liveStore';


import {
    stopLiveSession
} from '../../services/supabase/liveSessionService';



let timer = null;



export function MyLiveCard(){


    const profile = getProfile();


    const live = getLiveState();



    if(!profile || !live.activity)

        return '';





    setTimeout(()=>{


        startTimer();



        initStopButton();



    },0);






    return `


    <div class="my-live-card">



        <img

        class="my-live-card__photo"

        src="${
            profile.photo_url ||
            'https://i.pravatar.cc/150'
        }"

        >




        <div class="my-live-card__info">



            <div class="my-live-card__name">

                ${
                    profile.name ||
                    'Гость'
                }

            </div>





            <div class="my-live-card__activity">


                ${
                    getIcon(
                        live.activity
                    )
                }


                ${
                    live.activity
                }


            </div>





            <div

            id="live-timer"

            class="my-live-card__timer">


                LIVE


            </div>





            <button

            id="stop-live"

            class="stop-live-button">


                ⛔ Закончить LIVE


            </button>




        </div>


    </div>


    `;


}









function initStopButton(){



    const button = document.querySelector(

        '#stop-live'

    );



    if(!button)

        return;





    button.onclick = async()=>{



        const live = getLiveState();



        if(!live.session_id)

        {


            console.warn(

                'No live session id'

            );


            return;


        }





        try{


            await stopLiveSession(

                live.session_id

            );





            window.dispatchEvent(

                new Event(

                    'live:stopped'

                )

            );





        }


        catch(error){


            console.error(

                'Stop LIVE error',

                error

            );


        }



    };


}









function startTimer(){



    const timerElement = document.querySelector(

        '#live-timer'

    );



    if(!timerElement)

        return;





    if(timer)

        clearInterval(timer);





    let seconds =

    (

        getLiveState().duration || 60

    )

    *

    60;






    const update = ()=>{



        const minutes = Math.floor(

            seconds / 60

        );



        const sec = seconds % 60;





        timerElement.innerHTML =


        `🔥 LIVE ${minutes}:${

            sec

            .toString()

            .padStart(2,'0')

        }`;





        seconds--;





        if(seconds < 0){



            clearInterval(timer);



        }



    };





    update();





    timer = setInterval(

        update,

        1000

    );



}









function getIcon(activity){


    const icons = {


        'Выпить':'🍻',

        'Кофе':'☕',

        'Гулять':'🚶',

        'Общаться':'💬',


    };



    return icons[activity] || '🔥';


}