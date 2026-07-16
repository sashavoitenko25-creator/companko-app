import {
    hasProfile
} from '../features/profile/profileStore';


import {
    Home
} from '../pages/Home/Home';


import {
    Profile
} from '../pages/Profile/Profile';





export function renderApp(){



    const app =
    document.querySelector('#app');



    if(hasProfile()){


        app.innerHTML =
        Home();


    }else{


        app.innerHTML =
        Profile();


    }


}





export function initRouter(){



    renderApp();




    window.addEventListener(

        'profile:created',

        ()=>{


            renderApp();


        }

    );


}