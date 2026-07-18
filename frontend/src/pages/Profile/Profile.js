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

let selectedInterests = [];

let selectedActivity = null;



export function Profile(){


    setTimeout(initProfile);



    const tgUser =
    getTelegramUser();



    const oldProfile =
    getProfile();



    selectedGender =
    oldProfile?.gender || null;


    selectedInterests =
    oldProfile?.interests || [];


    selectedActivity =
    oldProfile?.favorite_activity || null;



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
'Редактирование профиля'
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



<h3>Пол</h3>


<div class="choice-group">


<button
class="choice ${
selectedGender === 'male'
?
'active'
:
''
}"
data-gender="male"
>
👨 Мужчина
</button>


<button
class="choice ${
selectedGender === 'female'
?
'active'
:
''
}"
data-gender="female"
>
👩 Женщина
</button>


</div>



<h3>Интересы</h3>


<div class="choice-group">


<button
class="choice interest ${
selectedInterests.includes('coffee')
?
'active'
:
''
}"
data-interest="coffee"
>
☕ Кофе
</button>


<button
class="choice interest ${
selectedInterests.includes('walk')
?
'active'
:
''
}"
data-interest="walk"
>
🚶 Прогулки
</button>


<button
class="choice interest ${
selectedInterests.includes('sport')
?
'active'
:
''
}"
data-interest="sport"
>
🏃 Спорт
</button>


<button
class="choice interest ${
selectedInterests.includes('games')
?
'active'
:
''
}"
data-interest="games"
>
🎮 Игры
</button>


</div>



<h3>Любимая активность</h3>


<div class="choice-group">


<button
class="choice activity ${
selectedActivity === 'coffee'
?
'active'
:
''
}"
data-activity="coffee"
>
☕ Кофе
</button>


<button
class="choice activity ${
selectedActivity === 'walk'
?
'active'
:
''
}"
data-activity="walk"
>
🚶 Гулять
</button>


<button
class="choice activity ${
selectedActivity === 'talk'
?
'active'
:
''
}"
data-activity="talk"
>
💬 Общаться
</button>


</div>



<input
id="profile-city"
placeholder="Город"
value="${
oldProfile?.city ||
''
}"
>



<textarea
id="profile-about"
placeholder="О себе"
>${

oldProfile?.about ||
''

}</textarea>



<button
id="profile-save"
class="save-button"
>
${
oldProfile
?
'Сохранить изменения'
:
'Продолжить'
}
</button>


</div>

</main>

`;

}



function initProfile(){


document
.querySelectorAll('[data-gender]')
.forEach(button=>{


button.onclick=()=>{


document
.querySelectorAll('[data-gender]')
.forEach(item=>

item.classList.remove(
'active'
)

);


button.classList.add(
'active'
);


selectedGender =
button.dataset.gender;


};


});





document
.querySelectorAll('.interest')
.forEach(button=>{


button.onclick=()=>{


button.classList.toggle(
'active'
);


const value =
button.dataset.interest;


if(selectedInterests.includes(value)){


selectedInterests =
selectedInterests.filter(
item=>item !== value
);


}
else{


selectedInterests.push(value);


}


};


});





document
.querySelectorAll('.activity')
.forEach(button=>{


button.onclick=()=>{


document
.querySelectorAll('.activity')
.forEach(item=>

item.classList.remove(
'active'
)

);


button.classList.add(
'active'
);


selectedActivity =
button.dataset.activity;


};


});





document
.querySelector('#profile-save')
?.addEventListener(

'click',

async ()=>{


const telegramUser =
getTelegramUser();



const userData = {


telegram_id:

telegramUser?.id ||

Date.now(),


first_name:

telegramUser?.first_name ||

document
.querySelector('#profile-name')
.value,


photo_url:

telegramUser?.photo_url ||

null,


language_code:

telegramUser?.language_code ||

'ru'


};



try {



const user =
await createUser(
userData
);



const existingProfile =
await getProfileByUserId(
user.id
);



const profileData = {


user_id:

user.id,


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

selectedGender,


city:

document
.querySelector('#profile-city')
.value,


about:

document
.querySelector('#profile-about')
.value,


interests:

selectedInterests,


favorite_activity:

selectedActivity


};





let profile;



if(existingProfile){


profile =
await updateProfile(
existingProfile.id,
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

    id: user.id,

    user_id: user.id

});





window.dispatchEvent(
new Event(
'profile:created'
)
);




}

catch(error){


console.error(
'Profile creation failed:',
error
);


alert(
'Ошибка создания профиля'
);


}



}

);


}