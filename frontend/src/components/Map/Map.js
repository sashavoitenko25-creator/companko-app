import './Map.css';

import {
    initMap
} from '../../services/map/mapInit';

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

    window.addEventListener(

        'live:refresh',

        ()=>{

            // карта обновляется автоматически

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