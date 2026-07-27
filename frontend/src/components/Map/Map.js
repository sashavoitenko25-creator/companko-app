import './Map.css';

import {
    initMap
} from '../../services/map/mapInit';

import {
    centerOnMyLocation
} from '../../services/map/locationControlService';

let initialized = false;

export function Map(){

    setTimeout(()=>{

        initMapSafe();

    },0);

    return `

<div
    id="map"
    class="map">
</div>

<div
    id="selected-user-container">
</div>

<button
    id="my-location-button"
    class="my-location-button">

    📍

</button>

`;

}

function initMapSafe(){

    const mapElement =
    document.querySelector(
        '#map'
    );

    if(!mapElement)
        return;

    if(!initialized){

        initialized = true;

        try{

            initMap();

        }

        catch(error){

            console.error(
                'MAP INIT ERROR',
                error
            );

        }

    }

    const button =
    document.querySelector(
        '#my-location-button'
    );

    if(button){

        button.replaceWith(
            button.cloneNode(true)
        );

        const newButton =
        document.querySelector(
            '#my-location-button'
        );

        newButton.addEventListener(

            'click',

            ()=>{

                console.log(
                    'LOCATION BUTTON'
                );

                centerOnMyLocation();

            }

        );

    }

    // обновляем только карту
    window.addEventListener(

        'live:refresh',

        ()=>{

            // здесь ничего не делаем
            // карта сама обновляется через mapInit

        }

    );

    window.addEventListener(

        'live:started',

        ()=>{

            setTimeout(()=>{

                window.dispatchEvent(

                    new Event(
                        'live:refresh'
                    )

                );

            },300);

        }

    );

    window.addEventListener(

        'live:stopped',

        ()=>{

            setTimeout(()=>{

                window.dispatchEvent(

                    new Event(
                        'live:refresh'
                    )

                );

            },300);

        }

    );

}

window.addEventListener(

    'profile:created',

    ()=>{

        setTimeout(()=>{

            initialized = false;

            initMapSafe();

        },100);

    }

);