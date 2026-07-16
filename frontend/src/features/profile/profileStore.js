let profile = null;



export function saveProfile(data){


    profile = data;


    localStorage.setItem(

        'companko_profile',

        JSON.stringify(data)

    );


}





export function getProfile(){


    if(profile)
        return profile;



    const saved =

    localStorage.getItem(
        'companko_profile'
    );



    if(saved){

        profile =
        JSON.parse(saved);

    }



    return profile;


}





export function hasProfile(){


    return Boolean(
        getProfile()
    );


}





export function clearProfile(){


    profile = null;


    localStorage.removeItem(
        'companko_profile'
    );


}