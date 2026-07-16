import './route.css';

import {
    stopRoute,
    startRoute
} from './routeService';



export function RoutePanel(){


    return `


    <div 
    id="route-panel"
    class="route-panel"
    >


        <div class="route-panel__title">

            Маршрут

        </div>



        <div id="route-info">

        </div>



        <button 
        id="route-cancel"
        >

            Отменить

        </button>


    </div>


    `;


}





export function showRoute(user){


    const panel =
    document.querySelector(
        '#route-panel'
    );


    const info =
    document.querySelector(
        '#route-info'
    );



    if(!panel || !info)
        return;



    info.innerHTML = `


        <div>

            ${user.name}

        </div>


        <div>

            📍 ${user.distance} м

        </div>


        <div>

            🚶 ~5 минут

        </div>


    `;



    panel.classList.add(
        'route-panel--open'
    );



    // запускаем маршрут на карте
    startRoute(user);



    document
    .querySelector('#route-cancel')
    ?.addEventListener(

        'click',

        ()=>{


            panel.classList.remove(
                'route-panel--open'
            );


            stopRoute();


        }

    );


}