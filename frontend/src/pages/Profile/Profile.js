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





<div class="profile-header">


<img

class="profile-avatar"

src="
${
tgUser?.photo_url ||
oldProfile?.photo_url ||
'https://i.pravatar.cc/150'
}
"


>


<h1>

${
oldProfile
?
'Редактирование'
:
'Создание профиля'
}

</h1>


<p>

Как вас будут видеть другие

</p>


</div>







<div class="profile-field">


<label>
Имя
</label>


<input

id="profile-name"

placeholder="Ваше имя"

value="
${
oldProfile?.name ||
tgUser?.first_name ||
''
}
"

>


</div>







<div class="profile-field">


<label>
Возраст
</label>


<input

id="profile-age"

type="number"

placeholder="Возраст"

value="
${
oldProfile?.age ||
''
}
"

>


</div>








<label class="profile-label">

Пол

</label>



<div class="gender-box">


<button

class="gender-choice"

data-gender="male"

>

👨 Мужчина

</button>




<button

class="gender-choice"

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
'Создать профиль'
}

</button>






</div>


</main>



`;

}









function initProfile(){


if(profileInitialized)

return;



profileInitialized=true;







document

.querySelectorAll(
'[data-gender]'
)

.forEach(button=>{



button.onclick=()=>{



document

.querySelectorAll(
'[data-gender]'
)

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


try{



const tgUser =
getTelegramUser();




if(!tgUser){

alert(
'Telegram user not found'
);

return;

}






const user = await createUser({


telegram_id:

Number(
tgUser.telegram_id
),


first_name:

tgUser.first_name,


photo_url:

tgUser.photo_url || null,


language_code:

tgUser.language_code || 'ru'


});








const profileData = {


user_id:user.id,


name:

document

.querySelector(
'#profile-name'
)

.value,



age:

Number(

document

.querySelector(
'#profile-age'
)

.value

),



gender:selectedGender,


telegram_id:

Number(
tgUser.telegram_id
),


photo_url:

tgUser.photo_url || null


};








const old = await getProfileByUserId(

user.id

);




let profile;



if(old){


profile = await updateProfile(

old.id,

profileData

);


}

else{


profile = await createProfile(

profileData

);


}






saveProfile({


...user,


...profile,


photo_url:

tgUser.photo_url,


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
'Ошибка сохранения'
);



}



}

);


}