import {
    getMap
} from './mapService';


export function centerOnMyLocation(){

    return new Promise((resolve, reject)=>{

        const map = getMap();


        /* =====================================================
           КАРТА НЕ НАЙДЕНА
        ===================================================== */

        if(!map){

            reject(
                new Error('Map is not initialized')
            );

            return;

        }


        /* =====================================================
           GEOLOCATION НЕ ПОДДЕРЖИВАЕТСЯ
        ===================================================== */

        if(!navigator.geolocation){

            console.error(
                'No geolocation'
            );

            reject(
                new Error(
                    'Geolocation is not supported'
                )
            );

            return;

        }


        /* =====================================================
           ПОЛУЧАЕМ ПОЗИЦИЮ
        ===================================================== */

        navigator.geolocation.getCurrentPosition(

            position=>{

                const latitude =
                    position.coords.latitude;


                const longitude =
                    position.coords.longitude;


                /* =================================================
                   ФОКУСИРУЕМ КАРТУ
                ================================================= */

                map.flyTo(

                    [
                        latitude,
                        longitude
                    ],

                    17,

                    {
                        animate:true,
                        duration:1
                    }

                );


                /* =================================================
                   ЖДЁМ ПОЛНОГО ОКОНЧАНИЯ FLYTO
                ================================================= */

                map.once(
                    'moveend',
                    ()=>{

                        resolve();

                    }
                );


            },


            /* =====================================================
               ОШИБКА GEOLOCATION
            ===================================================== */

            error=>{

                console.error(
                    error
                );

                reject(
                    error
                );

            },


            {

                enableHighAccuracy:true

            }

        );

    });

}