let currentProfile = null;




export function setProfile(profile){


    currentProfile = profile;


    localStorage.setItem(
        'profile',
        JSON.stringify(profile)
    );


}






export function saveProfile(profile){


    setProfile(profile);


}






export function getProfile(){


    if(currentProfile){

        return currentProfile;

    }




    const saved =
        localStorage.getItem(
            'profile'
        );



    if(!saved){

        return null;

    }




    try{


        currentProfile =
            JSON.parse(saved);


        return currentProfile;


    }
    catch(error){


        console.error(
            'Profile restore error',
            error
        );


        clearProfile();


        return null;


    }


}






export function clearProfile(){


    currentProfile = null;


    localStorage.removeItem(
        'profile'
    );


}






export async function loadProfile(profile){


    if(!profile){

        clearProfile();

        return null;

    }


    setProfile(profile);


    return profile;


}






export async function initProfile(){


    const profile =
        getProfile();



    return profile;


}