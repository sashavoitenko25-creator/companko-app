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
                d="M12 15.2
                   A3.2 3.2 0 1 0 12 8.8
                   A3.2 3.2 0 0 0 12 15.2Z"
                stroke="currentColor"
                stroke-width="1.8"
            />

            <path
                d="M19.4 15
                   C19.65 15.2 19.9 15.4 20.15 15.55
                   L20.9 16.05
                   C21.25 16.3 21.35 16.75 21.15 17.15
                   L20.15 18.85
                   C19.95 19.2 19.5 19.35 19.1 19.15
                   L18.25 18.7
                   C17.75 18.4 17.2 18.45 16.75 18.75
                   C16.3 19.05 16.05 19.55 16.05 20.1
                   V21
                   C16.05 21.45 15.7 21.8 15.25 21.8
                   H13.25
                   C12.8 21.8 12.45 21.45 12.45 21
                   V20.1
                   C12.45 19.55 12.15 19.05 11.7 18.75
                   C11.25 18.45 10.7 18.4 10.2 18.7
                   L9.35 19.15
                   C8.95 19.35 8.5 19.2 8.3 18.85
                   L7.3 17.15
                   C7.1 16.75 7.2 16.3 7.55 16.05
                   L8.3 15.55
                   C8.75 15.25 9 14.75 9 14.25
                   C9 13.7 8.75 13.25 8.3 12.95
                   L7.55 12.45
                   C7.2 12.2 7.1 11.75 7.3 11.35
                   L8.3 9.65
                   C8.5 9.3 8.95 9.15 9.35 9.35
                   L10.2 9.8
                   C10.7 10.1 11.25 10.05 11.7 9.75
                   C12.15 9.45 12.45 8.95 12.45 8.4
                   V7.5
                   C12.45 7.05 12.8 6.7 13.25 6.7
                   H15.25
                   C15.7 6.7 16.05 7.05 16.05 7.5
                   V8.4
                   C16.05 8.95 16.3 9.45 16.75 9.75
                   C17.2 10.05 17.75 10.1 18.25 9.8
                   L19.1 9.35
                   C19.5 9.15 19.95 9.3 20.15 9.65
                   L21.15 11.35
                   C21.35 11.75 21.25 12.2 20.9 12.45
                   L20.15 12.95
                   C19.9 13.1 19.65 13.3 19.4 13.5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
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