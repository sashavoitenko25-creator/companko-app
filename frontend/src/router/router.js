import {
    getProfile
} from '../features/profile/profileStore';


import {
    Home
} from '../pages/Home/Home';


import {
    Profile
} from '../pages/Profile/Profile';


function renderApp() {

    const app =
        document.querySelector(
            '#app'
        );

    if (!app) return;


    const profile =
        getProfile();


    console.log(
        'ROUTER PROFILE:',
        profile
    );


    if (profile) {

        app.innerHTML =
            Home();

    }

    else {

        app.innerHTML =
            Profile();

    }

}


export function initRouter() {

    renderApp();


    /* ========================================
       ПОСЛЕ СОЗДАНИЯ / СОХРАНЕНИЯ
    ======================================== */

    window.addEventListener(
        'profile:created',
        () => {

            console.log(
                'PROFILE CREATED'
            );


            location.reload();

        }
    );


    /* ========================================
       ОТКРЫТЬ ПРОФИЛЬ
    ======================================== */

    window.addEventListener(
        'profile:open',
        () => {

            console.log(
                'OPEN PROFILE'
            );


            const app =
                document.querySelector(
                    '#app'
                );


            if (!app) return;


            /*
             * Если окно уже открыто —
             * повторно его не создаём.
             */

            if (
                document.querySelector(
                    '.profile-modal'
                )
            ) {

                return;

            }


            /*
             * Home остаётся на месте.
             *
             * Profile добавляется поверх
             * карты как модальное окно.
             */

            app.insertAdjacentHTML(
                'beforeend',
                Profile()
            );

        }
    );


    /* ========================================
       ЗАКРЫТЬ РЕДАКТИРОВАНИЕ
    ======================================== */

    window.addEventListener(
        'profile:close',
        () => {

            console.log(
                'CLOSE PROFILE'
            );


            const modal =
                document.querySelector(
                    '.profile-modal'
                );


            if (!modal) return;


            modal.remove();

        }
    );

}