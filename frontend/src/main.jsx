import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';


import {
    initTelegram,
    getTelegramUser
} from './services/telegram/telegramService';


import {
    getOrCreateTelegramUser
} from './services/supabase/telegramUserService';


import {
    setProfile
} from './features/profile/profileStore';



async function initApp(){

    /*
     * Telegram запускаем ПЕРВЫМ
     */

    const tg =
        initTelegram();


    console.log(
        'TELEGRAM:',
        tg
    );


    /*
     * Получаем пользователя
     */

    const tgUser =
        getTelegramUser();


    if(tgUser){

        try{

            const profile =
                await getOrCreateTelegramUser(
                    tgUser
                );


            if(profile){

                setProfile(
                    profile
                );

            }

        }
        catch(error){

            console.error(
                'TELEGRAM PROFILE ERROR:',
                error
            );

        }

    }


    /*
     * Запускаем React
     */

    ReactDOM.createRoot(

        document.getElementById('app')

    ).render(

        <App />

    );

}


initApp();