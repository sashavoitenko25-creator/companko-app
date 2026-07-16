import './Home.css';

import { Header } from '../../components/Header';
import { Map } from '../../components/Map';
import { ActivityBar } from '../../components/ActivityBar';
import { FAB } from '../../components/FAB';
import { BottomSheet } from '../../components/BottomSheet';

import { LiveUsers } from '../../features/live/LiveUsers';

import '../../features/live/live.css';


import {
    SelectedUser,
    showUserCard
} from '../../features/profile/SelectedUser';


import {
    RoutePanel,
    showRoute
} from '../../features/route/RoutePanel';


import '../../features/route/route.css';



import {
    setActivity,
    setDuration
} from '../../store/liveStore';



let selectedUser = null;



export function Home(){


    setTimeout(initHomeEvents);



    return `


        <main class="home">


            ${Map()}


            ${Header()}


            ${ActivityBar()}


            ${LiveUsers()}


            ${FAB()}


            ${BottomSheet()}


            ${SelectedUser()}


            ${RoutePanel()}


        </main>


    `;


}







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
                .forEach(item=>{


                    item.classList.remove(
                        'selected'
                    );


                });



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
                .forEach(item=>{


                    item.classList.remove(
                        'selected'
                    );


                });



                button.classList.add(
                    'selected'
                );



                setDuration(
                    button.dataset.time
                );


            }

        );


    });







    window.addEventListener(

        'user:selected',

        (event)=>{


            selectedUser =
            event.detail;



            showUserCard(
                selectedUser
            );


        }

    );








    document.addEventListener(

        'click',

        (event)=>{


            if(
                event.target.classList.contains(
                    'user-card__route'
                )
            ){


                if(selectedUser){

                    showRoute(
                        selectedUser
                    );

                }


            }


        }

    );



}