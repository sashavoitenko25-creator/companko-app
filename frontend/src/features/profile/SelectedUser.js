import './SelectedUser.css';


let timer = null;




export function SelectedUser(){


    return `

    <div
    id="selected-user"
    class="selected-user hidden">

    </div>

    `;

}








export function showUserCard(user){



    const container =
        document.querySelector(
            '#selected-user'
        );



    if(!container)
        return;




    if(timer){

        clearInterval(timer);

        timer=null;

    }







    const isMine =
        user.own === true ||
        user.isMine === true;





    console.log(
        'OPEN CARD USER',
        user
    );






    container.innerHTML = `



<div class="profile-live-card">



<div class="profile-live-top">


<img

class="profile-live-avatar"

src="${
user.photo ||
user.photo_url ||
'https://i.pravatar.cc/150'
}"

/>



<div class="profile-live-info">


<div class="profile-live-name">

${
user.name ||
'Гость'
}

</div>



<div class="profile-live-status">

🟢 LIVE

</div>


</div>



</div>







<div class="profile-live-activity">


${

user.icon ||
'🔥'

}


${

user.activity ||
'Активность'

}



</div>








<div class="profile-live-bottom">






<div class="profile-live-time">



<div class="live-circle">



<svg>



<circle

class="circle-bg"

cx="40"

cy="40"

r="34"

/>



<circle

id="circle-progress"

class="circle-progress"

cx="40"

cy="40"

r="34"

/>



</svg>




<div

id="live-time-text"

class="live-time-text">

</div>



</div>



</div>









<div class="profile-live-actions">



${
isMine

?

`

<div class="profile-live-owner">

Ваш LIVE

</div>

`

:

`

<button

class="user-card__route">

🧭

</button>

`

}



</div>





</div>






</div>



`;





container.classList.remove(
'hidden'
);







startCountdown(
    user.expires_at,
    user.duration
);





}









function startCountdown(
    expiresAt,
    duration
){



const text =
document.querySelector(
'#live-time-text'
);



const circle =
document.querySelector(
'#circle-progress'
);





if(!text || !circle)
    return;






if(!expiresAt){


console.warn(
'NO expires_at'
);


return;

}







const end =
new Date(
expiresAt
).getTime();





const total =
duration
?
duration * 60
:
3600;





const radius=34;


const circumference =
2 *
Math.PI *
radius;



circle.style.strokeDasharray =
circumference;










function update(){



const now =
Date.now();



let left =
Math.floor(
(end-now)/1000
);






if(left < 0)

left=0;







const min =
Math.floor(
left/60
);



const sec =
left%60;





text.innerHTML =

min +
':' +
String(sec)
.padStart(
2,
'0'
);







const progress =
left /
total;







circle.style.strokeDashoffset =

circumference -

(
circumference *
progress
);






if(left<=0){



clearInterval(timer);

timer=null;



}



}






update();





timer=setInterval(

update,

1000

);



}











export function hideUserCard(){



if(timer){

clearInterval(timer);

timer=null;

}





const container =
document.querySelector(
'#selected-user'
);



if(container)

container.classList.add(
'hidden'
);



}





window.addEventListener(

'ui:close-all',

()=>{


hideUserCard();


}

);