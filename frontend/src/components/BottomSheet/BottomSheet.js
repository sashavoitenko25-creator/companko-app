import './BottomSheet.css';


export function BottomSheet(){

    return `

    <div class="bottom-sheet">

        <div class="bottom-sheet__handle"></div>


        <h2 class="bottom-sheet__title">
            Начать LIVE
        </h2>


        <p class="bottom-sheet__subtitle">
            Что хочешь сделать?
        </p>



        <div class="bottom-sheet__activities">


            <button class="activity-option">
                🍻
                <span>
                    Выпить
                </span>
            </button>


            <button class="activity-option">
                ☕
                <span>
                    Кофе
                </span>
            </button>


            <button class="activity-option">
                🚶
                <span>
                    Погулять
                </span>
            </button>


            <button class="activity-option">
                💬
                <span>
                    Пообщаться
                </span>
            </button>


        </div>



        <p class="bottom-sheet__subtitle">
            Время
        </p>



        <div class="time-options">


            <button>
                15 минут
            </button>


            <button>
                30 минут
            </button>


            <button>
                60 минут
            </button>


        </div>



        <button class="bottom-sheet__start">

            Начать LIVE

        </button>


    </div>

    `;

}