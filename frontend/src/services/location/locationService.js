import {
    supabase
} from '../supabase/supabaseClient';


let locationId = null;
let watcherId = null;


/* =========================================================
   TELEGRAM LOCATION
========================================================= */

export function requestLocation(){

    return new Promise((resolve,reject)=>{

        const tg =
            window.Telegram?.WebApp;


        /*
         * TELEGRAM MINI APP
         */

        if(
            tg &&
            tg.LocationManager
        ){

            console.log(
                'TELEGRAM LOCATION MANAGER'
            );


            const manager =
                tg.LocationManager;


            const initManager = ()=>{

                console.log(
                    'LOCATION MANAGER:',
                    {
                        available:
                            manager.isLocationAvailable,

                        requested:
                            manager.isAccessRequested,

                        granted:
                            manager.isAccessGranted
                    }
                );


                /*
                 * Запрашиваем разрешение
                 */

                manager.getLocation(

                    location=>{

                        console.log(
                            'TELEGRAM LOCATION:',
                            location
                        );


                        if(!location){

                            reject(
                                new Error(
                                    'Telegram location permission denied'
                                )
                            );

                            return;

                        }


                        const result = {

                            latitude:
                                Number(
                                    location.latitude
                                ),

                            longitude:
                                Number(
                                    location.longitude
                                ),

                            accuracy:
                                location.horizontal_accuracy ??
                                null,

                            heading:
                                location.course ??
                                null

                        };


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
                                    detail:{

                                        lat:
                                            result.latitude,

                                        lng:
                                            result.longitude

                                    }

                                }

                            )

                        );


                        resolve(result);

                    }

                );

            };


            /*
             * Telegram LocationManager
             * сначала нужно инициализировать.
             */

            if(manager.isInited){

                initManager();

            }

            else{

                manager.init(

                    ()=>{

                        initManager();

                    }

                );

            }


            return;

        }


        /*
         * FALLBACK ДЛЯ ОБЫЧНОГО БРАУЗЕРА
         */

        if(!navigator.geolocation){

            reject(
                new Error(
                    'Geolocation is not supported'
                )
            );

            return;

        }


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
                            detail:{

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
                    'BROWSER GEOLOCATION ERROR:',
                    error
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

    if(typeof callback !== 'function')
        return null;


    /*
     * В Telegram LocationManager
     * не имеет watchPosition.
     *
     * Поэтому периодически запрашиваем
     * актуальную позицию.
     */

    const tg =
        window.Telegram?.WebApp;


    if(
        tg &&
        tg.LocationManager
    ){

        let stopped = false;


        const update = async()=>{

            if(stopped)
                return;


            try{

                const position =
                    await requestLocation();


                if(stopped)
                    return;


                callback(
                    position
                );

            }
            catch(error){

                console.error(
                    'TELEGRAM LOCATION UPDATE ERROR:',
                    error
                );

            }

        };


        update();


        watcherId =
            setInterval(
                update,
                5000
            );


        return watcherId;

    }


    /*
     * Обычный браузер
     */

    if(!navigator.geolocation)
        return null;


    if(watcherId){

        navigator.geolocation.clearWatch(
            watcherId
        );

    }


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
                            detail:{

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

    if(!watcherId)
        return;


    const tg =
        window.Telegram?.WebApp;


    if(
        tg &&
        tg.LocationManager
    ){

        clearInterval(
            watcherId
        );

    }

    else if(
        navigator.geolocation
    ){

        navigator.geolocation.clearWatch(
            watcherId
        );

    }


    watcherId = null;

}


/* =========================================================
   GET CURRENT POSITION
========================================================= */

export function getCurrentPosition(){

    return requestLocation();

}


/* =========================================================
   INIT LOCATION
========================================================= */

export async function initLocation(){

    try{

        return await requestLocation();

    }
    catch(error){

        console.error(
            'INIT LOCATION ERROR:',
            error
        );

        return null;

    }

}


/* =========================================================
   SUPABASE
========================================================= */

export async function saveMyLocation(

    userId,
    latitude,
    longitude

){

    if(!userId)
        return null;


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


        if(error)
            throw error;


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


    if(error)
        throw error;


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
            'UPDATE LOCATION ERROR:',
            error
        );

    }

}


/* =========================================================
   RESET
========================================================= */

export function resetLocationId(){

    locationId = null;

}