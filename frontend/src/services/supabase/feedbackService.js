import {
    supabase
}
from './supabaseClient';

export async function sendFeedback({

    telegram_id,

    first_name,

    username,

    type,

    message

}){

    const {
        data,
        error
    } = await supabase

        .from('feedback')

        .insert({

            telegram_id,

            first_name,

            username,

            type,

            message

        })

        .select()

        .single();

    if(error){

        console.error(
            'FEEDBACK ERROR',
            error
        );

        throw error;

    }

    return data;

}

export async function getFeedback(type){

    let query = supabase

        .from('feedback')

        .select('*')

        .order(

            'created_at',

            {

                ascending:false

            }

        );

    if(type){

        query = query.eq(

            'type',

            type

        );

    }

    const {
        data,
        error
    } = await query;

    if(error){

        console.error(
            'GET FEEDBACK ERROR',
            error
        );

        return [];

    }

    return data;

}

export async function deleteFeedback(id){

    const {
        error
    } = await supabase

        .from('feedback')

        .delete()

        .eq(

            'id',

            id

        );

    if(error){

        console.error(
            'DELETE FEEDBACK ERROR',
            error
        );

        throw error;

    }

}