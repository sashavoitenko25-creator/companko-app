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

let routeUpdateTimer = null;

let routeBuildInProgress = false;


/* ========================================
   УВЕДОМЛЕНИЕ
======================================== */

export function showLiveRequiredNotice(
    text = 'Чтобы проложить маршрут, запустите Live'
){

    let notice =
        document.querySelector(
            '#route-live-required-notice'
        );


    if(notice){

        clearTimeout(
            noticeTimer
        );


        const textElement =
            notice.querySelector(
                '.route-live-notice__text'
            );


        if(textElement){

            textElement.textContent =
                text;

        }


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
                ${text}
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
   ОСТАНОВКА АВТООБНОВЛЕНИЯ
======================================== */

function stopRouteAutoUpdate(){

    if(routeUpdateTimer){

        clearInterval(
            routeUpdateTimer
        );

        routeUpdateTimer = null;

    }

}


/* ========================================
   ЗАПУСК АВТООБНОВЛЕНИЯ
======================================== */

function startRouteAutoUpdate(){

    stopRouteAutoUpdate();


    routeUpdateTimer =
        setInterval(
            () => {

                updateRoute();

            },

            2000

        );

}


/* ========================================
   ДИНАМИЧЕСКОЕ ОБНОВЛЕНИЕ МАРШРУТА
======================================== */

async function updateRoute(){

    if(!currentUser)
        return;


    if(routeBuildInProgress)
        return;


    const live =
        getLiveState();


    if(
        !live ||
        !live.session_id
    ){

        stopRouteAutoUpdate();

        return;

    }


    routeBuildInProgress = true;


    try{

        const routeTarget =
            currentUser;


        const result =
            await startRoute(

                routeTarget,

                currentMode

            );


        if(
            currentUser !== routeTarget
        ){

            return;

        }


        if(!result)
            return;


        const info =
            document.querySelector(
                '#route-info'
            );


        if(!info)
            return;


        info.innerHTML = `

            <div class="route-user">

                ${currentUser.name || ''}

            </div>

            <div class="route-stat">

                📍 ${(result.distance / 1000).toFixed(1)} км

            </div>

            <div class="route-stat">

                ⏱ ${result.duration} мин

            </div>

        `;

    }

    finally{

        routeBuildInProgress = false;

    }

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

        event => {

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


    /*
     * Если Live-сервис отправляет
     * обновление координат пользователя,
     * сразу обновляем currentUser.
     */

    window.addEventListener(

        'live:user-updated',

        event => {

            if(!currentUser)
                return;


            const updatedUser =
                event.detail?.user ||
                event.detail;


            if(!updatedUser)
                return;


            const updatedId =
                getUserId(
                    updatedUser
                );


            const currentId =
                getUserId(
                    currentUser
                );


            if(!updatedId || !currentId)
                return;


            if(
                String(updatedId) !==
                String(currentId)
            ){

                return;

            }


            if(
                updatedUser.lat != null &&
                updatedUser.lng != null
            ){

                currentUser = {

                    ...currentUser,

                    lat:
                        updatedUser.lat,

                    lng:
                        updatedUser.lng

                };

            }

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

    stopRouteAutoUpdate();


    const panel =
        document.querySelector(
            '#route-panel'
        );


    const openButton =
        document.querySelector(
            '#route-open-button'
        );


    stopRoute();


    panel?.classList.remove(
        'route-panel--open'
    );


    openButton?.classList.remove(
        'route-open-button--show'
    );


    currentUser =
        null;


    collapsed =
        false;


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

    const live =
        getLiveState();


    if(
        !live ||
        !live.session_id
    ){

        showLiveRequiredNotice();

        return;

    }


    stopRouteAutoUpdate();


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


    /* ========================================
       ПОСТРОЕНИЕ МАРШРУТА
    ======================================== */

    async function build(){

        if(!currentUser)
            return;


        if(routeBuildInProgress)
            return;


        routeBuildInProgress = true;


        info.innerHTML =
            `<div>Строим маршрут...</div>`;


        const routeTarget =
            currentUser;


        try{

            const result =
                await startRoute(

                    routeTarget,

                    currentMode

                );


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

                    ${currentUser.name || ''}

                </div>

                <div class="route-stat">

                    📍 ${(result.distance / 1000).toFixed(1)} км

                </div>

                <div class="route-stat">

                    ⏱ ${result.duration} мин

                </div>

            `;

        }

        finally{

            routeBuildInProgress = false;

        }

    }


    /* ========================================
       ТРАНСПОРТ
    ======================================== */

    document
        .querySelectorAll(
            '.transport-buttons button'
        )
        .forEach(button => {

            button.onclick =
                async () => {

                    if(!currentUser)
                        return;


                    document
                        .querySelectorAll(
                            '.transport-buttons button'
                        )
                        .forEach(item => {

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


    /* ========================================
       ПЕРВАЯ ПОСТРОЙКА
    ======================================== */

    build();


    /* ========================================
       ЗАПУСК АВТООБНОВЛЕНИЯ
    ======================================== */

    startRouteAutoUpdate();


    /* ========================================
       ОТМЕНА
    ======================================== */

    const cancelButton =
        document.querySelector(
            '#route-cancel'
        );


    if(cancelButton){

        cancelButton.onclick =
            () => {

                stopRouteAutoUpdate();

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


    /* ========================================
       ОТКРЫТЬ СВЁРНУТЫЙ МАРШРУТ
    ======================================== */

    if(openButton){

        openButton.onclick =
            () => {

                const live =
                    getLiveState();


                if(
                    !live ||
                    !live.session_id
                ){

                    showLiveRequiredNotice();


                    stopRouteAutoUpdate();


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


    /* ========================================
       СВОРАЧИВАНИЕ
    ======================================== */

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