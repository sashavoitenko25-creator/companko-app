import {
    supabase
} from './supabaseClient';





export async function getProfileByUserId(userId){



const {

data,

error

}=await supabase

.from('profiles')

.select('*')

.eq(

'user_id',

userId

)

.maybeSingle();





if(error){


console.error(
'GET PROFILE ERROR',
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

}=await supabase

.from('profiles')

.insert({



user_id:

profile.user_id,



telegram_id:

profile.telegram_id,



photo_url:

profile.photo_url,



name:

profile.name,



age:

profile.age,



gender:

profile.gender



})

.select()

.single();





if(error){


console.error(

'CREATE PROFILE ERROR',

error

);


throw error;


}



return data;


}









export async function updateProfile(

profileId,

profile

){



const {

data,

error

}=await supabase

.from('profiles')

.update({



photo_url:

profile.photo_url,



name:

profile.name,



age:

profile.age,



gender:

profile.gender



})

.eq(

'id',

profileId

)

.select()

.single();





if(error){


console.error(

'UPDATE PROFILE ERROR',

error

);


throw error;


}



return data;


}