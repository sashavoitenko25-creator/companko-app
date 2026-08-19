import './route.css';

import {
    startRoute,
    stopRoute
} from './routeService';

import {
    getLiveState
} from '../../store/liveStore';


let currentUser = null;
let currentMode = 'car';
let collapsed = false;

let noticeTimer = null;


/* ========================================
   УВЕДОМЛЕНИЕ
======================================== */

function showLiveRequiredNotice(){

    let notice =
        document.querySelector(
            '#route-live-required-notice'
        );


    if(notice){

        clearTimeout(noticeTimer);

        notice.classList.remove(
            'route-live-notice--hide'
        );

        void notice.offsetWidth;

        notice.classList.add(
            'route-live-notice--show'
        );

    }else{

        notice =
            document.createElement('div');

        notice.id =
            'route-live-required-notice';

        notice.className =
            'route-live-notice route-live-notice--show';


        notice.innerHTML = `

            <span class="route-live-notice__icon">
                🔴
            </span>

            <span class="route-live-notice__text">
                Чтобы проложить маршрут, запустите Live
            </span>

        `;


        document.body.appendChild(notice);

    }


    noticeTimer =
        setTimeout(() => {

            notice.classList.remove(
                'route-live-notice--show'
            );

            notice.classList.add(
                'route-live-notice--hide'
            );

        }, 2500);

}


/* ========================================
   ПАНЕЛЬ МАРШРУТА
======================================== */

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


/* ========================================
   ПОКАЗ МАРШРУТА
======================================== */

export function showRoute(user){

    /*
     * Проверяем активный Live
     */

    const live =
        getLiveState();


    if(!live || !live.session_id){

        showLiveRequiredNotice();

        return;

    }


    currentUser = user;
    currentMode = 'car';
    collapsed = false;


    window.dispatchEvent(
        new Event('ui:close-all')
    );


    const panel =
        document.querySelector(
            '#route-panel'
        );


    const info =
        document.querySelector(
            '#route-info'
        );


    const openButton =
        document.querySelector(
            '#route-open-button'
        );


    if(!panel || !info) return;


    panel.classList.add(
        'route-panel--open'
    );


    openButton.classList.remove(
        'route-open-button--show'
    );


    async function build(){

        info.innerHTML =
            `<div>Строим маршрут...</div>`;


        const result =
            await startRoute(
                currentUser,
                currentMode
            );


        if(!result){

            info.innerHTML =
                'Не удалось построить маршрут';

            return;

        }


        info.innerHTML = `

<div class="route-user">

${currentUser.name}

</div>

<div class="route-stat">

📍 ${(result.distance / 1000).toFixed(1)} км

</div>

<div class="route-stat">

⏱ ${result.duration} мин

</div>

`;

    }


    document
        .querySelectorAll(
            '.transport-buttons button'
        )
        .forEach(button => {

            button.onclick =
                async () => {

                    document
                        .querySelectorAll(
                            '.transport-buttons button'
                        )
                        .forEach(item =>
                            item.classList.remove(
                                'active'
                            )
                        );


                    button.classList.add(
                        'active'
                    );


                    currentMode =
                        button.dataset.mode;


                    await build();

                };

        });


    build();


    document
        .querySelector('#route-cancel')
        .onclick = () => {

            stopRoute();


            panel.classList.remove(
                'route-panel--open'
            );


            openButton.classList.remove(
                'route-open-button--show'
            );


            currentUser = null;

        };


    openButton.onclick = () => {

        /*
         * Повторно проверяем Live,
         * если пользователь нажал кнопку
         * после остановки Live.
         */

        const live =
            getLiveState();


        if(!live || !live.session_id){

            showLiveRequiredNotice();

            panel.classList.remove(
                'route-panel--open'
            );

            openButton.classList.remove(
                'route-open-button--show'
            );

            return;

        }


        collapsed = false;


        panel.classList.add(
            'route-panel--open'
        );


        openButton.classList.remove(
            'route-open-button--show'
        );

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


        collapsed = true;


        panel.classList.remove(
            'route-panel--open'
        );


        openButton.classList.add(
            'route-open-button--show'
        );

    }

}