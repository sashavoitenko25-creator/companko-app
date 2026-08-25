import './route.css';
import {
    startRoute,
    stopRoute
} from './routeService';
import {
    getLiveState
} from '../../store/liveStore';
import {
    getProfile
} from '../../features/profile/profileStore';
import {
    sendRouteNotification
} from '../../services/supabase/routeNotificationService';
import {
    t
} from '../../i18n';

let currentUser = null;
let currentMode = 'car';
let collapsed = false;
let noticeTimer = null;
let routeLiveListenerInitialized = false;
let routeInfoListenerInitialized = false;
let lastRouteNotifyAt = 0;

/* ========================================
   УВЕДОМЛЕНИЕ
======================================== */

export function showLiveRequiredNotice(
    text
){

    if (text == null) {
        text = t('route_live_required');
    }

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
   УВЕДОМЛЕНИЕ О МАРШРУТЕ (на сервер)
======================================== */

function notifyRouteBuilt(targetUser){

    if(!targetUser)
        return;

    const now = Date.now();
    if(now - lastRouteNotifyAt < 5000)
        return;

    lastRouteNotifyAt = now;

    const me = getProfile();
    if(!me)
        return;

    const toUserId = getUserId(targetUser);
    const fromUserId = me.user_id || me.id;

    if(!toUserId || !fromUserId)
        return;

    // не уведомляем сами себя
    if(String(toUserId) === String(fromUserId))
        return;

    const myLoc = window.myLocation || {};

    sendRouteNotification({
        to_user_id: toUserId,
        from_user_id: fromUserId,
        name: me.name || me.first_name || '',
        age: me.age || null,
        photo_url: me.photo_url || me.photo || null,
        lat: myLoc.lat ?? null,
        lng: myLoc.lng ?? null,
        gender: me.gender || null,
        activity: me.activity || null,
        relationship_status: me.relationship_status || null
    }).then(row => {
        if(row){
            console.log('Route notification sent:', row.id);
        } else {
            console.warn('Route notification not sent');
        }
    });

}

/* ========================================
   ПАНЕЛЬ МАРШРУТА
======================================== */

export function RoutePanel(){

    initRouteLiveAutoClose();
    initRouteInfoListener();

    setTimeout(() => {
        updateRoutePanelTexts();
        window.addEventListener(
            'language:changed',
            updateRoutePanelTexts
        );
    }, 0);

    return `
<div id="route-panel" class="route-panel">
    <div class="route-panel__title" id="route-panel-title">
        ${t('route_title')}
    </div>
    <div id="route-info"></div>
    <div class="transport-buttons">
        <button data-mode="foot" id="route-mode-foot">
            ${t('route_foot')}
        </button>
        <button data-mode="bike" id="route-mode-bike">
            ${t('route_bike')}
        </button>
        <button
            data-mode="car"
            class="active"
            id="route-mode-car">
            ${t('route_car')}
        </button>
    </div>
    <button
        id="route-cancel"
        type="button">
        ${t('route_cancel')}
    </button>
</div>
<!-- =====================================
     КНОПКА СВЁРНУТОГО МАРШРУТА
===================================== -->
<button
    id="route-open-button"
    class="route-open-button"
    type="button"
    aria-label="${t('route_open')}"
    title="${t('route_open')}">
    <svg
        class="route-open-button__icon"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true">
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

function updateRoutePanelTexts(){

    const setText = (id, key) => {
        const el = document.querySelector(id);
        if (el) el.textContent = t(key);
    };

    setText('#route-panel-title', 'route_title');
    setText('#route-mode-foot', 'route_foot');
    setText('#route-mode-bike', 'route_bike');
    setText('#route-mode-car', 'route_car');
    setText('#route-cancel', 'route_cancel');

    const openBtn = document.querySelector('#route-open-button');
    if (openBtn) {
        openBtn.setAttribute('aria-label', t('route_open'));
        openBtn.setAttribute('title', t('route_open'));
    }

}

/* ========================================
   ОБНОВЛЕНИЕ ИНФО
======================================== */

function initRouteInfoListener(){

    if(routeInfoListenerInitialized)
        return;

    routeInfoListenerInitialized = true;

    window.addEventListener(
        'route:updated',
        event => {

            if(!currentUser)
                return;

            const result =
                event.detail;

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
                    📍 ${(result.distance / 1000).toFixed(1)} ${t('route_km')}
                </div>
                <div class="route-stat">
                    ⏱ ${result.duration} ${t('route_min')}
                </div>
            `;

        }
    );

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

    window.addEventListener(
        'live:stopped',
        () => {

            console.log(
                'OWN LIVE STOPPED - CLOSING ROUTE'
            );

            closeRouteAutomatically();

        }
    );

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
        'ROUTE CLOSED'
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

        info.innerHTML =
            `<div>${t('route_building')}</div>`;

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

        if(!result){
            info.innerHTML =
                t('route_failed');
            return;
        }

        info.innerHTML = `
            <div class="route-user">
                ${currentUser.name || ''}
            </div>
            <div class="route-stat">
                📍 ${(result.distance / 1000).toFixed(1)} ${t('route_km')}
            </div>
            <div class="route-stat">
                ⏱ ${result.duration} ${t('route_min')}
            </div>
        `;

        notifyRouteBuilt(routeTarget);

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
       ОТМЕНА
    ======================================== */

    const cancelButton =
        document.querySelector(
            '#route-cancel'
        );

    if(cancelButton){

        cancelButton.onclick =
            () => {

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