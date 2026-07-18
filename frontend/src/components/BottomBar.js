import {
    centerOnMyLocation
} from '../services/map/locationControlService';



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


    });


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

                🔴 LIVE

            </button>





            <button

                class="bottom-button"

                id="settings-button"

            >

                ⚙

            </button>



        </div>


    `;


}