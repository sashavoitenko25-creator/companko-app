import './Map.css';


import {
    initMap
} from '../../services/map/mapInit';


import {
    centerOnMyLocation
} from '../../services/map/locationControlService';


import {
    OnlineCounter
} from '../OnlineCounter';


import {
    getOnlineCount
} from '../../services/supabase/liveService';






let initialized = false;










export function Map(){



    setTimeout(()=>{


        initMapSafe();


    },0);






    return `


<div
    id="map"
    class="map">
</div>



<div
    id="selected-user-container">
</div>



<div
    id="online-counter-container">
</div>




<button
    id="my-location-button"
    class="my-location-button">

    📍

</button>



`;

}





function initMapSafe(){



    const mapElement =

    document.querySelector(
        '#map'
    );



    if(!mapElement)

        return;







    if(!initialized){



        initialized = true;



        try{


            initMap();



        }

        catch(error){


            console.error(

                'MAP INIT ERROR',

                error

            );


        }



    }







    const button =

    document.querySelector(
        '#my-location-button'
    );




    if(button){


        button.onclick =

        centerOnMyLocation;


    }






    loadOnlineCounter();






    // обновление онлайна и маркеров без перезагрузки

    window.addEventListener(

        'live:refresh',

        ()=>{


            loadOnlineCounter();


        }

    );






    window.addEventListener(

        'live:started',

        ()=>{


            setTimeout(()=>{


                loadOnlineCounter();



                window.dispatchEvent(

                    new Event(
                        'live:refresh'
                    )

                );


            },300);



        }

    );






    window.addEventListener(

        'live:stopped',

        ()=>{


            setTimeout(()=>{


                loadOnlineCounter();



                window.dispatchEvent(

                    new Event(
                        'live:refresh'
                    )

                );


            },300);



        }

    );



}









async function loadOnlineCounter(){



    const container =

    document.querySelector(

        '#online-counter-container'

    );



    if(!container)

        return;






    try{



        const count =

        await getOnlineCount();





        container.innerHTML =

        OnlineCounter(count);




    }

    catch(error){



        console.error(

            'ONLINE COUNTER ERROR',

            error

        );


    }



}









window.addEventListener(


    'profile:created',


    ()=>{



        setTimeout(()=>{



            initialized = false;


            initMapSafe();



        },100);



    }


);