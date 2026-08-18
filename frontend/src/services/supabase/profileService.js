import {
    supabase
} from './supabaseClient';





/* ========================================
   ПОЛУЧИТЬ ПРОФИЛЬ ПО USER ID
======================================== */

export async function getProfileByUserId(userId) {


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





    if (error) {


        console.error(
            'Get profile error:',
            error
        );


        return null;


    }





    return data;


}









/* ========================================
   СОЗДАТЬ ПРОФИЛЬ
======================================== */

export async function createProfile(profile) {


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

            city:
                profile.city || null,

            interests:
                profile.interests || [],

            favorite_activity:
                profile.favorite_activity || null,

            about:
                profile.about || null,

            telegram_id:
                profile.telegram_id || null,

            photo_url:
                profile.photo_url || null,

            relationship_status:
                profile.relationship_status ||
                'not_specified'

        })

        .select()

        .single();





    if (error) {


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









/* ========================================
   ОБНОВИТЬ ПРОФИЛЬ
======================================== */

export async function updateProfile(
    profileId,
    profile
) {


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

            city:
                profile.city || null,

            interests:
                profile.interests || [],

            favorite_activity:
                profile.favorite_activity || null,

            about:
                profile.about || null,

            telegram_id:
                profile.telegram_id || null,

            photo_url:
                profile.photo_url || null,

            relationship_status:
                profile.relationship_status ||
                'not_specified'

        })

        .eq(
            'id',
            profileId
        )

        .select()

        .single();





    if (error) {


        console.error(
            'Update profile error:',
            error
        );


        throw error;


    }





    console.log(
        'Profile updated:',
        data
    );


    return data;


}