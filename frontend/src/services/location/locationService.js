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

    console.log(
        '[LOCATION] watchLocation started'
    );


    if(
        typeof callback !==
        'function'
    ){

        console.error(
            '[LOCATION] callback is not a function'
        );

        return null;

    }


    if(
        !navigator.geolocation
    ){

        console.error(
            '[LOCATION] Geolocation is not supported'
        );

        return null;

    }


    /*
     * Если старый watcher существует —
     * удаляем его.
     */

    if(watcherId !== null){

        navigator.geolocation.clearWatch(
            watcherId
        );

        watcherId = null;

    }


    console.log(
        '[LOCATION] Requesting GPS permission...'
    );


    watcherId =
        navigator.geolocation.watchPosition(

            position=>{

                console.log(
                    '[LOCATION] GPS POSITION:',
                    position
                );


                const latitude =
                    position.coords.latitude;


                const longitude =
                    position.coords.longitude;


                const accuracy =
                    position.coords.accuracy;


                const heading =
                    position.coords.heading;


                console.log(
                    '[LOCATION] LAT:',
                    latitude
                );


                console.log(
                    '[LOCATION] LNG:',
                    longitude
                );


                console.log(
                    '[LOCATION] ACCURACY:',
                    accuracy
                );


                /*
                 * Не отбрасываем координату
                 * из-за accuracy.
                 *
                 * Даже если GPS сначала показывает
                 * 100+ метров, карта всё равно
                 * должна получить позицию.
                 */

                callback({

                    latitude,

                    longitude,

                    accuracy,

                    heading

                });


            },


            error=>{

                console.error(
                    '[LOCATION] GPS ERROR:',
                    error
                );


                if(error){

                    console.error(
                        '[LOCATION] ERROR CODE:',
                        error.code
                    );


                    console.error(
                        '[LOCATION] ERROR MESSAGE:',
                        error.message
                    );

                }

            },


            {

                /*
                 * Максимально точное
                 * определение позиции.
                 */

                enableHighAccuracy:true,


                /*
                 * Даём GPS достаточно времени.
                 */

                timeout:30000,


                /*
                 * Не используем старую
                 * позицию из cache.
                 */

                maximumAge:0

            }

        );


    console.log(
        '[LOCATION] WATCHER ID:',
        watcherId
    );


    return watcherId;

}


/* =========================================================
   STOP WATCHING
========================================================= */

export function stopWatchingLocation(){

    if(
        watcherId !== null
    ){

        console.log(
            '[LOCATION] Stopping watcher:',
            watcherId
        );


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

        (
            resolve,
            reject
        )=>{

            if(
                !navigator.geolocation
            ){

                reject({

                    code:0,

                    message:
                        'Geolocation is not supported'

                });

                return;

            }


            console.log(
                '[LOCATION] Getting current position...'
            );


            navigator.geolocation.getCurrentPosition(

                position=>{

                    console.log(
                        '[LOCATION] CURRENT POSITION:',
                        position
                    );


                    resolve({

                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude,

                        accuracy:
                            position.coords.accuracy,

                        heading:
                            position.coords.heading

                    });

                },


                error=>{

                    console.error(
                        '[LOCATION] CURRENT POSITION ERROR:',
                        error
                    );


                    reject(
                        error
                    );

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