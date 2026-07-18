export function ActivityTabs(){


    setTimeout(initActivityTabs);



    return `


        <div class="activity-tabs">


            <button

                class="activity-tab active"

                data-activity="Выпить">

                🍻 Выпить

            </button>




            <button

                class="activity-tab"

                data-activity="Кофе">

                ☕ Кофе

            </button>




            <button

                class="activity-tab"

                data-activity="Гулять">

                🚶 Гулять

            </button>




            <button

                class="activity-tab"

                data-activity="Общаться">

                💬 Общаться

            </button>



        </div>


    `;

}







function initActivityTabs(){


    const buttons = document.querySelectorAll(

        '.activity-tab'

    );



    buttons.forEach(button=>{


        button.onclick = ()=>{



            buttons.forEach(item=>{


                item.classList.remove(

                    'active'

                );


            });



            button.classList.add(

                'active'

            );





            window.dispatchEvent(


                new CustomEvent(

                    'activity:selected',

                    {

                        detail:

                        button.dataset.activity

                    }

                )


            );



        };


    });



}