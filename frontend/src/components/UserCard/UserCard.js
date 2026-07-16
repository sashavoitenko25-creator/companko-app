import './UserCard.css';


export function UserCard(user){


    return `


    <div class="user-card">


        <div class="user-card__avatar">


            <img 
            src="${user.photo}"
            />


        </div>



        <div class="user-card__content">


            <h3>
                ${user.name}, ${user.age}
            </h3>



            <p>
                ${user.icon}
                ${user.activity}
            </p>



            <span>
                📍 ${user.distance} м
            </span>



            <span class="user-card__online">

                🟢 LIVE

            </span>


        </div>



        <button 
        class="user-card__route"
        >

            Маршрут

        </button>


    </div>


    `;

}