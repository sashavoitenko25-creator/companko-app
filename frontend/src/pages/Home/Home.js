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
    Settings,
    initSettings
} from '../../components/Settings/Settings';
import {
    SelectedUser,
    showUserCard
} from '../../features/profile/SelectedUser';
import {
    FeedbackModal,
    initFeedbackModal
} from '../../components/FeedbackModal/FeedbackModal';
import {
    LanguageModal,
    initLanguageModal
} from '../../components/LanguageModal/LanguageModal';
import {
    AdminPanel
} from '../../components/AdminPanel/AdminPanel';
import {
    initAdminPanel as initAdminComponent,
    loadFeedback
} from '../../components/AdminPanel/AdminPanel';
import {
    FilterPanel
} from '../../features/filters/FilterPanel';
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
import {
    supabase
} from '../../services/supabase/supabaseClient';
import {
    fetchMyRouteNotifications,
    subscribeRouteNotifications,
    mapRouteNotificationRow
} from '../../services/supabase/routeNotificationService';
import {
    addNotification,
    getNotifications
} from '../../store/notificationStore';
import {
    t
} from '../../i18n';

let selectedUser = null;
let initialized = false;
let exitLiveHandled = false;
let routeNotifChannel = null;

/* =========================================================
   HOME
========================================================= */

export function Home(){

    console.log(
        'HOME START'
    );

    setTimeout(
        async()=>{
            await initHomeEvents();
        },
        0
    );

    console.log(
        'HOME BEFORE RETURN'
    );

    return `
<main class="home">
${Map()}
${Header()}
${FilterPanel()}
<div id="my-live-container"></div>
${LiveModal()}
${Settings()}
${FeedbackModal()}
${LanguageModal()}
${AdminPanel()}
${RoutePanel()}
${SelectedUser()}
${BottomBar()}
</main>
`;

}

/* =========================================================
   INIT HOME EVENTS
========================================================= */

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

    initSettings();

    initFeedbackModal();

    initLanguageModal();

    initAdminPanel();

    updateLiveButton();

    initProfileButton();

    initAutoStopLiveOnExit();

    // уведомления о маршрутах
    await initRouteNotifications();

    window.addEventListener(
        'language:changed',
        ()=>{
            updateLiveButton();
        }
    );

}

/* =========================================================
   ROUTE NOTIFICATIONS (realtime + load)
========================================================= */

async function initRouteNotifications(){

    const profile = getProfile();
    if(!profile)
        return;

    const myUserId =
        profile.user_id ||
        profile.id;

    if(!myUserId)
        return;

    // загрузить уже существующие
    try{

        const rows =
            await fetchMyRouteNotifications(
                myUserId
            );

        const existingIds = new Set(
            getNotifications().map(n => n.id)
        );

        rows.forEach(row => {

            const mapped =
                mapRouteNotificationRow(row);

            if(
                mapped &&
                !existingIds.has(mapped.id)
            ){
                addNotification(mapped);
            }

        });

    }
    catch(error){

        console.error(
            'Load route notifications error',
            error
        );

    }

    // realtime: новые
    if(routeNotifChannel){
        try{
            supabase.removeChannel(
                routeNotifChannel
            );
        }
        catch(e){}
        routeNotifChannel = null;
    }

    routeNotifChannel =
        subscribeRouteNotifications(
            myUserId,
            (row) => {

                const mapped =
                    mapRouteNotificationRow(
                        row
                    );

                if(!mapped)
                    return;

                addNotification(mapped);

            }
        );

}

/* =========================================================
   RESTORE LIVE
========================================================= */

async function restoreMyLive(){

    try{

        const profile =
            getProfile();

        if(!profile)
            return;

        const userId =
            profile.user_id ||
            profile.id;

        if(!userId)
            return;

        const session =
            await restoreActiveLive(
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

            setTimeout(()=>{
                updateLiveButton();
            },100);

        }
        else{

            clearLiveState();

            setTimeout(()=>{
                updateLiveButton();
            },100);

        }

    }
    catch(error){

        console.error(
            'Restore LIVE error',
            error
        );

    }

}

/* =========================================================
   AUTO STOP LIVE ON APP EXIT
========================================================= */

function initAutoStopLiveOnExit(){

    if(
        window.__liveExitHandlersInitialized
    ){
        return;
    }

    window.__liveExitHandlersInitialized =
        true;

    window.addEventListener(
        'pagehide',
        ()=>{
            stopLiveOnExit();
        }
    );

    window.addEventListener(
        'beforeunload',
        ()=>{
            stopLiveOnExit();
        }
    );

}

/* =========================================================
   STOP LIVE ON EXIT
========================================================= */

function stopLiveOnExit(){

    if(exitLiveHandled)
        return;

    const live =
        getLiveState();

    if(
        !live ||
        !live.session_id
    ){
        return;
    }

    const sessionId =
        live.session_id;

    const profile =
        getProfile();

    const userId =
        profile?.user_id ||
        profile?.id;

    if(!userId)
        return;

    exitLiveHandled = true;

    clearLiveState();

    window.dispatchEvent(
        new Event(
            'live:stopped'
        )
    );

    try{

        const url =
            import.meta.env.VITE_SUPABASE_URL;

        const key =
            import.meta.env.VITE_SUPABASE_ANON_KEY;

        if(
            url &&
            key
        ){

            fetch(
                `${url}/rest/v1/live_sessions?id=eq.${encodeURIComponent(sessionId)}`,
                {
                    method:'PATCH',
                    headers:{
                        apikey:key,
                        Authorization:
                            `Bearer ${key}`,
                        'Content-Type':
                            'application/json',
                        Prefer:
                            'return=minimal'
                    },
                    body:JSON.stringify({
                        status:
                            'finished'
                    }),
                    keepalive:true
                }
            ).catch(error=>{
                console.warn(
                    'AUTO STOP LIVE REQUEST ERROR',
                    error
                );
            });

        }

    }
    catch(error){

        console.warn(
            'AUTO STOP LIVE ERROR',
            error
        );

    }

    try{

        stopLiveSession(
            sessionId
        ).catch(error=>{
            console.warn(
                'AUTO STOP LIVE SERVICE ERROR',
                error
            );
        });

    }
    catch(error){

        console.warn(
            'AUTO STOP LIVE SERVICE CALL ERROR',
            error
        );

    }

}

/* =========================================================
   LIVE BUTTON
========================================================= */

function initLiveButton(){

    const button =
        document.querySelector(
            '#live-button'
        );

    if(!button)
        return;

    button.onclick =
        async ()=>{

            const live =
                getLiveState();

            if(live.session_id){
                await stopMyLive();
                return;
            }

            const modal =
                document.querySelector(
                    '#live-modal'
                );

            if(modal){
                modal.classList.add(
                    'open'
                );
            }

        };

}

/* =========================================================
   STOP MY LIVE
========================================================= */

async function stopMyLive(){

    const live =
        getLiveState();

    if(!live.session_id)
        return;

    const sessionId =
        live.session_id;

    try{

        await stopLiveSession(
            sessionId
        );

    }
    catch(error){

        console.error(
            'STOP LIVE ERROR',
            error
        );

        return;

    }

    clearLiveState();

    window.dispatchEvent(
        new Event(
            'live:stopped'
        )
    );

    updateLiveButton();

}

/* =========================================================
   LIVE BUTTON STATE
========================================================= */

function updateLiveButton(){

    const button =
        document.querySelector(
            '#live-button'
        );

    if(!button)
        return;

    const live =
        getLiveState();

    if(live.session_id){

        button.innerHTML = `
            ${t('stop_live')}
        `;

        button.classList.add(
            'stop-live'
        );

    }
    else{

        button.innerHTML = `
            <span class="live-dot"></span>
            ${t('live')}
        `;

        button.classList.remove(
            'stop-live'
        );

    }

}

/* =========================================================
   LIVE EVENTS
========================================================= */

function initLiveEvents(){

    console.log(
        'LIVE EVENTS INIT'
    );

    document
        .querySelectorAll(
            '.live-option'
        )
        .forEach(button=>{

            button.onclick =
                ()=>{

                    document
                        .querySelectorAll(
                            '.live-option'
                        )
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
        .querySelectorAll(
            '.time-options button'
        )
        .forEach(button=>{

            button.onclick =
                ()=>{

                    document
                        .querySelectorAll(
                            '.time-options button'
                        )
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

    const start =
        document.querySelector(
            '#start-live'
        );

    if(start){

        start.onclick =
            async()=>{

                try{

                    const live =
                        getLiveState();

                    const profile =
                        getProfile();

                    if(!profile)
                        return;

                    const userId =
                        profile.user_id ||
                        profile.id;

                    const session =
                        await createLiveSession({
                            user_id:
                                userId,
                            activity:
                                live.activity,
                            duration:
                                live.duration || 60
                        });

                    setLiveSession(
                        session
                    );

                    document
                        .querySelector(
                            '#live-modal'
                        )
                        ?.classList.remove(
                            'open'
                        );

                    window.dispatchEvent(
                        new CustomEvent(
                            'live:started',
                            {
                                detail:
                                    session
                            }
                        )
                    );

                    updateLiveButton();

                    navigator.geolocation
                        .getCurrentPosition(
                            async position=>{

                                try{

                                    await sendLocation(
                                        userId,
                                        position.coords.latitude,
                                        position.coords.longitude
                                    );

                                }
                                catch(error){

                                    console.error(
                                        'SEND LIVE LOCATION ERROR',
                                        error
                                    );

                                }

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

}

/* =========================================================
   USER SELECTION
========================================================= */

function initUserSelection(){

    window.addEventListener(
        'user:selected',
        event=>{

            console.log(
                'USER SELECTED HOME',
                event.detail
            );

            selectedUser =
                event.detail;

            showUserCard(
                selectedUser
            );

        }
    );

    document.addEventListener(
        'click',
        event=>{

            if(
                event.target.classList
                    .contains(
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

/* =========================================================
   MY LIVE SELECTION
========================================================= */

function initMyLiveSelection(){

    window.addEventListener(
        'my-live:selected',
        event=>{

            const profile =
                event.detail.profile;

            const live =
                event.detail.live;

            if(!profile)
                return;

            showUserCard({
                ...profile,
                own:true,
                isLive:true,
                activity:
                    live.activity || 'LIVE',
                duration:
                    live.duration,
                expires_at:
                    live.expires_at
            });

        }
    );

}

/* =========================================================
   PROFILE BUTTON
========================================================= */

function initProfileButton(){

    const button =
        document.querySelector(
            '#profile-button'
        );

    if(!button)
        return;

    button.onclick =
        ()=>{

            window.dispatchEvent(
                new Event(
                    'profile:open'
                )
            );

        };

}

/* =========================================================
   ADMIN PANEL
========================================================= */

function initAdminPanel(){

    const profile =
        getProfile();

    if(!profile)
        return;

    const telegramId =
        Number(
            profile.telegram_id
        );

    if(
        telegramId !==
        6859689857
    ){
        return;
    }

    initAdminComponent();

    const settings =
        document.querySelector(
            '#settings-window'
        );

    const actions =
        settings?.querySelector(
            '.settings-actions'
        );

    if(!actions)
        return;

    if(
        document.querySelector(
            '#admin-open'
        )
    ){
        return;
    }

    const button =
        document.createElement(
            'button'
        );

    button.id =
        'admin-open';

    button.className =
        'settings-action';

    button.innerHTML =
        '👑 Админка';

    actions.appendChild(
        button
    );

    button.onclick =
        ()=>{

            settings.classList.remove(
                'open'
            );

            document
                .querySelector(
                    '#admin-panel'
                )
                ?.classList.add(
                    'open'
                );

            loadFeedback();

        };

}