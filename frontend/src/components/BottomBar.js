import './BottomBar.css';

import {
    centerOnMyLocation
} from '../services/map/locationControlService';

import {
    t
} from '../i18n';


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
        aria-label="${t('find_me')}">

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

        ${t('live')}

    </button>


    <!-- =====================================================
         НАСТРОЙКИ
    ====================================================== -->

    <button
        class="bottom-button"
        id="settings-button"
        aria-label="${t('settings_aria')}">

        <svg
            class="settings-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">

            <path
                d="
                    M12 3.2
                    L13.55 4.75
                    L15.05 5.15
                    L17.20 4.45
                    L19.55 6.80
                    L18.85 8.95
                    L19.25 10.45
                    L20.80 12
                    L19.25 13.55
                    L18.85 15.05
                    L19.55 17.20
                    L17.20 19.55
                    L15.05 18.85
                    L13.55 19.25
                    L12 20.80
                    L10.45 19.25
                    L8.95 18.85
                    L6.80 19.55
                    L4.45 17.20
                    L5.15 15.05
                    L4.75 13.55
                    L3.20 12
                    L4.75 10.45
                    L5.15 8.95
                    L4.45 6.80
                    L6.80 4.45
                    L8.95 5.15
                    L10.45 4.75
                    Z
                "
                fill="none"
                stroke="currentColor"
                stroke-width="1.35"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <circle
                cx="12"
                cy="12"
                r="2.7"
                fill="none"
                stroke="currentColor"
                stroke-width="1.35"
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
       ОБНОВЛЕНИЕ ТЕКСТОВ
    ===================================================== */

    function updateBottomBarTexts(){

        if(locationButton){

            locationButton.setAttribute(
                'aria-label',
                t('find_me')
            );

        }


        if(settingsButton){

            settingsButton.setAttribute(
                'aria-label',
                t('settings_aria')
            );

        }


        /*
         * Текст LIVE / STOP LIVE обновляется
         * в Home.js через updateLiveButton().
         *
         * Здесь меняем текст только если
         * Live сейчас НЕ активен.
         */

        if(
            liveButton &&
            !liveButton.classList.contains(
                'stop-live'
            )
        ){

            liveButton.innerHTML = `
                <span class="live-dot"></span>
                ${t('live')}
            `;

        }

    }


    /* =====================================================
       НАЙТИ СЕБЯ
    ===================================================== */

    if(locationButton){

        locationButton.onclick = async (event)=>{

            event.preventDefault();
            event.stopPropagation();


            /*
             * Закрываем настройки
             */

            if(settings){

                settings.classList.remove(
                    'open'
                );

            }


            if(settingsButton){

                settingsButton.classList.remove(
                    'open-state'
                );

            }


            /*
             * Состояние загрузки
             */

            locationButton.classList.add(
                'locating'
            );

            locationButton.blur();


            try{

                await centerOnMyLocation();

            }
            catch(error){

                console.error(
                    t('location_error') + ':',
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


            if(!settings){

                return;

            }


            const isOpen =
                settings.classList.contains(
                    'open'
                );


            /*
             * Закрыть
             */

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


            /*
             * Открыть
             */

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


            /*
             * При нажатии LIVE закрываем настройки.
             *
             * Само включение / выключение Live
             * обрабатывается в Home.js.
             */

            if(settings){

                settings.classList.remove(
                    'open'
                );

            }


            if(settingsButton){

                settingsButton.classList.remove(
                    'open-state'
                );

                settingsButton.blur();

            }

        };

    }


    /* =====================================================
       КЛИК ПО ПУСТОМУ МЕСТУ
    ===================================================== */

    document.addEventListener(
        'click',
        (event)=>{

            if(!settings){

                return;

            }


            const clickedInsideSettings =
                settings.contains(
                    event.target
                );

            const clickedSettingsButton =
                settingsButton &&
                settingsButton.contains(
                    event.target
                );


            if(
                !clickedInsideSettings &&
                !clickedSettingsButton
            ){

                settings.classList.remove(
                    'open'
                );


                if(settingsButton){

                    settingsButton.classList.remove(
                        'open-state'
                    );

                    settingsButton.blur();

                }

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


            if(!target){

                return;

            }


            /*
             * Если нажали не на кнопку настроек
             * и не внутри окна настроек —
             * закрываем настройки.
             */

            const isSettingsButton =
                target === settingsButton;

            const isInsideSettings =
                settings &&
                settings.contains(
                    target
                );


            if(
                !isSettingsButton &&
                !isInsideSettings
            ){

                if(settings){

                    settings.classList.remove(
                        'open'
                    );

                }


                if(settingsButton){

                    settingsButton.classList.remove(
                        'open-state'
                    );

                    settingsButton.blur();

                }

            }

        }
    );


    /* =====================================================
       ОБНОВЛЕНИЕ ПРИ СМЕНЕ ЯЗЫКА
    ===================================================== */

    window.addEventListener(
        'language:changed',
        updateBottomBarTexts
    );


    /*
     * Первоначальное обновление
     */

    updateBottomBarTexts();

}