import {
    getProfile,
    clearProfile,
    setProfile
} from '../features/profile/profileStore';


import {
    Home
} from '../pages/Home/Home';


import {
    Profile
} from '../pages/Profile/Profile';


import {
    getTelegramUser
} from '../services/telegram/telegramService';


import {
    getProfileByUserId
} from '../services/supabase/profileService';


let routerInitialized = false;


/* ========================================
   RENDER APP
======================================== */

async function renderApp(){

    const app =
        document.querySelector(
            '#app'
        );


    if(!app)
        return;


    /*
     * Сначала получаем Telegram user.
     */

    const tgUser =
        getTelegramUser();


    /*
     * Если Telegram user пока недоступен,
     * используем старую локальную логику.
     */

    if(!tgUser){

        const localProfile =
            getProfile();


        console.log(
            'ROUTER PROFILE:',
            localProfile
        );


        if(localProfile){

            app.innerHTML =
                Home();

        }

        else{

            app.innerHTML =
                Profile();

        }


        return;

    }


    /*
     * Telegram ID текущего пользователя.
     */

    const telegramId =
        Number(
            tgUser.telegram_id
        );


    /*
     * Сначала смотрим локальный профиль.
     */

    const localProfile =
        getProfile();


    console.log(
        'ROUTER LOCAL PROFILE:',
        localProfile
    );


    /*
     * Если локального профиля нет —
     * сразу показываем создание.
     */

    if(!localProfile){

        app.innerHTML =
            Profile();


        return;

    }


    /*
     * Проверяем профиль в Supabase.
     *
     * user_id локального профиля может быть
     * id пользователя Supabase.
     */

    try{

        const supabaseProfile =
            await getProfileByUserId(
                localProfile.user_id ||
                localProfile.id
            );


        console.log(
            'ROUTER SUPABASE PROFILE:',
            supabaseProfile
        );


        /*
         * Профиля больше нет в Supabase.
         *
         * Значит локальный профиль устарел.
         */

        if(!supabaseProfile){

            console.log(
                'PROFILE NOT FOUND IN SUPABASE → CLEAR LOCAL PROFILE'
            );


            clearProfile();


            app.innerHTML =
                Profile();


            return;

        }


        /*
         * Профиль существует.
         *
         * Обновляем локальный профиль
         * актуальными данными из Supabase.
         */

        setProfile({

            ...localProfile,

            ...supabaseProfile

        });


        console.log(
            'ROUTER PROFILE:',
            supabaseProfile
        );


        app.innerHTML =
            Home();

    }

    catch(error){

        console.error(
            'PROFILE CHECK ERROR:',
            error
        );


        /*
         * Если Supabase временно недоступен,
         * не удаляем локальный профиль.
         *
         * Оставляем старое поведение.
         */

        app.innerHTML =
            Home();

    }

}


/* ========================================
   INIT ROUTER
======================================== */

export function initRouter(){

    if(routerInitialized)
        return;


    routerInitialized =
        true;


    /*
     * Теперь renderApp асинхронный,
     * потому что проверяем Supabase.
     */

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


            if(!app)
                return;


            /*
             * Если окно уже открыто —
             * повторно его не создаём.
             */

            if(
                document.querySelector(
                    '.profile-modal'
                )
            ){

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


            if(!modal)
                return;


            modal.remove();

        }
    );

}