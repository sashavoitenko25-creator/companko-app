import './LiveUser.css';


export function LiveUser(user){


    return `

        <div class="live-user">


            <div class="live-user__avatar">

                <img 
                src="${user.photo}"
                />

            </div>



            <div class="live-user__info">


                <div class="live-user__name">

                    ${user.name}, ${user.age}

                </div>



                <div class="live-user__activity">

                    ${user.icon}
                    ${user.activity}

                </div>



                <div class="live-user__distance">

                    ${user.distance} м

                </div>


            </div>


        </div>

    `;

}