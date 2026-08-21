import {
    supabase
} from '../supabase/supabaseClient';


let locationId = null;
let watcherId = null;


/* =========================================================
   REQUEST LOCATION
========================================================= */

export function requestLocation(){

    return new Promise((resolve, reject)=>{

        if(!navigator.geolocation){

            console.error(
                'Geolocation is not supported'
            );

            reject(
                new Error('Geolocation is not supported')
            );

            return;

        }


        console.log(
            'REQUESTING GEOLOCATION...'
        );


        navigator.geolocation.getCurrentPosition(

            position=>{

                const result = {

                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude,

                    accuracy:
                        position.coords.accuracy,

                    heading:
                        position.coords.heading

                };


                console.log(
                    'LOCATION RECEIVED:',
                    result
                );


                window.myLocation = {

                    lat:
                        result.latitude,

                    lng:
                        result.longitude

                };


                window.dispatchEvent(

                    new CustomEvent(
                        'location:updated',
                        {
                            detail: {

                                lat:
                                    result.latitude,

                                lng:
                                    result.longitude

                            }
                        }
                    )

                );


                resolve(result);

            },

            error=>{

                console.error(
                    'GEOLOCATION ERROR:',
                    error.code,
                    error.message
                );


                reject(error);

            },

            {

                enableHighAccuracy:true,

                timeout:30000,

                maximumAge:0

            }

        );

    });

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


    console.log(
        'START LOCATION WATCH'
    );


    watcherId =
        navigator.geolocation.watchPosition(

            position=>{

                const result = {

                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude,

                    accuracy:
                        position.coords.accuracy,

                    heading:
                        position.coords.heading

                };


                console.log(
                    'LOCATION UPDATED:',
                    result
                );


                window.myLocation = {

                    lat:
                        result.latitude,

                    lng:
                        result.longitude

                };


                callback(
                    result
                );


                window.dispatchEvent(

                    new CustomEvent(
                        'location:updated',
                        {
                            detail: {

                                lat:
                                    result.latitude,

                                lng:
                                    result.longitude

                            }
                        }
                    )

                );

            },

            error=>{

                console.error(
                    'WATCH LOCATION ERROR:',
                    error.code,
                    error.message
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

    return new Promise((resolve,reject)=>{

        if(!navigator.geolocation){

            reject(
                new Error(
                    'Geolocation unavailable'
                )
            );

            return;

        }


        navigator.geolocation.getCurrentPosition(

            position=>{

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

                reject(error);

            },

            {

                enableHighAccuracy:true,

                timeout:30000,

                maximumAge:0

            }

        );

    });

}


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
   RESET LOCATION ID
========================================================= */

export function resetLocationId(){

    locationId = null;

}


/* =========================================================
   INIT LOCATION
========================================================= */

export async function initLocation(){

    console.log(
        'INIT LOCATION'
    );


    try{

        const position =
            await requestLocation();


        console.log(
            'INITIAL LOCATION:',
            position
        );


        return position;

    }
    catch(error){

        console.error(
            'INITIAL LOCATION FAILED:',
            error
        );


        return null;

    }

}