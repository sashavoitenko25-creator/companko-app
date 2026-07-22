import {
    supabase
} from './supabaseClient';






export async function getLiveUsers(){


    await clearExpiredLiveSessions();



    const {

        data:sessions,

        error

    } = await supabase

        .from('live_sessions')

        .select(`

            id,

            user_id,

            activity,

            duration,

            status,

            expires_at

        `)

        .eq(
            'status',
            'active'
        )

        .gt(
            'expires_at',
            new Date().toISOString()
        );




    if(error){

        console.error(
            'Get live users error:',
            error
        );

        throw error;

    }



    if(!sessions || sessions.length === 0){

        return [];

    }




    const userIds = sessions.map(

        item => item.user_id

    );





    const {

        data:profiles

    } = await supabase

        .from('profiles')

        .select(`

            user_id,

            name,

            age,

            gender,

            city,

            about

        `)

        .in(
            'user_id',
            userIds
        );





    const {

        data:locations

    } = await supabase

        .from('locations')

        .select(`

            user_id,

            latitude,

            longitude,

            created_at

        `)

        .in(
            'user_id',
            userIds
        )

        .order(

            'created_at',

            {

                ascending:false

            }

        );





    return sessions.map(session=>{


        const profile = profiles?.find(

            p => p.user_id === session.user_id

        );



        const location = locations?.find(

            l => l.user_id === session.user_id

        );




        return {


            id:
            session.id,


            user_id:
            session.user_id,


            name:
            profile?.name || 'Гость',


            age:
            profile?.age || '',


            activity:
            session.activity,


            duration:
            session.duration,


            expires_at:
            session.expires_at,


            photo:
            `https://i.pravatar.cc/150?u=${session.user_id}`,


            lat:
            location?.latitude ?? null,


            lng:
            location?.longitude ?? null


        };


    })

    .filter(user=>

        user.lat !== null &&

        user.lng !== null

    );


}









export async function createLiveSession(data){



    const {

        data:existing,

        error:checkError

    } = await supabase

        .from('live_sessions')

        .select(`

            id,

            status,

            expires_at,

            activity,

            duration

        `)

        .eq(
            'user_id',
            data.user_id
        )

        .eq(
            'status',
            'active'
        )

        .maybeSingle();




    if(checkError){

        console.error(
            'Check live error:',
            checkError
        );

        throw checkError;

    }





    if(existing){

        return existing;

    }





    const expiresAt = new Date(

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
            'Create live error:',
            error
        );

        throw error;

    }




    return session;


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









async function clearExpiredLiveSessions(){



    const now = new Date().toISOString();




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
            'Expire live error:',
            error
        );

    }


}









export async function getOnlineCount(){



    const {

        count,

        error

    } = await supabase

        .from('live_sessions')

        .select(

            '*',

            {

                count:'exact',

                head:true

            }

        )

        .eq(

            'status',

            'active'

        )

        .gt(

            'expires_at',

            new Date().toISOString()

        );




    if(error){

        console.error(
            'Online count error:',
            error
        );

        return 0;

    }




    return count || 0;


}