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
        aria-label="Найти себя"
        type="button">

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
        id="live-button"
        type="button">

        <span class="live-dot"></span>

        LIVE

    </button>


    <!-- =====================================================
         НАСТРОЙКИ
    ====================================================== -->

    <button
        class="bottom-button"
        id="settings-button"
        aria-label="Настройки"
        type="button">

        <svg
            class="settings-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">

            <!-- =================================================
                 РОВНАЯ КРУГЛАЯ ШЕСТЕРЁНКА
            ================================================== -->

            <path
                d="
                    M9.65 3.25
                    L10.05 2.55
                    H13.95
                    L14.35 3.25
                    L14.05 4.35

                    C14.65 4.55 15.2 4.85 15.7 5.25

                    L16.7 4.65
                    L18.05 6
                    L17.45 7

                    C17.85 7.5 18.15 8.05 18.35 8.65

                    L19.45 8.35
                    L20.15 12
                    L19.45 15.65
                    L18.35 15.35

                    C18.15 15.95 17.85 16.5 17.45 17

                    L18.05 18
                    L16.7 19.35
                    L15.7 18.75

                    C15.2 19.15 14.65 19.45 14.05 19.65

                    L14.35 20.75
                    L13.95 21.45
                    H10.05
                    L9.65 20.75
                    L9.95 19.65

                    C9.35 19.45 8.8 19.15 8.3 18.75

                    L7.3 19.35
                    L5.95 18
                    L6.55 17

                    C6.15 16.5 5.85 15.95 5.65 15.35

                    L4.55 15.65
                    L3.85 12
                    L4.55 8.35
                    L5.65 8.65

                    C5.85 8.05 6.15 7.5 6.55 7

                    L5.95 6
                    L7.3 4.65
                    L8.3 5.25

                    C8.8 4.85 9.35 4.55 9.95 4.35

                    Z
                "
            />

            <!-- =================================================
                 ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ
            ================================================== -->

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


            /*
             * Если уже идёт фокусировка —
             * ничего повторно не запускаем.
             */

            if(
                locationButton.classList.contains(
                    'active'
                )
            ){

                return;

            }


            /*
             * Если открыты настройки —
             * закрываем их.
             */

            settings?.classList.remove(
                'open'
            );


            /*
             * Кнопка настроек должна
             * вернуться в обычное состояние.
             */

            settingsButton?.classList.remove(
                'active'
            );


            /*
             * =================================================
             * НАЧАЛО ФОКУСИРОВКИ
             * =================================================
             */

            locationButton.classList.add(
                'active'
            );


            try{

                /*
                 * Очень важно:
                 *
                 * Если centerOnMyLocation()
                 * возвращает Promise,
                 * мы ждём его завершения.
                 */

                const result =
                    centerOnMyLocation();


                if(
                    result &&
                    typeof result.then === 'function'
                ){

                    await result;

                }

            }
            catch(error){

                console.error(
                    'Ошибка центрирования карты:',
                    error
                );

            }
            finally{

                /*
                 * =================================================
                 * ФОКУСИРОВКА ЗАКОНЧИЛАСЬ
                 * =================================================
                 *
                 * Возвращаем кнопку
                 * в обычное состояние.
                 */

                locationButton.classList.remove(
                    'active'
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


            /*
             * =================================================
             * ЕСЛИ НАСТРОЙКИ УЖЕ ОТКРЫТЫ
             * =================================================
             *
             * Второй клик:
             *
             * окно закрываем
             * кнопку выключаем
             */

            if(
                settings.classList.contains(
                    'open'
                )
            ){

                settings.classList.remove(
                    'open'
                );

                settingsButton.classList.remove(
                    'active'
                );

                return;

            }


            /*
             * =================================================
             * ПЕРВЫЙ КЛИК
             * =================================================
             *
             * Открываем настройки
             * и оставляем кнопку ACTIVE.
             */

            settings.classList.add(
                'open'
            );

            settingsButton.classList.add(
                'active'
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


            /*
             * Закрываем настройки.
             */

            settings?.classList.remove(
                'open'
            );


            /*
             * Возвращаем кнопку настроек
             * в обычное состояние.
             */

            settingsButton?.classList.remove(
                'active'
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
             * Если кликнули не внутри
             * окна настроек и не по самой
             * кнопке настроек —
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


                settingsButton?.classList.remove(
                    'active'
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
             * Если нажата любая другая
             * кнопка — настройки закрываем.
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


                settingsButton?.classList.remove(
                    'active'
                );

            }

        }
    );

}