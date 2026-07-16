import './ActivityBar.css';

import { Chip } from '../Chip';


export function ActivityBar(){

    return `

        <div class="activity-bar">

            ${Chip({
                icon:'🔥',
                text:'LIVE',
                active:true
            })}


            ${Chip({
                icon:'☕',
                text:'Кофе'
            })}


            ${Chip({
                icon:'🚶',
                text:'Гулять'
            })}


            ${Chip({
                icon:'💬',
                text:'Общение'
            })}


            ${Chip({
                icon:'🍻',
                text:'Выпить'
            })}


        </div>

    `;

}