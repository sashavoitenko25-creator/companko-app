import './BottomSheet.css';


export function BottomSheet(){

    return `

    <div class="bottom-sheet">


        <div class="bottom-sheet__handle"></div>


        <h2 class="bottom-sheet__title">
            Начать LIVE
        </h2>


        <p class="bottom-sheet__subtitle">
            Выберите активность
        </p>


        <div class="bottom-sheet__activities">


            <button 
                class="activity-option"
                data-activity="drink"
            >
                🍻
                <span>
                    Выпить
                </span>
            </button>



            <button 
                class="activity-option"
                data-activity="coffee"
            >
                ☕
                <span>
                    Кофе
                </span>
            </button>



            <button 
                class="activity-option"
                data-activity="walk"
            >
                🚶
                <span>
                    Погулять
                </span>
            </button>



            <button 
                class="activity-option"
                data-activity="chat"
            >
                💬
                <span>
                    Пообщаться
                </span>
            </button>


        </div>



        <p class="bottom-sheet__subtitle">
            Время LIVE
        </p>



        <div class="time-options">


            <button data-time="15">
                15 мин
            </button>


            <button data-time="30">
                30 мин
            </button>


            <button data-time="60">
                60 мин
            </button>


        </div>



        <button class="bottom-sheet__start">

            Начать LIVE

        </button>


    </div>

    `;

}