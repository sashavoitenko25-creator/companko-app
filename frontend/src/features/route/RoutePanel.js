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

        <button
            data-mode="car"
            class="active">
            🚗 Машина
        </button>

    </div>


    <button
        id="route-cancel"
        type="button">

        Отменить

    </button>

</div>


<!-- =====================================
     КНОПКА СВЁРНУТОГО МАРШРУТА
===================================== -->

<button
    id="route-open-button"
    class="route-open-button"
    type="button"
    aria-label="Открыть маршрут"
    title="Открыть маршрут">


    <svg
        class="route-open-button__icon"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true">


        <!--
            Внешняя стрелка.
            Смотрит строго вверх.
        -->

        <path
            class="route-open-button__arrow"
            d="
                M16 4
                L25 15
                H20.2
                V27
                H11.8
                V15
                H7
                Z
            "
            fill="none"
            stroke="currentColor"
            stroke-width="2.1"
            stroke-linejoin="round"
            stroke-linecap="round"
        />


        <!--
            Внутренняя часть стрелки.
            Без центральной полоски.
        -->

        <path
            class="route-open-button__arrow-inner"
            d="
                M16 7.2
                L21.1 13.4
                H18.1
                V24
                H13.9
                V13.4
                H10.9
                Z
            "
            fill="currentColor"
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
     * Обновление координат цели.
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
       АВТООБНОВЛЕНИЕ
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