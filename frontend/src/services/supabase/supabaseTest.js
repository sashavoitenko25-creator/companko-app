import {
    supabase
} from './supabaseClient';



export async function testSupabaseConnection(){


    const {
        data,
        error
    } = await supabase
        .from('users')
        .select('*')
        .limit(1);



    if(error){

        console.error(
            'Supabase error:',
            error
        );

        return false;

    }



    console.log(
        'Supabase connected:',
        data
    );


    return true;


}