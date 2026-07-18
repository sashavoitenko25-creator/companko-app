import './SelectedUser.css';

import {
    showRoute
} from '../route/RoutePanel';

let currentUser = null;

export function SelectedUser(){

    return `

    <div
        id="selected-user"
        class="selected-user hidden">
    </div>

    `;

}

export function showUserCard(user){

    console.log('SHOW USER CARD', user);

    currentUser = user;

    const container =
        document.querySelector(
            '#selected-user'
        );

    if(!container){

        console.error(
            'selected-user container not found'
        );

        return;

    }

    container.innerHTML = `

    <div class="selected-user__avatar">

        <img
            src="${
                user.photo ||
                'https://i.pravatar.cc/150'
            }"
        >

    </div>

    <div class="selected-user__content">

        <div class="selected-user__name">

            ${user.name || 'Гость'}
            ${user.age ? ', ' + user.age : ''}

        </div>

        <div class="selected-user__activity">

            ${user.icon || '🔥'}
            ${user.activity || 'LIVE'}

        </div>

        <div class="selected-user__distance">

            📍 ${user.distance || 0} м

        </div>

    </div>

    <button
        class="selected-user__route">

        ➜

    </button>

    `;

    container.classList.remove('hidden');

    const routeButton =
        container.querySelector(
            '.selected-user__route'
        );

    if(routeButton){

        routeButton.onclick = ()=>{

            if(currentUser){

                console.log(
                    'START ROUTE',
                    currentUser
                );

                showRoute(currentUser);

            }

        };

    }

}

export function hideUserCard(){

    const container =
        document.querySelector(
            '#selected-user'
        );

    if(container){

        container.classList.add(
            'hidden'
        );

    }

    currentUser = null;

}