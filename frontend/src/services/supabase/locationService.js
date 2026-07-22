import {
    supabase
} from './supabaseClient';





let locationId = null;









export async function saveMyLocation(

    userId,

    latitude,

    longitude

){



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







    if(error)


        console.error(


            'Update location error',


            error


        );


}









export function resetLocationId(){


    locationId = null;


}