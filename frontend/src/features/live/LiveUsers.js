import { LiveUser } from '../../components/LiveUser';


import {
    getLiveUsers
} from '../../services/supabase/liveService';



let initialized = false;








export function LiveUsers(){



    setTimeout(()=>{



        if(initialized)

            return;



        initialized = true;



        loadUsers();



        setInterval(

            loadUsers,

            10000

        );



    },0);







    return `



        <div class="live-users"></div>



    `;



}













async function loadUsers(){



    try{



        const users = await getLiveUsers();



        window.liveUsers = users;





        const container =

        document.querySelector(

            '.live-users'

        );





        if(!container)

            return;







        container.innerHTML = users.map(user=>{



            return LiveUser({



                id:user.user_id,



                name:user.name || 'Гость',



                age:user.age || '',



                photo:

                user.photo ||


                `https://i.pravatar.cc/150?u=${user.user_id}`,



                activity:

                user.activity || 'LIVE',



                icon:

                user.icon || '📍',



                distance:

                user.distance || 0



            });



        }).join('');





        attachLiveUserEvents();



    }





    catch(error){



        console.error(

            'Load live users error:',

            error

        );



    }



}













function attachLiveUserEvents(){



    document

    .querySelectorAll('.live-user')

    .forEach(card=>{





        card.onclick = ()=>{



            // отключено специально

            // карточка открывается только

            // при клике по аватару на карте



            return;



        };



    });



}