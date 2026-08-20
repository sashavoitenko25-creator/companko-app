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

            <!-- КРУГЛАЯ ТОНКАЯ ШЕСТЕРЁНКА -->

            <path
                d="
                    M12 2.8

                    L13.15 4.45
                    C13.55 4.55 13.95 4.72 14.3 4.95

                    L16.25 4.25
                    L17.75 5.75
                    L17.05 7.7

                    C17.28 8.05 17.45 8.45 17.55 8.85

                    L19.2 10
                    V14

                    L17.55 15.15
                    C17.45 15.55 17.28 15.95 17.05 16.3

                    L17.75 18.25
                    L16.25 19.75
                    L14.3 19.05

                    C13.95 19.28 13.55 19.45 13.15 19.55

                    L12 21.2

                    L10.85 19.55
                    C10.45 19.45 10.05 19.28 9.7 19.05

                    L7.75 19.75
                    L6.25 18.25
                    L6.95 16.3

                    C6.72 15.95 6.55 15.55 6.45 15.15

                    L4.8 14
                    V10

                    L6.45 8.85
                    C6.55 8.45 6.72 8.05 6.95 7.7

                    L6.25 5.75
                    L7.75 4.25
                    L9.7 4.95

                    C10.05 4.72 10.45 4.55 10.85 4.45

                    L12 2.8
                    Z
                "
            />

            <!-- МАЛЕНЬКОЕ ОТВЕРСТИЕ -->

            <circle
                cx="12"
                cy="12"
                r="2.45"
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


    /* =====================================================
       НАЙТИ СЕБЯ
    ===================================================== */

    if(locationButton){

        locationButton.onclick = (event)=>{

            event.preventDefault();

            event.stopPropagation();


            /* Закрываем настройки */

            settings?.classList.remove(
                'open'
            );


            /* Небольшая анимация */

            locationButton.classList.add(
                'pressed'
            );


            setTimeout(()=>{

                locationButton.classList.remove(
                    'pressed'
                );

            },180);


            /* Центрируем карту */

            centerOnMyLocation();

        };

    }


    /* =====================================================
       НАСТРОЙКИ
    ===================================================== */

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
             * Короткий эффект нажатия.
             * После него кнопка полностью
             * возвращается в обычное состояние.
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


    /* =====================================================
       LIVE
    ===================================================== */

    if(liveButton){

        liveButton.onclick = (event)=>{

            event.preventDefault();

            event.stopPropagation();


            settings?.classList.remove(
                'open'
            );

        };

    }


    /* =====================================================
       КЛИК ПО ПУСТОМУ МЕСТУ
    ===================================================== */

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


    /* =====================================================
       ЛЮБАЯ ДРУГАЯ КНОПКА
    ===================================================== */

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