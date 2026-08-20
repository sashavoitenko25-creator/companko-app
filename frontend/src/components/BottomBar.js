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

            <!-- КРУГЛАЯ ШЕСТЕРЁНКА -->

            <path
                d="
                    M12 2.8

                    L13.15 4.55
                    C13.55 4.65 13.95 4.82 14.3 5.05

                    L16.35 4.25
                    L17.95 5.85
                    L17.15 7.9

                    C17.4 8.3 17.6 8.7 17.7 9.15

                    L19.5 10.25
                    V13.75

                    L17.7 14.85
                    C17.6 15.3 17.4 15.7 17.15 16.1

                    L17.95 18.15
                    L16.35 19.75
                    L14.3 18.95

                    C13.95 19.18 13.55 19.35 13.15 19.45

                    L12 21.2

                    L10.85 19.45
                    C10.45 19.35 10.05 19.18 9.7 18.95

                    L7.65 19.75
                    L6.05 18.15
                    L6.85 16.1

                    C6.6 15.7 6.4 15.3 6.3 14.85

                    L4.5 13.75
                    V10.25

                    L6.3 9.15
                    C6.4 8.7 6.6 8.3 6.85 7.9

                    L6.05 5.85
                    L7.65 4.25
                    L9.7 5.05

                    C10.05 4.82 10.45 4.65 10.85 4.55

                    L12 2.8

                    Z
                "
            />

            <!-- МАЛЕНЬКОЕ ОТВЕРСТИЕ -->

            <circle
                cx="12"
                cy="12"
                r="2.55"
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
       СБРОС СОСТОЯНИЯ КНОПОК
    ===================================================== */

    function resetButton(button){

        if(!button)
            return;

        button.classList.remove(
            'pressed'
        );

    }


    /* =====================================================
       НАЙТИ СЕБЯ
    ===================================================== */

    if(locationButton){

        locationButton.onclick = async (event)=>{

            event.preventDefault();

            event.stopPropagation();


            /*
             * На всякий случай
             * сразу сбрасываем старое состояние
             */

            resetButton(
                locationButton
            );


            /*
             * Закрываем настройки
             */

            settings?.classList.remove(
                'open'
            );

            resetButton(
                settingsButton
            );


            /*
             * Показываем эффект нажатия
             */

            locationButton.classList.add(
                'pressed'
            );


            try{

                await centerOnMyLocation();

            }catch(error){

                console.error(
                    'Ошибка центрирования:',
                    error
                );

            }finally{

                /*
                 * ВСЕГДА возвращаем
                 * кнопку в исходное состояние
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


            /*
             * Проверяем текущее состояние
             */

            const isOpen =
                settings.classList.contains(
                    'open'
                );


            /*
             * СНАЧАЛА полностью
             * сбрасываем кнопку
             */

            resetButton(
                settingsButton
            );


            /*
             * Если окно уже открыто —
             * закрываем его
             */

            if(isOpen){

                settings.classList.remove(
                    'open'
                );

                resetButton(
                    settingsButton
                );

                return;

            }


            /*
             * Если окно закрыто —
             * открываем его
             */

            settings.classList.add(
                'open'
            );


            /*
             * Короткий эффект нажатия
             */

            settingsButton.classList.add(
                'pressed'
            );


            setTimeout(()=>{

                resetButton(
                    settingsButton
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