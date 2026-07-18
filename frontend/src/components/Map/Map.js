import './Map.css';

import {
    initMap
} from '../../services/map/mapInit';

import {
    centerOnMyLocation
} from '../../services/map/locationControlService';

import {
    OnlineCounter
} from '../OnlineCounter';

import {
    getOnlineCount
} from '../../services/supabase/liveService';

let initialized = false;

export function Map(){

    setTimeout(() => {

        if(initialized)
            return;

        initialized = true;

        initMap();

        const button = document.querySelector(
            '#my-location-button'
        );

        if(button){

            button.onclick = centerOnMyLocation;

        }

        loadOnlineCounter();

        window.addEventListener(
            'live:started',
            loadOnlineCounter
        );

        window.addEventListener(
            'live:stopped',
            loadOnlineCounter
        );

    },0);

    return `

<div
    id="map"
    class="map">
</div>

<div
    id="selected-user-container">
</div>

<div
    id="online-counter-container">
</div>

<button
    id="my-location-button"
    class="my-location-button">

    ◎

</button>

`;

}

async function loadOnlineCounter(){

    const container = document.querySelector(
        '#online-counter-container'
    );

    if(!container)
        return;

    try{

        const count = await getOnlineCount();

        container.innerHTML = OnlineCounter(count);

    }

    catch(error){

        console.error(error);

    }

}