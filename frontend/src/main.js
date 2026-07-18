import React from 'react';

import ReactDOM from 'react-dom/client';


import App from './App';


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


    const tgUser =
        getTelegramUser();



    if(!tgUser)
        return;



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
            'Telegram user error',
            error
        );


    }


}




initTelegramUser();




ReactDOM.createRoot(

    document.getElementById('root')

)

.render(

    <React.StrictMode>

        <App/>

    </React.StrictMode>

);