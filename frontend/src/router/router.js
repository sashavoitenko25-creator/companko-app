import {
    hasProfile
} from '../features/profile/profileStore';


import {
    Home
} from '../pages/Home/Home';


import {
    Profile
} from '../pages/Profile/Profile';





function renderApp(){


    const app =
    document.querySelector('#app');



    if(!app)
        return;



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






    window.addEventListener(

        'profile:open',

        ()=>{


            const app =
            document.querySelector('#app');



            if(!app)
                return;



            app.innerHTML =
            Profile();


        }

    );



}