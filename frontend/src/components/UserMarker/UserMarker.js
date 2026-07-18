import './UserMarker.css';


export function UserMarker(user){


    return `


<div class="user-marker">


    <div class="user-marker__circle">


        <img

        src="${
            user.photo ||
            user.photo_url ||
            'https://i.pravatar.cc/150'
        }"

        alt="avatar"


        >


    </div>



    <div class="user-marker__badge">


        🔥 LIVE


    </div>



</div>


`;

}