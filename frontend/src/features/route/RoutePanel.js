import './route.css';

import {
    startRoute,
    stopRoute
} from './routeService';

export function RoutePanel() {

    return `

<div id="route-panel" class="route-panel">

    <div class="route-panel__title">
        Маршрут
    </div>

    <div id="route-info"></div>

    <div class="transport-buttons">

        <button data-mode="foot">
            🚶 Пешком
        </button>

        <button data-mode="bike">
            🚲 Велосипед
        </button>

        <button data-mode="car" class="active">
            🚗 Машина
        </button>

    </div>

    <button id="route-cancel">
        Отменить
    </button>

</div>

`;

}

export function showRoute(user) {

    window.dispatchEvent(
        new Event('ui:close-all')
    );

    const panel =
        document.querySelector('#route-panel');

    const info =
        document.querySelector('#route-info');

    if (!panel || !info)
        return;

    panel.classList.add('route-panel--open');

    let mode = 'car';

    async function build() {

        info.innerHTML = `
            <div>Строим маршрут...</div>
        `;

        const result =
            await startRoute(user, mode);

        if (!result) {

            info.innerHTML =
                'Не удалось построить маршрут';

            return;
        }

        info.innerHTML = `

<div class="route-user">
${user.name}
</div>

<div>
📍 ${(result.distance / 1000).toFixed(1)} км
</div>

<div>
⏱ ${result.duration} мин
</div>

`;

    }

    document
        .querySelectorAll('.transport-buttons button')
        .forEach(button => {

            button.onclick = async () => {

                document
                    .querySelectorAll('.transport-buttons button')
                    .forEach(b => b.classList.remove('active'));

                button.classList.add('active');

                mode = button.dataset.mode;

                await build();

            };

        });

    build();

    document
        .querySelector('#route-cancel')
        .onclick = () => {

            panel.classList.remove(
                'route-panel--open'
            );

            stopRoute();

        };

}