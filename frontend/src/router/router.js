import {
    getProfile
} from '../features/profile/profileStore';

import {
    Home
} from '../pages/Home/Home';

import {
    Profile
} from '../pages/Profile/Profile';

function renderApp() {

    const app = document.querySelector('#app');

    if (!app) return;

    const profile = getProfile();

    console.log('ROUTER PROFILE:', profile);

    if (profile) {
        app.innerHTML = Home();
    } else {
        app.innerHTML = Profile();
    }

}

export function initRouter() {

    renderApp();

    // После создания/редактирования профиля
    window.addEventListener('profile:created', () => {

        console.log('PROFILE CREATED');

        location.reload();

    });

    // Открыть профиль
    window.addEventListener('profile:open', () => {

        console.log('OPEN PROFILE');

        const app = document.querySelector('#app');

        if (!app) return;

        app.innerHTML = Profile();

    });

}