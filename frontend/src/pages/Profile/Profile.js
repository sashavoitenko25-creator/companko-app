import './Profile.css';


import {
    saveProfile
} from '../../features/profile/profileStore';



import {
    getTelegramUser
} from '../../services/telegram/telegramService';





export function Profile(){


    setTimeout(initProfile);



    const tgUser =
    getTelegramUser();



    return `


    <main class="profile-page">



        <div class="profile-card">



            <img

            class="profile-avatar"

            src="${
                tgUser?.photo_url ||
                'https://i.pravatar.cc/150'
            }"

            >




            <h1>

                Создай профиль

            </h1>




            <input

            id="profile-name"

            placeholder="Имя"

            value="${
                tgUser?.first_name || ''
            }"

            >




            <input

            id="profile-age"

            type="number"

            placeholder="Возраст"

            >





            <select id="profile-gender">


                <option value="">

                    Пол

                </option>


                <option value="male">

                    Мужчина

                </option>


                <option value="female">

                    Женщина

                </option>


            </select>






            <input

            id="profile-city"

            placeholder="Город"

            >





            <textarea

            id="profile-about"

            placeholder="О себе"

            ></textarea>






            <input

            id="profile-interest"

            placeholder="Интересы"

            >






            <button

            id="profile-save"

            >

                Продолжить

            </button>




        </div>


    </main>


    `;


}








function initProfile(){



    const button =

    document.querySelector(
        '#profile-save'
    );



    button?.addEventListener(

        'click',

        ()=>{



            const profile = {


                name:

                document.querySelector(
                    '#profile-name'
                ).value,



                age:

                document.querySelector(
                    '#profile-age'
                ).value,



                gender:

                document.querySelector(
                    '#profile-gender'
                ).value,



                city:

                document.querySelector(
                    '#profile-city'
                ).value,



                about:

                document.querySelector(
                    '#profile-about'
                ).value,



                interests:

                document.querySelector(
                    '#profile-interest'
                ).value


            };





            saveProfile(
                profile
            );




            window.dispatchEvent(

                new Event(
                    'profile:created'
                )

            );


        }

    );


}