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

            <div class="header-brand__dot"></div>

        </div>

        <div class="header-brand__text">

            <div class="header-brand__title">

                Я тут

            </div>

            <div class="header-brand__subtitle">

                онлайн рядом

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