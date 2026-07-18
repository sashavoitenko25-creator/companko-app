import {
    supabase
}
from './supabaseClient';



export async function getOrCreateTelegramUser(
    telegramUser
){


    if(!telegramUser)
        return null;



    const {
        data:existing,
        error
    } = await supabase
        .from('profiles')
        .select('*')
        .eq(
            'telegram_id',
            telegramUser.telegram_id
        )
        .single();



    if(existing){

        return existing;

    }



    const {
        data,
        error:createError
    } = await supabase
        .from('profiles')
        .insert({

            telegram_id:
                telegramUser.telegram_id,


            name:
                telegramUser.first_name,


            username:
                telegramUser.username,


            photo:
                telegramUser.photo_url

        })
        .select()
        .single();



    if(createError){

        console.error(
            createError
        );

        return null;

    }



    return data;


}