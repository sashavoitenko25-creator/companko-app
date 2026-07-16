import './Header.css';


import {
    ProfileButton
} from '../ProfileButton/ProfileButton';



export function Header(){


    setTimeout(initHeader);



    return `


<header class="header">


<div class="header-title">

    Companko

</div>



${ProfileButton()}



</header>


`;

}




function initHeader(){



document
.querySelector('#profile-button')
?.addEventListener(

'click',

()=>{


window.dispatchEvent(

new Event(
'profile:open'
)

);


}

);


}