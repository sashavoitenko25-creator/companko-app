import './ProfileButton.css';


import {
    getProfile
} from '../../features/profile/profileStore';



export function ProfileButton(){


    const profile =
    getProfile();



    return `


    <button
    id="profile-button"
    class="profile-button"
    >


        <img

        src="${
            profile?.photo ||
            'https://i.pravatar.cc/100'
        }"

        >


    </button>


    `;


}