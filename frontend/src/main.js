import './styles/globals.css';


import {
    initTelegram
} from './services/telegram/telegramService';


import {
    setUser
} from './store/userStore';


import {
    initRouter
} from './router/router';





const telegramUser =
initTelegram();



if(telegramUser){


    setUser(

        {

            telegram_id:
            telegramUser.id,


            first_name:
            telegramUser.first_name,


            photo_url:
            telegramUser.photo_url,


            language_code:
            telegramUser.language_code


        }

    );


}




initRouter();