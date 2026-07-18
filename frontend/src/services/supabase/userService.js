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

        .single();



    if(error){

        return null;

    }


    return data;

}







export async function createUser(user){


    const existingUser =
        await getUserByTelegramId(
            user.telegram_id
        );



    if(existingUser){

        console.log(
            'User exists:',
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


        console.error(
            'Create user error:',
            error
        );


        throw error;


    }




    console.log(
        'User created:',
        data
    );


    return data;


}