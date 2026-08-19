import './Header.css';

import {
    ProfileButton
}
from '../ProfileButton/ProfileButton';

import {
    getOnlineCount
}
from '../../services/supabase/liveService';


export function Header(){

    setTimeout(
        initHeader
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
                    Онлайн
                </span>

            </div>

        </div>

    </div>

    ${ProfileButton()}

</header>

`;

}


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

}


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


        status.innerHTML =
            count > 0
                ? `Онлайн • ${count}`
                : 'Онлайн';

    }

    catch(error){

        console.error(error);

    }

}