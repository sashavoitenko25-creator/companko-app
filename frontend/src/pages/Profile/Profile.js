import './Profile.css';


import {
    saveProfile,
    getProfile
} from '../../features/profile/profileStore';


import {
    getTelegramUser
} from '../../services/telegram/telegramService';


import {
    createUser
} from '../../services/supabase/userService';


import {
    createProfile,
    getProfileByUserId,
    updateProfile
} from '../../services/supabase/profileService';



let selectedGender = null;

let profileInitialized = false;





export function Profile(){


    setTimeout(
        initProfile,
        0
    );



    const tgUser =
    getTelegramUser();



    const oldProfile =
    getProfile();



    selectedGender =
    oldProfile?.gender || null;




    return `


<main class="profile-page">


<div class="profile-card">



<img

class="profile-avatar"

src="${
tgUser?.photo_url ||
oldProfile?.photo_url ||
'https://i.pravatar.cc/150'
}"

>



<h1>

${
oldProfile
?
'Редактирование'
:
'Создай профиль'
}

</h1>




<input

id="profile-name"

placeholder="Имя"

value="${
oldProfile?.name ||
tgUser?.first_name ||
''
}"

>




<input

id="profile-age"

type="number"

placeholder="Возраст"

value="${
oldProfile?.age ||
''
}"

>




<h3>
Пол
</h3>



<div class="choice-group">


<button

class="choice"

data-gender="male"

>

👨 Мужчина

</button>




<button

class="choice"

data-gender="female"

>

👩 Женщина

</button>


</div>






<button

id="profile-save"

class="save-button"

>

${
oldProfile
?
'Сохранить'
:
'Продолжить'
}

</button>




</div>


</main>


`;

}







function initProfile(){


if(profileInitialized)

return;


profileInitialized = true;





document

.querySelectorAll('[data-gender]')

.forEach(button=>{



button.onclick=()=>{



document

.querySelectorAll('[data-gender]')

.forEach(item=>{

item.classList.remove(
'active'
);

});




button.classList.add(
'active'
);



selectedGender =
button.dataset.gender;



};


});









document

.querySelector('#profile-save')

?.addEventListener(

'click',

async()=>{


const telegramUser =
getTelegramUser();




if(!telegramUser?.telegram_id){

alert(
'Telegram user not found'
);

return;

}




try{



const userData={


telegram_id:

Number(
telegramUser.telegram_id
),


first_name:

document

.querySelector('#profile-name')

.value,


photo_url:

telegramUser.photo_url || null,


language_code:

telegramUser.language_code || 'ru'


};





const user =

await createUser(
userData
);






const profileData={


user_id:user.id,


telegram_id:

Number(
telegramUser.telegram_id
),


photo_url:

telegramUser.photo_url || null,


name:

document

.querySelector('#profile-name')

.value,



age:

Number(

document

.querySelector('#profile-age')

.value

),



gender:

selectedGender



};







const existing =

await getProfileByUserId(

user.id

);




let profile;



if(existing){


profile =

await updateProfile(

existing.id,

profileData

);


}

else{


profile =

await createProfile(

profileData

);


}







saveProfile({

...userData,

...profile,

id:user.id,

user_id:user.id


});







window.dispatchEvent(

new Event(

'profile:created'

)

);





}

catch(error){


console.error(

'PROFILE ERROR',

error

);


alert(

'Ошибка сохранения профиля'

);


}




}

);



}