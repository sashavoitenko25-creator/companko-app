import './Home.css';

import { Header } from '../../components/Header';
import { Map } from '../../components/Map';
import { ActivityBar } from '../../components/ActivityBar';
import { FAB } from '../../components/FAB';
import { BottomSheet } from '../../components/BottomSheet';


export function Home(){

    setTimeout(initHomeEvents);


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

import { 
    setActivity,
    setDuration
} from '../../store/liveStore';



function initHomeEvents(){


    const button =
    document.querySelector('#live-button');


    const sheet =
    document.querySelector('.bottom-sheet');



    button?.addEventListener(
        'click',
        ()=>{

            sheet.classList.add(
                'bottom-sheet--open'
            );

        }
    );



    document
    .querySelectorAll('.activity-option')
    .forEach(button=>{


        button.addEventListener(
            'click',
            ()=>{


                document
                .querySelectorAll('.activity-option')
                .forEach(item=>
                    item.classList.remove(
                        'selected'
                    )
                );


                button.classList.add(
                    'selected'
                );


                setActivity(
                    button.dataset.activity
                );


            }
        );


    });



    document
    .querySelectorAll('.time-options button')
    .forEach(button=>{


        button.addEventListener(
            'click',
            ()=>{


                document
                .querySelectorAll('.time-options button')
                .forEach(item=>
                    item.classList.remove(
                        'selected'
                    )
                );


                button.classList.add(
                    'selected'
                );


                setDuration(
                    button.dataset.time
                );


            }
        );


    });


}