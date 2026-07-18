import {
    getTelegramUser
}
from './services/telegram/telegramService';


import {
    getOrCreateTelegramUser
}
from './services/supabase/telegramUserService';


import {
    setProfile
}
from './features/profile/profileStore';



const tgUser =
    getTelegramUser();



if(tgUser){


    getOrCreateTelegramUser(
        tgUser
    )
    .then(profile=>{


        if(profile){


            setProfile(
                profile
            );


            console.log(
                'TELEGRAM PROFILE',
                profile
            );


        }


    });


}




ReactDOM.createRoot(
    document.getElementById('root')
)
.render(
    <App/>
);