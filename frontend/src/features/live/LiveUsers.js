import { LiveUser } from '../../components/LiveUser';

import { mockUsers } from './mockUsers';



export function LiveUsers(){


    return `


    <div class="live-users">


        ${
            mockUsers
            .map(user=>
                LiveUser(user)
            )
            .join('')
        }


    </div>


    `;


}