import './route.css';

import {
    stopRoute,
    startRoute
} from './routeService';

export function RoutePanel() {
    return `
    <div
        id="route-panel"
        class="route-panel"
    >

        <div class="route-panel__title">
            Маршрут
        </div>

        <div id="route-info">
        </div>

        <button id="route-cancel">
            Отменить
        </button>

    </div>
    `;
}

export function showRoute(user) {

    // =========================
    // СНАЧАЛА ЗАКРЫВАЕМ КАРТОЧКУ
    // =========================
    window.dispatchEvent(
        new Event('ui:close-all')
    );

    const panel = document.querySelector('#route-panel');
    const info = document.querySelector('#route-info');

    if (!panel || !info) return;

    info.innerHTML = `
        <div>
            ${user.name || 'Гость'}
        </div>

        <div>
            📍 ${user.distance || 0} м
        </div>

        <div>
            🚶 ~5 минут
        </div>
    `;

    panel.classList.add('route-panel--open');

    // запускаем маршрут на карте
    startRoute(user);

    const cancelButton = document.querySelector('#route-cancel');

    if (cancelButton) {
        cancelButton.onclick = () => {
            panel.classList.remove('route-panel--open');
            stopRoute();
        };
    }
}