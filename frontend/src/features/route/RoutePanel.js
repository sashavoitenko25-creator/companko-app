import './route.css';

import {
    startRoute,
    stopRoute
} from './routeService';

let currentUser = null;
let currentMode = 'car';
let collapsed = false;

export function RoutePanel() {

    return `

<div id="route-panel" class="route-panel">

    <div class="route-panel__title">
        Маршрут
    </div>

    <div id="route-info"></div>

    <div class="transport-buttons">

        <button data-mode="foot">
            🚶 Пешком
        </button>

        <button data-mode="bike">
            🚲 Велосипед
        </button>

        <button data-mode="car" class="active">
            🚗 Машина
        </button>

    </div>

    <button id="route-cancel">
        Отменить
    </button>

</div>

<button
    id="route-open-button"
    class="route-open-button">

🧭

</button>

`;

}

export function showRoute(user){

    currentUser=user;
    currentMode='car';
    collapsed=false;

    window.dispatchEvent(
        new Event('ui:close-all')
    );

    const panel=document.querySelector('#route-panel');
    const info=document.querySelector('#route-info');
    const openButton=document.querySelector('#route-open-button');

    if(!panel||!info) return;

    panel.classList.add('route-panel--open');
    openButton.classList.remove('route-open-button--show');

    async function build(){

        info.innerHTML=`<div>Строим маршрут...</div>`;

        const result=await startRoute(
            currentUser,
            currentMode
        );

        if(!result){

            info.innerHTML='Не удалось построить маршрут';
            return;

        }

        info.innerHTML=`

<div class="route-user">

${currentUser.name}

</div>

<div class="route-stat">

📍 ${(result.distance/1000).toFixed(1)} км

</div>

<div class="route-stat">

⏱ ${result.duration} мин

</div>

`;

    }

    document
    .querySelectorAll('.transport-buttons button')
    .forEach(button=>{

        button.onclick=async()=>{

            document
            .querySelectorAll('.transport-buttons button')
            .forEach(item=>item.classList.remove('active'));

            button.classList.add('active');

            currentMode=button.dataset.mode;

            await build();

        };

    });

    build();

    document.querySelector('#route-cancel').onclick=()=>{

        stopRoute();

        panel.classList.remove('route-panel--open');

        openButton.classList.remove('route-open-button--show');

        currentUser=null;

    };

    openButton.onclick=()=>{

        collapsed=false;

        panel.classList.add('route-panel--open');

        openButton.classList.remove('route-open-button--show');

    };

    window.removeEventListener(
        'route:collapse',
        collapseRoute
    );

    window.addEventListener(
        'route:collapse',
        collapseRoute
    );

    function collapseRoute(){

        if(!currentUser) return;
        if(collapsed) return;

        collapsed=true;

        panel.classList.remove('route-panel--open');

        openButton.classList.add('route-open-button--show');

    }

}