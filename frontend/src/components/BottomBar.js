import './BottomBar.css';

import {
    centerOnMyLocation
} from '../services/map/locationControlService';

export function BottomBar(){

    setTimeout(initBottomBar,0);

    return `

<div class="bottom-bar">

    <button
        class="bottom-button"
        id="my-location-button">
        ◎
    </button>

    <button
        class="live-button"
        id="live-button">
        <span class="live-dot"></span>
        LIVE
    </button>

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
    document.querySelector('#my-location-button');

    if(locationButton){

        locationButton.onclick = (event)=>{

            event.preventDefault();
            event.stopPropagation();

            centerOnMyLocation();

        };

    }

    const settingsButton =
    document.querySelector('#settings-button');

    if(settingsButton){

        settingsButton.onclick = (event)=>{

            event.preventDefault();
            event.stopPropagation();

            const settings =
            document.querySelector('#settings-window');

            if(!settings)
                return;

            settings.classList.toggle('open');

        };

    }

}