import {
    supabase
} from './supabaseClient';





export async function getUserByTelegramId(telegram_id){


    const {
        data,
        error
    } = await supabase

        .from('users')

        .select('*')

        .eq(
            'telegram_id',
            Number(telegram_id)
        )

        .maybeSingle();




    if(error){

        console.error(
            'Get user error:',
            error
        );

        return null;

    }



    return data || null;


}









export async function createUser(user){



    if(!user?.telegram_id){

        console.error(
            'No telegram id'
        );

        return null;

    }





    const existingUser =
        await getUserByTelegramId(
            user.telegram_id
        );




    if(existingUser){


        console.log(
            'USER ALREADY EXISTS',
            existingUser
        );


        return existingUser;


    }








    const {
        data,
        error
    } = await supabase

        .from('users')

        .insert({

            telegram_id:
            Number(user.telegram_id),


            first_name:
            user.first_name || null,


            photo_url:
            user.photo_url || null,


            language_code:
            user.language_code || 'ru'


        })

        .select()

        .single();






    if(error){



        // если другой запрос успел создать пользователя

        if(
            error.code === '23505'
        ){


            return await getUserByTelegramId(
                user.telegram_id
            );


        }




        console.error(
            'CREATE USER ERROR',
            error
        );


        throw error;


    }






    console.log(
        'NEW USER CREATED',
        data
    );



    return data;



}