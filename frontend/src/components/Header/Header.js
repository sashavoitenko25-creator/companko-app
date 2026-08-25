import './Header.css';

import {
    ProfileButton
} from '../ProfileButton/ProfileButton';

import {
    Notifications
} from '../Notifications/Notifications';

import {
    getOnlineCount
} from '../../services/supabase/liveService';

import {
    t
} from '../../i18n';

export function Header(){

    setTimeout(
        initHeader,
        0
    );

    return `
<header class="header">

    <div class="header-brand">

        <div class="header-brand__logo">

            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
            >

                <path
                    d="M12 22C12 22 5 15.5 5 10C5 6.134 8.134 3 12 3C15.866 3 19 6.134 19 10C19 15.5 12 22 12 22Z"
                    fill="white"
                />

                <circle
                    cx="12"
                    cy="10"
                    r="2.5"
                    fill="#8B5CF6"
                />

            </svg>

        </div>

        <div class="header-brand__text">

            <div class="header-brand__subtitle">

                <span id="header-status">
                    ${t('online')}
                </span>

            </div>

        </div>

    </div>

    <div class="header-actions">
        ${Notifications()}
        ${ProfileButton()}
    </div>

</header>
`;

}

/* =========================================================
   INIT
========================================================= */

function initHeader(){

    document
        .querySelector('#profile-button')
        ?.addEventListener(
            'click',
            ()=>{
                window.dispatchEvent(
                    new Event(
                        'profile:open'
                    )
                );
            }
        );

    updateOnline();

    setInterval(
        updateOnline,
        1000
    );

    window.addEventListener(
        'language:changed',
        updateOnline
    );

}

/* =========================================================
   ONLINE
========================================================= */

async function updateOnline(){

    try{

        const count =
            await getOnlineCount();

        const status =
            document.querySelector(
                '#header-status'
            );

        if(!status)
            return;

        if(count > 0){

            status.innerHTML =
                `${t('online')} • ${count}`;

        }
        else{

            status.innerHTML =
                t('online');

        }

    }
    catch(error){

        console.error(
            'Online counter error:',
            error
        );

    }

}