import './LiveUser.css';



export function LiveUser(user){


    return `


    <div 
        class="live-user"
        data-id="${user.id}"
    >



        <div class="live-user__avatar">


            <img

            src="${user.photo}"

            >


        </div>





        <div class="live-user__info">


            <div class="live-user__name">

                ${user.name}
                ${user.age ? ', ' + user.age : ''}

            </div>





            <div class="live-user__activity">


                ${user.icon || '🔥'}

                ${user.activity}


            </div>





            <div class="live-user__distance">


                📍 ${user.distance || 0} м


            </div>



        </div>




    </div>


    `;


}