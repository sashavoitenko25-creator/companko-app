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

            <path
                d="
                    M12 2.75
                    L13.05 4.45

                    C13.35 4.52 13.65 4.62 13.94 4.75

                    L15.85 3.95
                    L17.55 5.65
                    L16.75 7.56

                    C16.88 7.85 16.98 8.15 17.05 8.45

                    L19.25 9.15
                    V11.55

                    L17.05 12.25

                    C16.98 12.55 16.88 12.85 16.75 13.14

                    L17.55 15.05
                    L15.85 16.75
                    L13.94 15.95

                    C13.65 16.08 13.35 16.18 13.05 16.25

                    L12 18.45

                    L10.95 16.25

                    C10.65 16.18 10.35 16.08 10.06 15.95

                    L8.15 16.75
                    L6.45 15.05
                    L7.25 13.14

                    C7.12 12.85 7.02 12.55 6.95 12.25

                    L4.75 11.55
                    V9.15
                    L6.95 8.45

                    C7.02 8.15 7.12 7.85 7.25 7.56

                    L6.45 5.65
                    L8.15 3.95
                    L10.06 4.75

                    C10.35 4.62 10.65 4.52 10.95 4.45

                    Z
                "
                stroke="currentColor"
                stroke-width="1.45"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <circle
                cx="12"
                cy="10.35"
                r="2.45"
                stroke="currentColor"
                stroke-width="1.45"
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


            locationButton.classList.add(
                'pressed'
            );


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
             * Эффект нажатия такой же,
             * как у "Найти себя"
             */

            settingsButton.classList.add(
                'pressed'
            );


            setTimeout(()=>{

                settingsButton.classList.remove(
                    'pressed'
                );

            },180);


            settings.classList.toggle(
                'open'
            );

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