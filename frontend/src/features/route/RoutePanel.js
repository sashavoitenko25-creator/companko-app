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

let routeLiveListenerInitialized = false;


/* ========================================
   УВЕДОМЛЕНИЕ
======================================== */

function showLiveRequiredNotice(){

    let notice =
        document.querySelector(
            '#route-live-required-notice'
        );


    if(notice){

        clearTimeout(
            noticeTimer
        );


        notice.classList.remove(
            'route-live-notice--hide'
        );


        void notice.offsetWidth;


        notice.classList.add(
            'route-live-notice--show'
        );

    }

    else{

        notice =
            document.createElement(
                'div'
            );


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


        document.body.appendChild(
            notice
        );

    }


    noticeTimer =
        setTimeout(
            () => {

                notice.classList.remove(
                    'route-live-notice--show'
                );


                notice.classList.add(
                    'route-live-notice--hide'
                );

            },

            2500

        );

}


/* ========================================
   ПАНЕЛЬ МАРШРУТА
======================================== */

export function RoutePanel(){

    /*
     * Один раз подключаем обработчик
     * завершения Live пользователя.
     */

    initRouteLiveAutoClose();


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
    class="route-open-button"
    aria-label="Открыть маршрут">

    <svg
        class="route-open-button__icon"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true">

        <path
            d="M12 2
               L14.7 9.3
               L22 12
               L14.7 14.7
               L12 22
               L9.3 14.7
               L2 12
               L9.3 9.3
               Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linejoin="round"
            stroke-linecap="round"
        />

        <path
            d="M12 7
               L13.6 10.4
               L17 12
               L13.6 13.6
               L12 17
               L10.4 13.6
               L7 12
               L10.4 10.4
               Z"
            fill="currentColor"
            opacity=".9"
        />

    </svg>

</button>

`;

}


/* ========================================
   AUTO CLOSE ROUTE
======================================== */

function initRouteLiveAutoClose(){

    if(routeLiveListenerInitialized)
        return;


    routeLiveListenerInitialized =
        true;


    window.addEventListener(

        'live:user-ended',

        event=>{

            const endedUserId =
                event.detail?.userId;


            if(!endedUserId)
                return;


            if(!currentUser)
                return;


            const targetUserId =
                getUserId(
                    currentUser
                );


            if(!targetUserId)
                return;


            /*
             * Если закончил Live не тот человек,
             * ничего не делаем.
             */

            if(

                String(targetUserId) !==
                String(endedUserId)

            ){

                return;

            }


            console.log(
                'TARGET LIVE ENDED - CLOSING ROUTE'
            );


            closeRouteAutomatically();

        }

    );

}


/* ========================================
   GET USER ID
======================================== */

function getUserId(user){

    if(!user)
        return null;


    return (

        user.user_id ||

        user.id ||

        user.profile_id ||

        null

    );

}


/* ========================================
   CLOSE ROUTE AUTOMATICALLY
======================================== */

function closeRouteAutomatically(){

    const panel =
        document.querySelector(
            '#route-panel'
        );


    const openButton =
        document.querySelector(
            '#route-open-button'
        );


    /*
     * Останавливаем линию маршрута
     * и animationFrame.
     */

    stopRoute();


    /*
     * Закрываем открытую панель.
     */

    panel?.classList.remove(
        'route-panel--open'
    );


    /*
     * Также убираем кнопку
     * повторного открытия.
     */

    openButton?.classList.remove(
        'route-open-button--show'
    );


    /*
     * Очищаем текущее состояние.
     */

    currentUser =
        null;


    collapsed =
        false;


    /*
     * На всякий случай очищаем информацию
     * о старом маршруте.
     */

    const info =
        document.querySelector(
            '#route-info'
        );


    if(info){

        info.innerHTML =
            '';

    }


    console.log(
        'ROUTE CLOSED BECAUSE TARGET LIVE ENDED'
    );

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


    if(
        !live ||
        !live.session_id
    ){

        showLiveRequiredNotice();

        return;

    }


    currentUser =
        user;


    currentMode =
        'car';


    collapsed =
        false;


    window.dispatchEvent(

        new Event(
            'ui:close-all'
        )

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


    if(!panel || !info)
        return;


    panel.classList.add(
        'route-panel--open'
    );


    openButton?.classList.remove(
        'route-open-button--show'
    );


    async function build(){

        /*
         * Пока строим маршрут,
         * проверяем что пользователь
         * всё ещё выбран.
         */

        if(!currentUser)
            return;


        info.innerHTML =
            `<div>Строим маршрут...</div>`;


        const routeTarget =
            currentUser;


        const result =
            await startRoute(

                routeTarget,

                currentMode

            );


        /*
         * Пока маршрут строился,
         * target мог завершить Live.
         *
         * Если currentUser уже очищен,
         * значит маршрут автоматически закрыт.
         */

        if(
            currentUser !== routeTarget
        ){

            return;

        }


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
        .forEach(button=>{

            button.onclick =
                async()=>{

                    if(!currentUser)
                        return;


                    document
                        .querySelectorAll(
                            '.transport-buttons button'
                        )
                        .forEach(item=>{

                            item.classList.remove(
                                'active'
                            );

                        });


                    button.classList.add(
                        'active'
                    );


                    currentMode =
                        button.dataset.mode;


                    await build();

                };

        });


    build();


    const cancelButton =
        document.querySelector(
            '#route-cancel'
        );


    if(cancelButton){

        cancelButton.onclick =
            ()=>{

                stopRoute();


                panel.classList.remove(
                    'route-panel--open'
                );


                openButton?.classList.remove(
                    'route-open-button--show'
                );


                currentUser =
                    null;


                collapsed =
                    false;

            };

    }


    if(openButton){

        openButton.onclick =
            ()=>{

                /*
                 * Повторно проверяем Live
                 */

                const live =
                    getLiveState();


                if(
                    !live ||
                    !live.session_id
                ){

                    showLiveRequiredNotice();


                    panel.classList.remove(
                        'route-panel--open'
                    );


                    openButton.classList.remove(
                        'route-open-button--show'
                    );


                    stopRoute();


                    currentUser =
                        null;


                    return;

                }


                if(!currentUser)
                    return;


                collapsed =
                    false;


                panel.classList.add(
                    'route-panel--open'
                );


                openButton.classList.remove(
                    'route-open-button--show'
                );

            };

    }


    window.removeEventListener(
        'route:collapse',
        collapseRoute
    );


    window.addEventListener(
        'route:collapse',
        collapseRoute
    );


    function collapseRoute(){

        if(!currentUser)
            return;


        if(collapsed)
            return;


        collapsed =
            true;


        panel.classList.remove(
            'route-panel--open'
        );


        openButton?.classList.add(
            'route-open-button--show'
        );

    }

}