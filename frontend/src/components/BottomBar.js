import './BottomBar.css';


import {
    centerOnMyLocation
}
from '../services/map/locationControlService';



export function BottomBar(){


    setTimeout(()=>{


        const locationButton =
        document.querySelector(
            '#my-location-button'
        );


        locationButton?.addEventListener(
            'click',
            ()=>{
                centerOnMyLocation();
            }
        );


        const settingsButton =
        document.querySelector(
            '#settings-button'
        );


        const settingsWindow =
        document.querySelector(
            '#settings-window'
        );


        settingsButton?.addEventListener(
            'click',
            ()=>{

                settingsWindow
                ?.classList.toggle(
                    'open'
                );

            }
        );


    },100);



    return `


<div class="bottom-bar">



<button
class="bottom-button"
id="my-location-button"
>
◎
</button>





<button
class="live-button"
id="live-button"
>
<span class="live-dot"></span>
LIVE
</button>





<button
id="settings-button"
>
⚙
</button>



</div>


`;

}