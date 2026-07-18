import {
    SelectedUser
} from '../../components/SelectedUser';

let selectedUser = null;

export function initSelectedUserEvents(){

    window.addEventListener(

        'user:selected',

        (event)=>{

            selectedUser = event.detail;

            const container = document.querySelector(
                '#selected-user-container'
            );

            if(!container)
                return;

            container.innerHTML = SelectedUser(
                selectedUser
            );

            initRouteButton();

        }

    );

}

function initRouteButton(){

    const button = document.querySelector(
        '.selected-user__button'
    );

    if(!button)
        return;

    button.onclick = ()=>{

        if(!selectedUser)
            return;

        window.dispatchEvent(

            new CustomEvent(

                'route:started',

                {

                    detail:selectedUser

                }

            )

        );

    };

}