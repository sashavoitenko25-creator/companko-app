import './Home.css';

import { Header } from '../../components/Header';
import { Map } from '../../components/Map';
import { ActivityBar } from '../../components/ActivityBar';
import { FAB } from '../../components/FAB';
import { BottomSheet } from '../../components/BottomSheet';


export function Home(){

    setTimeout(initLiveButton);


    return `

        <main class="home">


            ${Map()}


            ${Header()}


            ${ActivityBar()}


            ${FAB()}


            ${BottomSheet()}


        </main>

    `;

}



function initLiveButton(){


    const button =
    document.querySelector('#live-button');


    const sheet =
    document.querySelector('.bottom-sheet');


    if(!button || !sheet) return;



    button.addEventListener(
        'click',
        ()=>{

            sheet.classList.add(
                'bottom-sheet--open'
            );

        }
    );


}