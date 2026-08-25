import {
    getProfile
} from '../profile/profileStore';

import {
    getLiveState
} from '../../store/liveStore';

import {
    stopLiveSession
} from '../../services/supabase/liveSessionService';

import {
    t
} from '../../i18n';

let timer = null;

export function MyLiveCard(){

    const profile = getProfile();
    const live = getLiveState();

    if(!profile || !live.activity)
        return '';

    setTimeout(()=>{
        startTimer();
        initStopButton();
    },0);

    const activityKey = normalizeActivity(live.activity);
    const activityLabel = getActivityLabel(activityKey, live.activity);
    const activityIcon = getIcon(activityKey);

    return `
    <div class="my-live-card">

        <img
        class="my-live-card__photo"
        src="${
            profile.photo_url ||
            'https://i.pravatar.cc/150'
        }"
        >

        <div class="my-live-card__info">

            <div class="my-live-card__name">
                ${
                    profile.name ||
                    t('guest')
                }
            </div>

            <div class="my-live-card__activity">
                ${activityIcon}
                ${activityLabel}
            </div>

            <div
            id="live-timer"
            class="my-live-card__timer">
                ${t('live')}
            </div>

            <button
            id="stop-live"
            class="stop-live-button">
                ${t('end_live')}
            </button>

        </div>

    </div>
    `;

}

function initStopButton(){

    const button = document.querySelector(
        '#stop-live'
    );

    if(!button)
        return;

    button.onclick = async()=>{

        const live = getLiveState();

        if(!live.session_id)
        {
            console.warn(
                'No live session id'
            );
            return;
        }

        try{

            await stopLiveSession(
                live.session_id
            );

            window.dispatchEvent(
                new Event(
                    'live:stopped'
                )
            );

        }
        catch(error){

            console.error(
                'Stop LIVE error',
                error
            );

        }

    };

}

function startTimer(){

    const timerElement = document.querySelector(
        '#live-timer'
    );

    if(!timerElement)
        return;

    if(timer)
        clearInterval(timer);

    let seconds =
    (
        getLiveState().duration || 60
    )
    *
    60;

    const update = ()=>{

        const minutes = Math.floor(
            seconds / 60
        );

        const sec = seconds % 60;

        timerElement.innerHTML =
        `${t('live_timer')} ${minutes}:${
            sec
            .toString()
            .padStart(2,'0')
        }`;

        seconds--;

        if(seconds < 0){
            clearInterval(timer);
        }

    };

    update();

    timer = setInterval(
        update,
        1000
    );

}

function normalizeActivity(activity){

    if (!activity) return 'beer';

    const value = String(activity).toLowerCase().trim();

    if (
        value === 'beer' ||
        value === 'alcohol' ||
        value.includes('алког') ||
        value.includes('выпить')
    ) {
        return 'beer';
    }

    if (
        value === 'coffee' ||
        value.includes('кофе') ||
        value.includes('кав')
    ) {
        return 'coffee';
    }

    if (
        value === 'walk' ||
        value === 'walking' ||
        value.includes('гуля')
    ) {
        return 'walk';
    }

    if (
        value === 'chat' ||
        value === 'talking' ||
        value.includes('общ') ||
        value.includes('спіл')
    ) {
        return 'chat';
    }

    return 'beer';

}

function getActivityLabel(key, fallback){

    const map = {
        beer: t('activity_name_beer'),
        coffee: t('activity_name_coffee'),
        walk: t('activity_name_walk'),
        chat: t('activity_name_chat')
    };

    return map[key] || fallback || t('activity_default');

}

function getIcon(activityKey){

    const icons = {
        beer: '🍻',
        coffee: '☕',
        walk: '🚶',
        chat: '💬',
    };

    return icons[activityKey] || '🔥';

}