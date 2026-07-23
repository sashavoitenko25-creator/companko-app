import './ProfileButton.css';


import {
    getProfile
} from '../../features/profile/profileStore';


import {
    getTelegramUser
} from '../../services/telegram/telegramService';






export function ProfileButton(){



    const profile = getProfile();


    const telegramUser = getTelegramUser();





    const photo =

        profile?.photo_url ||

        profile?.photo ||

        telegramUser?.photo_url ||

        '';









    setTimeout(()=>{



        const button = document.querySelector(

            '#profile-button'

        );



        if(button){



            button.onclick = ()=>{



                window.dispatchEvent(

                    new Event(

                        'profile:open'

                    )

                );


            };


        }



    },0);









    return `



        <button

            id="profile-button"

            class="profile-button">





            ${
                photo

                ?

                `

                <img

                    src="${photo}"

                    alt="profile"

                >

                `


                :


                `

                <div class="profile-button__empty">

                    👤

                </div>

                `

            }





        </button>



    `;



}