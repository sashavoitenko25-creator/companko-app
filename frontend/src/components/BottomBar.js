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
                НОРМАЛЬНАЯ КРУГЛАЯ ШЕСТЕРЁНКА
                Только контур + маленькое
                центральное отверстие
            -->

            <path
                d="
                    M12 2.8

                    L13.05 4.65
                    C13.45 4.75 13.82 4.90 14.18 5.10

                    L16.25 4.42
                    L17.82 6.00
                    L17.14 8.07

                    C17.34 8.43 17.49 8.80 17.59 9.20

                    L19.45 10.25
                    V13.75

                    L17.59 14.80

                    C17.49 15.20 17.34 15.57 17.14 15.93

                    L17.82 18.00
                    L16.25 19.58
                    L14.18 18.90

                    C13.82 19.10 13.45 19.25 13.05 19.35

                    L12 21.20

                    L10.95 19.35

                    C10.55 19.25 10.18 19.10 9.82 18.90

                    L7.75 19.58
                    L6.18 18.00
                    L6.86 15.93

                    C6.66 15.57 6.51 15.20 6.41 14.80

                    L4.55 13.75
                    V10.25

                    L6.41 9.20

                    C6.51 8.80 6.66 8.43 6.86 8.07

                    L6.18 6.00
                    L7.75 4.42
                    L9.82 5.10

                    C10.18 4.90 10.55 4.75 10.95 4.65

                    Z
                "
            />

            <!-- ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ -->

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
       УНИВЕРСАЛЬНЫЙ КОРОТКИЙ CLICK EFFECT
    ===================================================== */

    function buttonPressed(button){

        if(!button)
            return;


        /*
         * Сначала полностью убираем
         * старое состояние
         */

        button.classList.remove(
            'pressed'
        );


        /*
         * Форсируем браузер
         * пересчитать состояние
         */

        void button.offsetWidth;


        /*
         * Добавляем эффект
         */

        button.classList.add(
            'pressed'
        );


        /*
         * Через 180ms полностью убираем
         */

        setTimeout(()=>{

            button.classList.remove(
                'pressed'
            );

        },180);

    }


    /* =====================================================
       НАЙТИ СЕБЯ
    ===================================================== */

    if(locationButton){

        locationButton.onclick = (event)=>{

            event.preventDefault();

            event.stopPropagation();


            /*
             * Закрываем настройки
             */

            settings?.classList.remove(
                'open'
            );


            /*
             * Короткая анимация кнопки
             */

            buttonPressed(
                locationButton
            );


            /*
             * Центрируем карту
             */

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
             * Переключаем окно
             */

            const willOpen =
                !settings.classList.contains(
                    'open'
                );


            settings.classList.toggle(
                'open'
            );


            /*
             * Кнопка получает эффект
             * только на время клика.
             *
             * После закрытия или открытия
             * состояние ВСЕГДА очищается.
             */

            buttonPressed(
                settingsButton
            );


            /*
             * На всякий случай
             * принудительно убираем
             * pressed после переключения.
             */

            if(!willOpen){

                setTimeout(()=>{

                    settingsButton.classList.remove(
                        'pressed'
                    );

                },200);

            }

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


            /*
             * Если настройки закрываются
             * через LIVE — кнопка настроек
             * тоже возвращается в обычное состояние.
             */

            settingsButton?.classList.remove(
                'pressed'
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


                /*
                 * Полностью сбрасываем
                 * состояние кнопки настроек.
                 */

                settingsButton?.classList.remove(
                    'pressed'
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


                /*
                 * Возвращаем настройки
                 * в исходный вид.
                 */

                settingsButton?.classList.remove(
                    'pressed'
                );

            }

        }
    );

}