import {
    supabase
} from './supabaseClient';





export async function getProfileByUserId(userId){


    const {
        data,
        error
    } = await supabase

        .from('profiles')

        .select('*')

        .eq(
            'user_id',
            userId
        )

        .maybeSingle();





    if(error){


        console.error(
            'Get profile error:',
            error
        );


        return null;


    }





    return data;


}









export async function createProfile(profile){



    const {
        data,
        error
    } = await supabase

        .from('profiles')

        .insert({


            user_id:
            profile.user_id,


            name:
            profile.name,


            age:
            profile.age,


            gender:
            profile.gender,


            photo_url:
            profile.photo_url || null



        })

        .select()

        .single();






    if(error){


        console.error(
            'Create profile error:',
            error
        );


        throw error;


    }





    console.log(
        'Profile created:',
        data
    );



    return data;


}









export async function updateProfile(
    profileId,
    profile
){



    const {
        data,
        error
    } = await supabase

        .from('profiles')

        .update({



            name:
            profile.name,



            age:
            profile.age,



            gender:
            profile.gender,



            photo_url:
            profile.photo_url || null



        })


        .eq(

            'id',

            profileId

        )


        .select()


        .single();







    if(error){


        console.error(

            'Update profile error:',

            error

        );


        throw error;


    }






    return data;


}