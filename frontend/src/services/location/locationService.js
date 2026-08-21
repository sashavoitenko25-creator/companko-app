import {
    supabase
} from '../supabase/supabaseClient';


let locationId = null;
let watcherId = null;


/* =========================================================
   SAVE LOCATION
========================================================= */

export async function saveMyLocation(
    userId,
    latitude,
    longitude
){

    if(!userId){

        console.error(
            'No user id for location'
        );

        return null;

    }

    if(locationId){

        const {
            data,
            error
        } = await supabase

            .from('locations')

            .update({

                latitude,
                longitude

            })

            .eq(
                'id',
                locationId
            )

            .select()

            .single();


        if(error){

            console.error(
                'Update location error',
                error
            );

            throw error;

        }


        return data;

    }


    const {
        data,
        error
    } = await supabase

        .from('locations')

        .insert({

            user_id:userId,

            latitude,

            longitude

        })

        .select()

        .single();


    if(error){

        console.error(
            'Save location error',
            error
        );

        throw error;

    }


    locationId =
        data.id;


    return data;

}


/* =========================================================
   UPDATE LOCATION
========================================================= */

export async function updateMyLocation(
    latitude,
    longitude
){

    if(!locationId)
        return;


    const {
        error
    } = await supabase

        .from('locations')

        .update({

            latitude,

            longitude

        })

        .eq(
            'id',
            locationId
        );


    if(error){

        console.error(
            'Update location error',
            error
        );

    }

}


/* =========================================================
   WATCH LOCATION
========================================================= */

export function watchLocation(callback){

    if(typeof callback !== 'function'){

        console.error(
            'watchLocation: callback is not a function'
        );

        return null;

    }


    if(!navigator.geolocation){

        console.error(
            'Geolocation not supported'
        );

        return null;

    }


    if(watcherId){

        navigator.geolocation.clearWatch(
            watcherId
        );

        watcherId = null;

    }


    watcherId =
        navigator.geolocation.watchPosition(

            position=>{

                const accuracy =
                    position.coords.accuracy;


                if(
                    typeof accuracy === 'number' &&
                    accuracy > 100
                ){

                    console.warn(
                        'Ignoring inaccurate location:',
                        accuracy,
                        'meters'
                    );

                    return;

                }


                callback({

                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude,

                    accuracy:
                        accuracy,

                    heading:
                        position.coords.heading

                });

            },


            error=>{

                console.error(
                    'Watch location error',
                    error
                );

            },


            {

                enableHighAccuracy:true,

                timeout:30000,

                maximumAge:0

            }

        );


    return watcherId;

}


/* =========================================================
   STOP WATCHING
========================================================= */

export function stopWatchingLocation(){

    if(watcherId){

        navigator.geolocation.clearWatch(
            watcherId
        );

        watcherId = null;

    }

}


/* =========================================================
   GET CURRENT POSITION
========================================================= */

export function getCurrentPosition(){

    return new Promise(

        (resolve,reject)=>{

            if(!navigator.geolocation){

                reject(
                    'Geolocation unavailable'
                );

                return;

            }


            navigator.geolocation.getCurrentPosition(

                position=>{

                    const accuracy =
                        position.coords.accuracy;


                    if(
                        typeof accuracy === 'number' &&
                        accuracy > 100
                    ){

                        reject({

                            code:3,

                            message:
                                'Location accuracy is too low',

                            accuracy:
                                accuracy

                        });

                        return;

                    }


                    resolve({

                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude,

                        accuracy:
                            accuracy,

                        heading:
                            position.coords.heading

                    });

                },


                error=>{

                    reject(error);

                },


                {

                    enableHighAccuracy:true,

                    timeout:30000,

                    maximumAge:0

                }

            );

        }

    );

}


/* =========================================================
   RESET LOCATION ID
========================================================= */

export function resetLocationId(){

    locationId = null;

}