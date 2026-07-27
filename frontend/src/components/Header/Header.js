import './Header.css';

import {
    ProfileButton
}
from '../ProfileButton/ProfileButton';

export function Header(){

    setTimeout(initHeader);

    return `

<header class="header">

    <div class="header-brand">

        <div class="header-brand__logo">

            <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none">

                <path
                d="M12 22C12 22 5 15.5 5 10C5 6.134 8.134 3 12 3C15.866 3 19 6.134 19 10C19 15.5 12 22 12 22Z"
                fill="white"/>

                <circle
                cx="12"
                cy="10"
                r="2.8"
                fill="#8B5CF6"/>

            </svg>

        </div>

        <div class="header-brand__text">

            <div class="header-brand__title">

                Я тут

            </div>

            <div class="header-brand__subtitle">

                <span>
                    Люди рядом
                </span>

                <span
                class="header-online-dot"></span>

                <span
                id="header-online-count">

                    0 онлайн

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

}

export function setHeaderOnline(count){

    const element =
    document.querySelector(
        '#header-online-count'
    );

    if(!element)
        return;

    if(count<=0){

        element.innerHTML='';

        document
        .querySelector('.header-online-dot')
        ?.classList.add('hidden');

    }

    else{

        element.innerHTML=
        `${count} онлайн`;

        document
        .querySelector('.header-online-dot')
        ?.classList.remove('hidden');

    }

}