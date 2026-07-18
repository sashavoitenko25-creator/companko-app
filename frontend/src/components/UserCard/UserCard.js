import './UserCard.css';



export function UserCard(user){



    const minutes = user.duration || 60;



    return `



<div class="user-card">





    <div class="user-card__top">





        <div class="user-card__avatar">



            <img

            src="${
                user.photo ||
                user.photo_url ||
                'https://i.pravatar.cc/150'
            }"


            >



        </div>





        <div class="user-card__main">



            <h3>


                ${
                    user.name ||
                    'Гость'
                }

                ${
                    user.age
                    ?
                    ', ' + user.age
                    :
                    ''
                }


            </h3>





            <div class="user-card__activity">



                ${
                    user.icon ||
                    '🔥'
                }


                ${
                    user.activity ||
                    'LIVE'
                }



            </div>




        </div>





    </div>









    <div class="user-card__info">





        <div>


            📍

            ${
                user.distance ||
                0
            }

            м



        </div>





        <div>


            🔥 LIVE


        </div>






        <div>


            ⏱ Активен ещё


            ${minutes}


            мин



        </div>




    </div>







    <button

    class="user-card__route"

    data-user-id="${user.id || user.user_id}"

    >


        🧭 Построить маршрут


    </button>






</div>



`;

}