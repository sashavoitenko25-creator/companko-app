import './Header.css';

import {
    ProfileButton
} from '../ProfileButton/ProfileButton';

export function Header(){

    setTimeout(initHeader,0);

    return `

<header class="header">

    <div class="header-title">
        Я тут
    </div>

    ${ProfileButton()}

</header>

`;

}

function initHeader(){

    const button =
    document.querySelector('#profile-button');

    if(!button)
        return;

    button.onclick = (event)=>{

        event.preventDefault();
        event.stopPropagation();

        window.dispatchEvent(
            new Event('profile:open')
        );

    };

}