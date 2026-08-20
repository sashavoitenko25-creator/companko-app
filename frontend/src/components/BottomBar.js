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


    <!-- =====================================================
         НАЙТИ СЕБЯ
    ====================================================== -->

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


    <!-- =====================================================
         LIVE
    ====================================================== -->

    <button
        class="live-button"
        id="live-button">

        <span class="live-dot"></span>

        LIVE

    </button>


    <!-- =====================================================
         НАСТРОЙКИ
    ====================================================== -->

    <button
        class="bottom-button"
        id="settings-button"
        aria-label="Настройки">

        <svg
            class="settings-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">

            <!--
                РОВНАЯ КРУГЛАЯ ШЕСТЕРЁНКА
                8 одинаковых зубцов
            -->

            <path
                d="
                    M12 2.8

                    L13.25 4.55
                    C13.62 4.64 13.98 4.79 14.31 4.98

                    L16.35 4.28
                    L17.72 5.65
                    L17.02 7.69

                    C17.21 8.02 17.36 8.38 17.45 8.75

                    L19.2 10
                    V14

                    L17.45 15.25
                    C17.36 15.62 17.21 15.98 17.02 16.31

                    L17.72 18.35
                    L16.35 19.72
                    L14.31 19.02

                    C13.98 19.21 13.62 19.36 13.25 19.45

                    L12 21.2

                    L10.75 19.45
                    C10.38 19.36 10.02 19.21 9.69 19.02

                    L7.65 19.72
                    L6.28 18.35
                    L6.98 16.31

                    C6.79 15.98 6.64 15.62 6.55 15.25

                    L4.8 14
                    V10

                    L6.55 8.75
                    C6.64 8.38 6.79 8.02 6.98 7.69

                    L6.28 5.65
                    L7.65 4.28
                    L9.69 4.98

                    C10.02 4.79 10.38 4.64 10.75 4.55

                    Z
                "
            />

            <!--
                МАЛЕНЬКОЕ ОТВЕРСТИЕ
                СТРОГО ПО ЦЕНТРУ
            -->

            <circle
                cx="12"
                cy="12"
                r="2.35"
            />

        </svg>

    </button>


</div>

`;

}


/* =========================================================
   INIT
========================================================= */

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

        locationButton.onclick = async (event)=>{

            event.preventDefault();

            event.stopPropagation();


            if(settings){

                settings.classList.remove(
                    'open'
                );

            }


            settingsButton?.classList.remove(
                'open-state'
            );


            locationButton.classList.add(
                'locating'
            );


            locationButton.blur();


            try{

                await centerOnMyLocation();

            }
            catch(error){

                console.error(
                    'Ошибка поиска местоположения:',
                    error
                );

            }
            finally{

                locationButton.classList.remove(
                    'locating'
                );

                locationButton.blur();

            }

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


            const isOpen =
                settings.classList.contains(
                    'open'
                );


            /* Второе нажатие — закрываем */

            if(isOpen){

                settings.classList.remove(
                    'open'
                );

                settingsButton.classList.remove(
                    'open-state'
                );

                settingsButton.blur();

                return;

            }


            /* Первое нажатие — открываем */

            settings.classList.add(
                'open'
            );

            settingsButton.classList.add(
                'open-state'
            );

            settingsButton.blur();

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


            settingsButton?.classList.remove(
                'open-state'
            );


            settingsButton?.blur();

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


                settingsButton?.classList.remove(
                    'open-state'
                );


                settingsButton?.blur();

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


                settingsButton?.classList.remove(
                    'open-state'
                );


                settingsButton?.blur();

            }

        }
    );

}