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
        id="my-location-button">

        <svg
            class="location-icon"
            viewBox="0 0 24 24"
            fill="none">

            <circle
                cx="12"
                cy="12"
                r="4.5"
                stroke="white"
                stroke-width="2"/>

            <circle
                cx="12"
                cy="12"
                r="1.8"
                fill="white"/>

            <path
                d="M12 2V5"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"/>

            <path
                d="M12 19V22"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"/>

            <path
                d="M2 12H5"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"/>

            <path
                d="M19 12H22"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"/>

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
        id="settings-button">

        ⚙

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