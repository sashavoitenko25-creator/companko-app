import {
    supabase
} from './supabaseClient';

export async function checkActiveLive(userId){

    const {

        data,

        error

    } = await supabase

        .from('live_sessions')

        .select('*')

        .eq(
            'user_id',
            userId
        )

        .eq(
            'status',
            'active'
        )

        .maybeSingle();

    if(error){

        console.error(
            'Check active live error:',
            error
        );

        throw error;

    }

    return data;

}

export async function createLiveSession(data){

    const existing =
        await checkActiveLive(
            data.user_id
        );

    if(existing){

        return existing;

    }

    const expiresAt =
        new Date(

            Date.now()

            +

            (

                (data.duration || 60)

                *

                60

                *

                1000

            )

        );

    const {

        data:session,

        error

    } = await supabase

        .from('live_sessions')

        .insert({

            user_id:
            data.user_id,

            activity:
            data.activity,

            duration:
            data.duration || 60,

            status:
            'active',

            expires_at:
            expiresAt.toISOString()

        })

        .select()

        .single();

    if(error){

        console.error(
            'Create live session error:',
            error
        );

        throw error;

    }

    return session;

}

export async function sendLocation(

    userId,

    latitude,

    longitude

){

    const {

        data:existing

    } = await supabase

        .from('locations')

        .select('id')

        .eq(
            'user_id',
            userId
        )

        .maybeSingle();

    if(existing){

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
                'user_id',
                userId
            )

            .select()

            .single();

        if(error){

            console.error(
                'Update location error:',
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

            user_id:
            userId,

            latitude,

            longitude

        })

        .select()

        .single();

    if(error){

        console.error(
            'Create location error:',
            error
        );

        throw error;

    }

    return data;

}

export async function refreshLiveLocation(

    userId,

    latitude,

    longitude

){

    return await sendLocation(

        userId,

        latitude,

        longitude

    );

}

export async function stopLiveSession(sessionId){

    const {

        error

    } = await supabase

        .from('live_sessions')

        .update({

            status:
            'finished'

        })

        .eq(
            'id',
            sessionId
        );

    if(error){

        console.error(
            'Stop live error:',
            error
        );

        throw error;

    }

}

export async function clearExpiredLiveSessions(){

    const now =
        new Date().toISOString();

    const {

        error

    } = await supabase

        .from('live_sessions')

        .update({

            status:
            'finished'

        })

        .eq(
            'status',
            'active'
        )

        .lt(
            'expires_at',
            now
        );

    if(error){

        console.error(
            'Clear expired live error:',
            error
        );

    }

}

export async function restoreActiveLive(userId){

    if(!userId){

        return null;

    }

    const {

        data,

        error

    } = await supabase

        .from('live_sessions')

        .select('*')

        .eq(
            'user_id',
            userId
        )

        .eq(
            'status',
            'active'
        )

        .gt(
            'expires_at',
            new Date().toISOString()
        )

        .maybeSingle();

    if(error){

        console.error(
            'Restore live error:',
            error
        );

        return null;

    }

    return data;

}