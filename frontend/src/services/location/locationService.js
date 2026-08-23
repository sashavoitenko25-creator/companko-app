import {
    supabase
} from '../supabase/supabaseClient';


let locationId = null;

let watcherId = null;

let locationStarted = false;

let latestLocation = null;

let locationPromise = null;

let telegramManager = null;

let telegramInitPromise = null;


/* =========================================================
   SAVE LOCATION TO GLOBAL
========================================================= */

function publishLocation(result){

    if(!result)
        return;


    latestLocation = {

        latitude:
            Number(result.latitude),

        longitude:
            Number(result.longitude),

        accuracy:
            result.accuracy ?? null,

        heading:
            result.heading ?? null

    };


    window.myLocation = {

        lat:
            latestLocation.latitude,

        lng:
            latestLocation.longitude

    };


    window.dispatchEvent(

        new CustomEvent(
            'location:updated',

            {

                detail:{

                    lat:
                        latestLocation.latitude,

                    lng:
                        latestLocation.longitude,

                    accuracy:
                        latestLocation.accuracy,

                    heading:
                        latestLocation.heading

                }

            }

        )

    );

}


/* =========================================================
   TELEGRAM MANAGER
========================================================= */

async function getTelegramManager(){

    const tg =
        window.Telegram?.WebApp;


    if(
        !tg ||
        !tg.LocationManager
    ){

        return null;

    }


    if(telegramManager){

        return telegramManager;

    }


    if(telegramInitPromise){

        return telegramInitPromise;

    }


    telegramInitPromise =
        new Promise(resolve=>{

            const manager =
                tg.LocationManager;


            if(manager.isInited){

                telegramManager =
                    manager;

                resolve(manager);

                return;

            }


            manager.init(()=>{

                telegramManager =
                    manager;

                resolve(manager);

            });

        });


    return telegramInitPromise;

}


/* =========================================================
   REQUEST LOCATION
   ОДИН ОБЩИЙ ЗАПРОС
========================================================= */

export function requestLocation(){

    if(locationPromise){

        return locationPromise;

    }


    locationPromise =
        new Promise(async(resolve,reject)=>{

            try{

                /*
                 * ==========================================
                 * TELEGRAM MINI APP
                 * ==========================================
                 */

                const manager =
                    await getTelegramManager();


                if(manager){

                    console.log(
                        'TELEGRAM LOCATION MANAGER'
                    );


                    /*
                     * Если Telegram уже дал разрешение,
                     * просто получаем координаты.
                     */

                    manager.getLocation(

                        location=>{

                            if(!location){

                                locationPromise =
                                    null;


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


                            publishLocation(
                                result
                            );


                            resolve(
                                result
                            );

                        }

                    );


                    return;

                }


                /*
                 * ==========================================
                 * ОБЫЧНЫЙ БРАУЗЕР
                 * ==========================================
                 */

                if(!navigator.geolocation){

                    locationPromise =
                        null;


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


                        publishLocation(
                            result
                        );


                        resolve(
                            result
                        );

                    },

                    error=>{

                        console.error(
                            'BROWSER GEOLOCATION ERROR:',
                            error
                        );


                        locationPromise =
                            null;


                        reject(
                            error
                        );

                    },

                    {

                        enableHighAccuracy:true,

                        timeout:30000,

                        maximumAge:5000

                    }

                );

            }

            catch(error){

                console.error(
                    'REQUEST LOCATION ERROR:',
                    error
                );


                locationPromise =
                    null;


                reject(error);

            }

        });


    return locationPromise;

}


/* =========================================================
   WATCH LOCATION
   ЕДИНСТВЕННЫЙ WATCHER В ПРИЛОЖЕНИИ
========================================================= */

export function watchLocation(callback){

    if(typeof callback !== 'function')
        return null;


    /*
     * Уже запущен.
     */

    if(locationStarted){

        /*
         * Сразу отдаём последнюю координату.
         */

        if(latestLocation){

            callback(
                latestLocation
            );

        }


        /*
         * Подписываем callback на обновления.
         */

        const handler =
            event=>{

                if(event.detail){

                    callback({

                        latitude:
                            event.detail.lat,

                        longitude:
                            event.detail.lng,

                        accuracy:
                            event.detail.accuracy ??
                            null,

                        heading:
                            event.detail.heading ??
                            null

                    });

                }

            };


        window.addEventListener(
            'location:updated',
            handler
        );


        return {

            shared:true,

            stop:()=>{

                window.removeEventListener(
                    'location:updated',
                    handler
                );

            }

        };

    }


    locationStarted = true;


    /*
     * ==========================================
     * TELEGRAM
     * ==========================================
     */

    const tg =
        window.Telegram?.WebApp;


    if(
        tg &&
        tg.LocationManager
    ){

        let stopped = false;


        /*
         * Получаем первую позицию.
         * Здесь Telegram покажет разрешение,
         * если его ещё нет.
         */

        const firstUpdate = async()=>{

            if(stopped)
                return;


            try{

                const position =
                    await requestLocation();


                if(
                    stopped ||
                    !position
                ){

                    return;

                }


                callback(
                    position
                );

            }

            catch(error){

                console.error(
                    'TELEGRAM LOCATION ERROR:',
                    error
                );

            }

        };


        firstUpdate();


        /*
         * Telegram LocationManager не имеет
         * watchPosition.
         *
         * Поэтому после ОДНОГО разрешения
         * периодически получаем свежую позицию.
         *
         * Новый popup разрешения Telegram
         * при уже выданном доступе не показывает.
         */

        watcherId =
            setInterval(

                ()=>{

                    if(!stopped){

                        requestLocation()

                            .then(position=>{

                                if(
                                    !stopped &&
                                    position
                                ){

                                    callback(
                                        position
                                    );

                                }

                            })

                            .catch(error=>{

                                console.warn(
                                    'TELEGRAM LOCATION UPDATE ERROR:',
                                    error
                                );

                            });

                    }

                },

                3000

            );


        return {

            shared:true,

            stop:()=>{

                stopped = true;

            }

        };

    }


    /*
     * ==========================================
     * ОБЫЧНЫЙ БРАУЗЕР
     * ==========================================
     */

    if(!navigator.geolocation){

        locationStarted = false;

        return null;

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


                publishLocation(
                    result
                );


                callback(
                    result
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

                maximumAge:3000

            }

        );


    return watcherId;

}


/* =========================================================
   STOP WATCHING
========================================================= */

export function stopWatchingLocation(){

    if(!watcherId){

        locationStarted = false;

        return;

    }


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

    locationStarted = false;

}


/* =========================================================
   GET CACHED LOCATION
========================================================= */

export function getCachedLocation(){

    return latestLocation;

}


/* =========================================================
   GET CURRENT POSITION
   НЕ СОЗДАЁТ НОВЫЙ WATCHER
========================================================= */

export async function getCurrentPosition(){

    if(latestLocation){

        return latestLocation;

    }


    return await requestLocation();

}


/* =========================================================
   INIT LOCATION
========================================================= */

export async function initLocation(){

    if(latestLocation){

        return latestLocation;

    }


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