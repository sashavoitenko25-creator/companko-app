import './Profile.css';


import {
    saveProfile,
    getProfile
} from '../../features/profile/profileStore';


import {
    getTelegramUser
} from '../../services/telegram/telegramService';



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
    oldProfile?.activity || null;





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





<h3>
Интересы
</h3>


<div class="choice-group">


<button 
class="choice interest"
data-interest="coffee"
>
☕ Кофе
</button>


<button 
class="choice interest"
data-interest="walk"
>
🚶 Прогулки
</button>


<button 
class="choice interest"
data-interest="sport"
>
🏃 Спорт
</button>


<button 
class="choice interest"
data-interest="games"
>
🎮 Игры
</button>


</div>





<h3>
Активность
</h3>


<div class="choice-group">


<button
class="choice activity"
data-activity="coffee"
>
☕ Кофе
</button>


<button
class="choice activity"
data-activity="walk"
>
🚶 Гулять
</button>


<button
class="choice activity"
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





document
.querySelectorAll('[data-gender]')
.forEach(button=>{


button.onclick=()=>{


document
.querySelectorAll('[data-gender]')
.forEach(
b=>b.classList.remove('active')
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



if(
selectedInterests.includes(value)
){

selectedInterests =
selectedInterests.filter(
item=>item!==value
);


}else{


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
.forEach(
b=>b.classList.remove('active')
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

()=>{


const data={


name:
document.querySelector('#profile-name').value,


age:
document.querySelector('#profile-age').value,


gender:
selectedGender,


city:
document.querySelector('#profile-city').value,


about:
document.querySelector('#profile-about').value,


interests:
selectedInterests,


activity:
selectedActivity


};




saveProfile(data);




window.dispatchEvent(

new Event(
'profile:created'
)

);


}

);


}