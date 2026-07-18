import './ProfileButton.css';


import {
    getProfile
} from '../../features/profile/profileStore';






export function ProfileButton(){



    const profile = getProfile();





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



    });







    return `



        <button

            id="profile-button"

            class="profile-button">



            <img

                src="${

                    profile?.photo ||

                    'https://i.pravatar.cc/150'

                }"

                alt="profile"

            >



        </button>



    `;



}