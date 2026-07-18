import './Home.css';


import {
    Header
} from '../../components/Header';


import {
    Map
} from '../../components/Map';


import {
    LiveModal
} from '../../components/LiveModal';


import {
    BottomBar
} from '../../components/BottomBar';


import {
    RoutePanel,
    showRoute
} from '../../features/route/RoutePanel';


import {
    SelectedUser,
    showUserCard
} from '../../features/profile/SelectedUser';



import '../../features/live/live.css';

import '../../features/route/route.css';





import {
    setActivity,
    setDuration,
    setLiveSession,
    clearLiveState,
    getLiveState
} from '../../store/liveStore';




import {
    getProfile
} from '../../features/profile/profileStore';




import {
    createLiveSession,
    sendLocation,
    stopLiveSession,
    restoreActiveLive
} from '../../services/supabase/liveSessionService';




import {
    initMyLiveController
} from '../../features/live/myLiveController';







let selectedUser = null;

let initialized = false;









export function Home(){



    setTimeout(async()=>{


        await initHomeEvents();


    },0);






    return `



<main class="home">



${Map()}



${Header()}



<div id="my-live-container"></div>



${LiveModal()}



${RoutePanel()}



${SelectedUser()}



${BottomBar()}



</main>



`;

}













async function initHomeEvents(){



    if(initialized)

        return;



    initialized = true;




    console.log(

        'HOME EVENTS INIT'

    );





    await restoreMyLive();





    initMyLiveController();



    initLiveEvents();



    initUserSelection();
	
	
	
	initMyLiveSelection();



    initLiveButton();



}












async function restoreMyLive(){



    try{



        const profile = getProfile();



        if(!profile)

            return;




        const userId =

        profile.user_id ||

        profile.id;





        const session = await restoreActiveLive(

            userId

        );





        if(session){



            setLiveSession(

                session

            );




            window.dispatchEvent(

                new Event(

                    'live:started'

                )

            );

        }




    }

    catch(error){


        console.error(

            'Restore LIVE error',

            error

        );


    }


}









function initLiveButton(){



    const button = document.querySelector(

        '#live-button'

    );



    if(!button)

        return;





    button.onclick = ()=>{



        const modal = document.querySelector(

            '#live-modal'

        );



        if(modal)

            modal.classList.add(

                'open'

            );


    };


}









function initLiveEvents(){



    console.log(

        'LIVE EVENTS INIT'

    );





    document

    .querySelectorAll('.live-option')

    .forEach(button=>{



        button.onclick = ()=>{



            document

            .querySelectorAll('.live-option')

            .forEach(item=>{


                item.classList.remove(

                    'active'

                );


            });





            button.classList.add(

                'active'

            );





            setActivity(

                button.dataset.activity

            );


        };


    });










    document

    .querySelectorAll('.time-options button')

    .forEach(button=>{



        button.onclick = ()=>{



            document

            .querySelectorAll('.time-options button')

            .forEach(item=>{


                item.classList.remove(

                    'active'

                );


            });





            button.classList.add(

                'active'

            );





            setDuration(

                Number(

                    button.dataset.time

                )

            );


        };


    });









    const start = document.querySelector(

        '#start-live'

    );



    if(start){



        start.onclick = async()=>{



            try{



                const live = getLiveState();



                const profile = getProfile();





                if(!profile)

                    return;





                const userId =

                profile.user_id ||

                profile.id;





                const session = await createLiveSession({



                    user_id:userId,


                    activity:

                    live.activity,


                    duration:

                    live.duration || 60



                });






                setLiveSession(

                    session

                );






                document

                .querySelector('#live-modal')

                ?.classList.remove(

                    'open'

                );






                window.dispatchEvent(

                    new CustomEvent(

                        'live:started',

                        {

                            detail:session

                        }

                    )

                );







                navigator.geolocation.getCurrentPosition(



                    async(position)=>{



                        await sendLocation(



                            userId,


                            position.coords.latitude,


                            position.coords.longitude



                        );


                    }


                );




            }

            catch(error){


                console.error(

                    'LIVE ERROR',

                    error

                );


            }


        };


    }









    const stop = document.querySelector(

        '#stop-live'

    );



    if(stop){



        stop.onclick = async()=>{



            const live = getLiveState();




            if(!live.session_id)

                return;





            await stopLiveSession(

                live.session_id

            );





            clearLiveState();





            window.dispatchEvent(

                new Event(

                    'live:stopped'

                )

            );



        };


    }



}









function initUserSelection(){



    window.addEventListener(


        'user:selected',


        event=>{



            console.log(

                'USER SELECTED HOME',

                event.detail

            );



            selectedUser = event.detail;



            showUserCard(

                selectedUser

            );



        }


    );









    document.addEventListener(


        'click',


        event=>{



            if(

                event.target.classList.contains(

                    'user-card__route'

                )

            ){



                if(selectedUser){



                    showRoute(

                        selectedUser

                    );


                }


            }


        }


    );


}

function initMyLiveSelection(){


    window.addEventListener(


        'my-live:selected',


        (event)=>{


            console.log(

                'OPEN MY LIVE PANEL',

                event.detail

            );



            const live = event.detail.live;

            const profile = event.detail.profile;



            alert(

                '🔥 Ваш LIVE\n\n' +

                'Активность: ' +

                live.activity

            );



        }


    );


}