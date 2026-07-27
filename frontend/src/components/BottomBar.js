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

<svg
class="location-icon"
viewBox="0 0 24 24"
fill="none">

<circle
cx="12"
cy="12"
r="4.5"
stroke="white"
stroke-width="2"/>

<circle
cx="12"
cy="12"
r="1.8"
fill="white"/>

<path
d="M12 2V5"
stroke="white"
stroke-width="2"
stroke-linecap="round"/>

<path
d="M12 19V22"
stroke="white"
stroke-width="2"
stroke-linecap="round"/>

<path
d="M2 12H5"
stroke="white"
stroke-width="2"
stroke-linecap="round"/>

<path
d="M19 12H22"
stroke="white"
stroke-width="2"
stroke-linecap="round"/>

</svg>

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
    document.querySelector(
        '#my-location-button'
    );

    if(locationButton){

        locationButton.onclick=(event)=>{

            event.preventDefault();

            event.stopPropagation();

            locationButton.classList.add(
                'pressed'
            );

            setTimeout(()=>{

                locationButton.classList.remove(
                    'pressed'
                );

            },180);

            centerOnMyLocation();

        };

    }

    const settingsButton =
    document.querySelector(
        '#settings-button'
    );

    if(settingsButton){

        settingsButton.onclick=(event)=>{

            event.preventDefault();

            event.stopPropagation();

            const settings =
            document.querySelector(
                '#settings-window'
            );

            if(!settings)
                return;

            settings.classList.toggle(
                'open'
            );

        };

    }

}