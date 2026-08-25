import './UserCard.css';

import {
    t
} from '../../i18n';


export function UserCard(user){

    const minutes =
        user.duration || 60;


    const distance =
        user.distance || 0;


    return `

<div class="user-card">


    <div class="user-card__top">


        <div class="user-card__avatar">

            <img
                src="${
                    user.photo ||
                    user.photo_url ||
                    'https://i.pravatar.cc/150'
                }"
            >

        </div>


        <div class="user-card__main">


            <h3>

                ${
                    user.name ||
                    t('guest')
                }

                ${
                    user.age
                    ?
                    ', ' + user.age
                    :
                    ''
                }

            </h3>


            <div class="user-card__activity">

                ${
                    user.icon ||
                    '🔥'
                }

                ${
                    user.activity ||
                    'LIVE'
                }

            </div>


        </div>


    </div>


    <div class="user-card__info">


        <div>

            📍

            ${distance}

            ${t('meters')}

        </div>


        <div>

            🔥 LIVE

        </div>


        <div>

            ⏱ ${t('active_for')}

            ${minutes}

            ${t('minutes')}

        </div>


    </div>


    <button
        class="user-card__route"
        data-user-id="${user.id || user.user_id}"
    >

        🧭 ${t('build_route')}

    </button>


</div>

`;

}