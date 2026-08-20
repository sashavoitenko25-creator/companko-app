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
                КРУГЛАЯ ТОНКАЯ ШЕСТЕРЁНКА
            -->

            <path
                d="
                    M12 3.2

                    L13.05 4.75
                    C13.45 4.85 13.82 5 14.18 5.2

                    L16 4.65
                    L17.35 6
                    L16.8 7.82

                    C17 8.18 17.15 8.55 17.25 8.95

                    L18.8 10
                    V14

                    L17.25 15.05

                    C17.15 15.45 17 15.82 16.8 16.18

                    L17.35 18
                    L16 19.35
                    L14.18 18.8

                    C13.82 19 13.45 19.15 13.05 19.25

                    L12 20.8

                    L10.95 19.25

                    C10.55 19.15 10.18 19 9.82 18.8

                    L8 19.35
                    L6.65 18
                    L7.2 16.18

                    C7 15.82 6.85 15.45 6.75 15.05

                    L5.2 14
                    V10

                    L6.75 8.95

                    C6.85 8.55 7 8.18 7.2 7.82

                    L6.65 6
                    L8 4.65
                    L9.82 5.2

                    C10.18 5 10.55 4.85 10.95 4.75

                    Z
                "
                stroke="currentColor"
                stroke-width="1.35"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
            />

            <!--
                МАЛЕНЬКОЕ ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ
            -->

            <circle
                cx="12"
                cy="12"
                r="2.35"
                stroke="currentColor"
                stroke-width="1.35"
                fill="none"
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
       СБРОС КНОПКИ В ОБЫЧНОЕ СОСТОЯНИЕ
    ===================================================== */

    function resetButton(button){

        if(!button)
            return;

        button.classList.remove(
            'pressed'
        );

        button.blur();

    }


    /* =====================================================
       НАЙТИ СЕБЯ
    ===================================================== */

    if(locationButton){

        locationButton.onclick = async (event)=>{

            event.preventDefault();

            event.stopPropagation();


            /* ---------------------------------------------
               Закрываем настройки
            --------------------------------------------- */

            if(settings){

                settings.classList.remove(
                    'open'
                );

            }


            resetButton(
                settingsButton
            );


            /* ---------------------------------------------
               Включаем активное состояние
            --------------------------------------------- */

            locationButton.classList.add(
                'pressed'
            );


            try{

                /*
                 * ЖДЁМ ПОЛНОГО ЗАВЕРШЕНИЯ:
                 *
                 * получение геолокации
                 * +
                 * flyTo
                 * +
                 * moveend
                 */

                await centerOnMyLocation();

            }
            catch(error){

                console.error(
                    'Не удалось определить местоположение:',
                    error
                );

            }
            finally{

                /*
                 * После завершения фокусировки
                 * возвращаем кнопку в обычное состояние.
                 */

                resetButton(
                    locationButton
                );

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


            /* ---------------------------------------------
               ВТОРОЕ НАЖАТИЕ
               Закрываем настройки
            --------------------------------------------- */

            if(isOpen){

                settings.classList.remove(
                    'open'
                );


                resetButton(
                    settingsButton
                );


                return;

            }


            /* ---------------------------------------------
               ПЕРВОЕ НАЖАТИЕ
               Открываем настройки
            --------------------------------------------- */

            settings.classList.add(
                'open'
            );


            settingsButton.classList.add(
                'pressed'
            );

        };

    }


    /* =====================================================
       LIVE
    ===================================================== */

    if(liveButton){

        liveButton.onclick = (event)=>{

            event.preventDefault();

            event.stopPropagation();


            /* Закрываем настройки */

            if(settings){

                settings.classList.remove(
                    'open'
                );

            }


            /* Сбрасываем кнопку настроек */

            resetButton(
                settingsButton
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


            /*
             * Если клик был не внутри окна
             * и не по кнопке настроек —
             * закрываем настройки.
             */

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


                resetButton(
                    settingsButton
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


            /*
             * Если нажата любая другая кнопка,
             * настройки закрываются.
             */

            if(
                target !== settingsButton &&
                !settings?.contains(
                    target
                )
            ){

                settings?.classList.remove(
                    'open'
                );


                resetButton(
                    settingsButton
                );

            }

        }
    );

}