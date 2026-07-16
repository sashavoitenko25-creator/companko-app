import './UserMarker.css';


export function UserMarker(user){


    return `

        <div class="user-map-marker">


            <img 
                src="${user.photo}"
            />


            <div class="user-map-marker__live">
                ${user.icon}
            </div>


        </div>

    `;


}