import {
    supabase
} from '../supabase/supabaseClient';



let locationId = null;

let watcherId = null;









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





    locationId = data.id;



    return data;


}









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









export function watchLocation(callback){



    if(
        typeof callback !== 'function'
    ){


        console.error(
            'watchLocation: callback is not a function'
        );


        return null;


    }






    if(
        !navigator.geolocation
    ){


        console.error(
            'Geolocation not supported'
        );


        return null;


    }







    watcherId = navigator.geolocation.watchPosition(



        position=>{



            callback({


                latitude:

                position.coords.latitude,



                longitude:

                position.coords.longitude,



                accuracy:

                position.coords.accuracy



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


            timeout:10000,


            maximumAge:5000


        }



    );







    return watcherId;



}









export function stopWatchingLocation(){



    if(watcherId){



        navigator.geolocation.clearWatch(

            watcherId

        );



        watcherId=null;


    }


}









export function getCurrentPosition(){



    return new Promise((resolve,reject)=>{



        if(!navigator.geolocation){


            reject(
                'Geolocation unavailable'
            );


            return;


        }







        navigator.geolocation.getCurrentPosition(



            position=>{


                resolve({


                    latitude:

                    position.coords.latitude,



                    longitude:

                    position.coords.longitude



                });



            },



            error=>{


                reject(error);


            },



            {


                enableHighAccuracy:true,


                timeout:10000,


                maximumAge:5000


            }



        );



    });



}









export function resetLocationId(){


    locationId=null;


}