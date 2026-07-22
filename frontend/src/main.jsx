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

async function initTelegram() {

    const tgUser = getTelegramUser();

    if (!tgUser) {

        console.log('NO TELEGRAM USER');

    } else {

        try {

            const profile =
                await getOrCreateTelegramUser(tgUser);

            if (profile) {

                setProfile(profile);

                console.log(
                    'TELEGRAM PROFILE',
                    profile
                );

            }

        } catch (error) {

            console.error(error);

        }

    }

    ReactDOM.createRoot(
        document.getElementById('app')
    ).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );

}

initTelegram();