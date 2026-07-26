import './BottomBar.css';

import {
    centerOnMyLocation
} from './services/map/locationControlService';

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

    document
        .querySelector('#my-location-button')
        ?.addEventListener(
            'click',
            centerOnMyLocation
        );

    document
        .querySelector('#settings-button')
        ?.addEventListener(
            'click',
            ()=>{

                document
                    .querySelector('#settings-window')
                    ?.classList.toggle('open');

            }
        );

}