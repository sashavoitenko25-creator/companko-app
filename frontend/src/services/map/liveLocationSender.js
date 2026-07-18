import {
    refreshLiveLocation
} from '../supabase/liveSessionService';

import {
    getProfile
} from '../../features/profile/profileStore';

let started = false;

let intervalId = null;

export function initLiveLocationSender(){

    if(started)
        return;

    started = true;

    window.addEventListener(

        'live:started',

        ()=>{

            startSending();

        }

    );

    window.addEventListener(

        'live:stopped',

        ()=>{

            stopSending();

        }

    );

}

function startSending(){

    if(intervalId)
        return;

    intervalId = setInterval(async()=>{

        const profile = getProfile();

        if(!profile)
            return;

        const userId =
            profile.user_id ||
            profile.id;

        if(!userId)
            return;

        navigator.geolocation.getCurrentPosition(

            async(position)=>{

                try{

                    await refreshLiveLocation(

                        userId,

                        position.coords.latitude,

                        position.coords.longitude

                    );

                }

                catch(error){

                    console.error(
                        'Live location send error',
                        error
                    );

                }

            }

        );

    },5000);

}

function stopSending(){

    if(intervalId){

        clearInterval(intervalId);

        intervalId = null;

    }

}