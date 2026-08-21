let currentProfile = null;


/* ========================================
   SET PROFILE
======================================== */

export function setProfile(profile){

    currentProfile = profile;

    localStorage.setItem(
        'profile',
        JSON.stringify(profile)
    );

}


/* ========================================
   SAVE PROFILE
======================================== */

export function saveProfile(profile){

    setProfile(profile);

}


/* ========================================
   GET PROFILE
======================================== */

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


/* ========================================
   CLEAR PROFILE
======================================== */

export function clearProfile(){

    currentProfile = null;

    localStorage.removeItem(
        'profile'
    );

}


/* ========================================
   LOAD PROFILE
======================================== */

export async function loadProfile(profile){

    if(!profile){

        clearProfile();

        return null;

    }


    setProfile(profile);

    return profile;

}


/* ========================================
   INIT PROFILE
======================================== */

export async function initProfile(){

    const profile =
        getProfile();


    return profile;

}