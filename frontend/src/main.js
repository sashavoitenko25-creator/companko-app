import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';

import {
    getTelegramUser
} from './services/telegram/telegramService';


import {
    getOrCreateTelegramUser
} from './services/supabase/telegramUserService';


import {
    setProfile
} from './features/profile/profileStore';



async function initTelegramUser(){


    const tgUser = getTelegramUser();



    if(!tgUser){

        console.log(
            'Telegram user not detected'
        );

        return;

    }



    try{


        const profile =
            await getOrCreateTelegramUser(
                tgUser
            );



        if(profile){


            setProfile(
                profile
            );


            console.log(
                'TELEGRAM PROFILE',
                profile
            );


        }


    }

    catch(error){


        console.error(
            'Telegram profile error',
            error
        );


    }


}





initTelegramUser();





ReactDOM
.createRoot(
    document.getElementById('root')
)
.render(

    <React.StrictMode>

        <App />

    </React.StrictMode>

);