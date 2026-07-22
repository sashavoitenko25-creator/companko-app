import {
    initProfile,
    getProfile
} from '../features/profile/profileStore';



import {
    Home
} from '../pages/Home/Home';



import {
    Profile
} from '../pages/Profile/Profile';






async function renderApp(){



    const app =
        document.querySelector(
            '#app'
        );



    if(!app)

        return;





    const profile =
        await initProfile();






    if(profile){


        app.innerHTML =
            Home();



    }
    else{


        app.innerHTML =
            Profile();



    }



}








export function initRouter(){



    renderApp();







    window.addEventListener(


        'profile:created',


        ()=>{


            setTimeout(()=>{


                renderApp();


            },50);



        }


    );









    window.addEventListener(


        'profile:open',


        ()=>{



            const app =
                document.querySelector(
                    '#app'
                );



            if(!app)

                return;





            app.innerHTML =
                Profile();



        }


    );



}