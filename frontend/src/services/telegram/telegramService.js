/* =========================================================
   GET TELEGRAM USER
========================================================= */

export function getTelegramUser(){

    const tg =
        window.Telegram?.WebApp;


    if(!tg){

        console.warn(
            'Telegram WebApp not found'
        );

        return null;

    }


    tg.ready();


    const user =
        tg.initDataUnsafe?.user;


    if(!user){

        console.warn(
            'Telegram user empty'
        );

        return null;

    }


    return {

        telegram_id:
            Number(user.id),

        first_name:
            user.first_name || '',

        last_name:
            user.last_name || '',

        username:
            user.username || '',

        photo_url:
            user.photo_url || '',

        language_code:
            user.language_code || 'ru'

    };

}


/* =========================================================
   INIT TELEGRAM
========================================================= */

export function initTelegram(){

    const tg =
        window.Telegram?.WebApp;


    if(!tg){

        console.warn(
            'Telegram WebApp unavailable'
        );

        return null;

    }


    tg.ready();

    tg.expand();


    /*
     * Инициализируем LocationManager
     * заранее.
     */

    if(
        tg.LocationManager &&
        !tg.LocationManager.isInited
    ){

        tg.LocationManager.init(

            ()=>{

                console.log(
                    'TELEGRAM LOCATION MANAGER READY'
                );

            }

        );

    }


    return tg;

}