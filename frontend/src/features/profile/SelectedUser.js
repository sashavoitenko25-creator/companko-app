import { UserCard } from '../../components/UserCard';



export function SelectedUser(){


    return `

        <div id="selected-user"></div>

    `;

}



export function showUserCard(user){


    const container =
    document.querySelector(
        '#selected-user'
    );


    if(!container) return;


    container.innerHTML =
    UserCard(user);


}