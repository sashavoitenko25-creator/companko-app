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




    try{


        await initProfile();



        const profile =
            getProfile();





        console.log(
            'ROUTER PROFILE:',
            profile
        );





        if(profile){


            app.innerHTML =
                Home();



        }
        else{


            app.innerHTML =
                Profile();



        }




    }

    catch(error){


        console.error(
            'RENDER APP ERROR:',
            error
        );



        app.innerHTML = `

        <div style="
        color:white;
        padding:30px;
        ">
        Ошибка загрузки приложения
        </div>

        `;


    }


}









export function initRouter(){



    renderApp();





    window.addEventListener(

        'profile:created',

        ()=>{


            console.log(
                'PROFILE CREATED EVENT'
            );



            setTimeout(()=>{


                renderApp();



            },100);



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