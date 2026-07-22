import './BottomSheet.css';



export function BottomSheet(){


    return `



    <div class="bottom-sheet">



        <div class="bottom-sheet__box">



            <h2>

                Начать LIVE

            </h2>





            <h3>

                Что делаешь?

            </h3>





            <div class="activity-options">



                <button 
                class="activity-option"
                data-activity="coffee">

                    ☕

                    Кофе

                </button>





                <button 
                class="activity-option"
                data-activity="walk">

                    🚶

                    Прогулка

                </button>






                <button 
                class="activity-option"
                data-activity="talk">

                    💬

                    Общение

                </button>





                <button 
                class="activity-option"
                data-activity="sport">

                    🏃

                    Спорт

                </button>



            </div>







            <h3>

                Время LIVE

            </h3>





            <div class="time-options">



                <button data-time="30">

                    30 мин

                </button>



                <button data-time="60">

                    1 час

                </button>



                <button data-time="120">

                    2 часа

                </button>



            </div>








            <button 
            class="bottom-sheet__start">


                Запустить LIVE


            </button>




        </div>



    </div>


    `;


}