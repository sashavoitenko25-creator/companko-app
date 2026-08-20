import './BottomBar.css';

import {
    centerOnMyLocation
} from '../services/map/locationControlService';


export function BottomBar(){

    setTimeout(
        initBottomBar,
        0
    );


    return `

<div class="bottom-bar">


    <!-- НАЙТИ СЕБЯ -->

    <button
        class="bottom-button"
        id="my-location-button"
        aria-label="Найти себя">

        <svg
            class="location-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">

            <path
                d="M12 21C12 21 19 14.8 19 9.5C19 5.91 15.866 3 12 3C8.134 3 5 5.91 5 9.5C5 14.8 12 21 12 21Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <circle
                cx="12"
                cy="9.5"
                r="2.4"
                stroke="currentColor"
                stroke-width="1.8"
            />

        </svg>

    </button>


    <!-- LIVE -->

    <button
        class="live-button"
        id="live-button">

        <span class="live-dot"></span>

        LIVE

    </button>


    <!-- НАСТРОЙКИ -->

    <button
        class="bottom-button"
        id="settings-button"
        aria-label="Настройки">

        <svg
            class="settings-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">

            <!-- ШЕСТЕРЁНКА -->

            <path
                d="
                    M12 2.75

                    L13.15 4.55
                    C13.55 4.65 13.95 4.82 14.3 5.05

                    L16.35 4.25
                    L18.05 5.95
                    L17.25 8

                    C17.48 8.35 17.65 8.75 17.75 9.15

                    L19.55 10.3
                    V13.7

                    L17.75 14.85
                    C17.65 15.25 17.48 15.65 17.25 16

                    L18.05 18.05
                    L16.35 19.75
                    L14.3 18.95

                    C13.95 19.18 13.55 19.35 13.15 19.45

                    L12 21.25

                    L10.85 19.45
                    C10.45 19.35 10.05 19.18 9.7 18.95

                    L7.65 19.75
                    L5.95 18.05
                    L6.75 16

                    C6.52 15.65 6.35 15.25 6.25 14.85

                    L4.45 13.7
                    V10.3

                    L6.25 9.15
                    C6.35 8.75 6.52 8.35 6.75 8

                    L5.95 5.95
                    L7.65 4.25
                    L9.7 5.05

                    C10.05 4.82 10.45 4.65 10.85 4.55

                    L12 2.75
                    Z
                "
                stroke="currentColor"
                stroke-width="1.35"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <circle
                cx="12"
                cy="12"
                r="2.65"
                stroke="currentColor"
                stroke-width="1.35"
            />

        </svg>

    </button>


</div>

`;

}


function initBottomBar(){


    const locationButton =
        document.querySelector(
            '#my-location-button'
        );


    const settingsButton =
        document.querySelector(
            '#settings-button'
        );


    const liveButton =
        document.querySelector(
            '#live-button'
        );


    const settings =
        document.querySelector(
            '#settings-window'
        );


    /* =======================
       НАЙТИ СЕБЯ
    ======================= */

    if(locationButton){

        locationButton.onclick = (event)=>{

            event.preventDefault();
            event.stopPropagation();


            settings?.classList.remove(
                'open'
            );


            /*
             * Нажатие
             */

            locationButton.classList.add(
                'pressed'
            );


            /*
             * Возвращаем исходное
             * состояние
             */

            setTimeout(()=>{

                locationButton.classList.remove(
                    'pressed'
                );

            },180);


            centerOnMyLocation();

        };

    }


    /* =======================
       НАСТРОЙКИ
    ======================= */

    if(settingsButton){

        settingsButton.onclick = (event)=>{

            event.preventDefault();
            event.stopPropagation();


            if(!settings)
                return;


            /*
             * Открываем / закрываем окно
             */

            settings.classList.toggle(
                'open'
            );


            /*
             * Нажатие кнопки настроек
             * всегда кратковременное.
             * После этого она возвращается
             * в обычное состояние.
             */

            settingsButton.classList.add(
                'pressed'
            );


            setTimeout(()=>{

                settingsButton.classList.remove(
                    'pressed'
                );

            },180);

        };

    }


    /* =======================
       LIVE
    ======================= */

    if(liveButton){

        liveButton.onclick = (event)=>{

            event.preventDefault();
            event.stopPropagation();


            settings?.classList.remove(
                'open'
            );

        };

    }


    /* =======================
       КЛИК ПО ПУСТОМУ МЕСТУ
    ======================= */

    document.addEventListener(
        'click',
        (event)=>{

            if(!settings)
                return;


            if(
                !settings.contains(
                    event.target
                ) &&
                !settingsButton?.contains(
                    event.target
                )
            ){

                settings.classList.remove(
                    'open'
                );

            }

        }
    );


    /* =======================
       ЛЮБАЯ ДРУГАЯ КНОПКА
    ======================= */

    document.addEventListener(
        'click',
        (event)=>{

            const target =
                event.target.closest(
                    'button'
                );


            if(!target)
                return;


            if(
                target !== settingsButton &&
                !settings?.contains(
                    target
                )
            ){

                settings?.classList.remove(
                    'open'
                );

            }

        }
    );

}