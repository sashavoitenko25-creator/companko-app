import './LiveModal.css';

import {
    setActivity,
    setDuration
} from '../store/liveStore';

let initialized = false;

export function LiveModal() {

    setTimeout(() => {

        if (initialized) return;

        initialized = true;

        initLiveModal();

    }, 0);

    return `

<div
    id="live-modal"
    class="live-modal">

    <div class="live-modal__box">

        <h2>
            Начать LIVE
        </h2>

        <p>
            Чем хотите заняться?
        </p>

        <div class="live-options">

            <button
                class="live-option active"
                data-activity="beer">

                <img
                    src="/activities/alcohol.png"
                    class="live-option__image"
                    alt="Выпить"
                />

                <div class="live-option-text">

                    <strong>
                        Выпить
                    </strong>

                    <span>
                        (алкоголь)
                    </span>

                </div>

            </button>


            <button
                class="live-option"
                data-activity="coffee">

                <img
                    src="/activities/coffee.png"
                    class="live-option__image"
                    alt="Кофе"
                />

                <div class="live-option-text">

                    <strong>
                        Выпить
                    </strong>

                    <span>
                        (кофе)
                    </span>

                </div>

            </button>


            <button
                class="live-option"
                data-activity="walk">

                <img
                    src="/activities/walking.png"
                    class="live-option__image"
                    alt="Погулять"
                />

                <div class="live-option-text">

                    <strong>
                        Гулять
                    </strong>

                </div>

            </button>


            <button
                class="live-option"
                data-activity="chat">

                <img
                    src="/activities/talking.png"
                    class="live-option__image"
                    alt="Общаться"
                />

                <div class="live-option-text">

                    <strong>
                        Общаться
                    </strong>

                </div>

            </button>

        </div>


        <p>
            Сколько времени?
        </p>


        <div class="time-options">

            <button
                data-time="15">
                15 мин
            </button>

            <button
                data-time="30">
                30 мин
            </button>

            <button
                class="active"
                data-time="60">
                60 мин
            </button>

        </div>


        <button
            id="start-live"
            class="start-live">

            Начать LIVE

        </button>

    </div>

</div>

`;

}


function initLiveModal() {

    console.log("LIVE MODAL INIT");

    setActivity("beer");

    setDuration(60);


    document
        .querySelectorAll(".live-option")
        .forEach(button => {

            button.onclick = () => {

                document
                    .querySelectorAll(".live-option")
                    .forEach(item => {

                        item.classList.remove("active");

                    });

                button.classList.add("active");

                setActivity(
                    button.dataset.activity
                );

            };

        });


    document
        .querySelectorAll(".time-options button")
        .forEach(button => {

            button.onclick = () => {

                document
                    .querySelectorAll(".time-options button")
                    .forEach(item => {

                        item.classList.remove("active");

                    });

                button.classList.add("active");

                setDuration(
                    Number(button.dataset.time)
                );

            };

        });


    const modal =
        document.querySelector("#live-modal");


    if (modal) {

        modal.onclick = (event) => {

            if (event.target === modal) {

                closeLiveModal();

            }

        };

    }

}


export function openLiveModal() {

    const modal =
        document.querySelector("#live-modal");

    if (modal) {

        modal.classList.add("open");

    }

}


export function closeLiveModal() {

    const modal =
        document.querySelector("#live-modal");

    if (modal) {

        modal.classList.remove("open");

    }

}