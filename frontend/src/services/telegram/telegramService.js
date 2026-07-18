export function getTelegramUser(){

    const tg = window.Telegram?.WebApp;


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

        telegram_id:user.id,

        first_name:
            user.first_name || '',

        last_name:
            user.last_name || '',

        username:
            user.username || '',

        photo_url:
            user.photo_url || ''

    };


}