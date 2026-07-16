let telegramUser = null;



export function initTelegram(){


    if(
        !window.Telegram ||
        !window.Telegram.WebApp
    ){

        console.warn(
            "Telegram WebApp not detected"
        );

        return null;

    }



    const tg =
    window.Telegram.WebApp;



    tg.ready();


    tg.expand();



    telegramUser =
    tg.initDataUnsafe?.user || null;



    return telegramUser;

}





export function getTelegramUser(){

    return telegramUser;

}





export function getTelegramLanguage(){


    if(!telegramUser)
        return "ru";


    return (
        telegramUser.language_code
        ||
        "ru"
    );

}