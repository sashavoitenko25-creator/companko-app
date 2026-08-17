import './LiveModal.css';

import {
    setActivity,
    setDuration
} from '../store/liveStore';

import {
    getProfile
} from '../features/profile/profileStore';


let initialized = false;


/* ========================================
   КАРТИНКИ АКТИВНОСТЕЙ
======================================== */

const ACTIVITY_IMAGES = {

    male: {
        beer: '/activities/alcohol-male.png',
        coffee: '/activities/coffee-male.png',
        walk: '/activities/walking-male.png',
        chat: '/activities/talking-male.png'
    },

    female: {
        beer: '/activities/alcohol-female.png',
        coffee: '/activities/coffee-female.png',
        walk: '/activities/walking-female.png',
        chat: '/activities/talking-female.png'
    }

};


/* ========================================
   ПОЛЬЗОВАТЕЛЯ
======================================== */

function getUserGender() {

    const profile = getProfile();

    console.log(
        'LIVE PROFILE:',
        profile
    );

    console.log(
        'LIVE GENDER:',
        profile?.gender
    );


    if (profile?.gender === 'female') {

        return 'female';

    }


    return 'male';

}


/* ========================================
   LIVE MODAL
======================================== */

export function LiveModal() {

    setTimeout(() => {

        if (initialized) {
            return;
        }

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


            <!-- АЛКОГОЛЬ -->

            <button
                class="live-option active"
                data-activity="beer">

                <img
                    id="live-image-beer"
                    src="/activities/alcohol-male.png"
                    class="live-option__icon"
                    alt=""
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


            <!-- КОФЕ -->

            <button
                class="live-option"
                data-activity="coffee">

                <img
                    id="live-image-coffee"
                    src="/activities/coffee-male.png"
                    class="live-option__icon"
                    alt=""
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


            <!-- ГУЛЯТЬ -->

            <button
                class="live-option"
                data-activity="walk">

                <img
                    id="live-image-walk"
                    src="/activities/walking-male.png"
                    class="live-option__icon"
                    alt=""
                />

                <div class="live-option-text">

                    <strong>
                        Гулять
                    </strong>

                </div>

            </button>


            <!-- ОБЩАТЬСЯ -->

            <button
                class="live-option"
                data-activity="chat">

                <img
                    id="live-image-chat"
                    src="/activities/talking-male.png"
                    class="live-option__icon"
                    alt=""
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


/* ========================================
   ИНИЦИАЛИЗАЦИЯ
======================================== */

function initLiveModal() {

    console.log(
        'LIVE MODAL INIT'
    );


    setActivity('beer');

    setDuration(60);


    /*
     * Получаем пол из текущего профиля
     */

    const gender =
        getUserGender();


    console.log(
        'LIVE USER GENDER:',
        gender
    );


    const images =
        ACTIVITY_IMAGES[gender];


    /*
     * Меняем картинки
     */

    const beerImage =
        document.querySelector(
            '#live-image-beer'
        );

    const coffeeImage =
        document.querySelector(
            '#live-image-coffee'
        );

    const walkImage =
        document.querySelector(
            '#live-image-walk'
        );

    const chatImage =
        document.querySelector(
            '#live-image-chat'
        );


    if (beerImage) {

        beerImage.src =
            images.beer;

    }


    if (coffeeImage) {

        coffeeImage.src =
            images.coffee;

    }


    if (walkImage) {

        walkImage.src =
            images.walk;

    }


    if (chatImage) {

        chatImage.src =
            images.chat;

    }


    /* ====================================
       ВЫБОР АКТИВНОСТИ
    ==================================== */

    document
        .querySelectorAll('.live-option')
        .forEach(button => {

            button.onclick = () => {

                document
                    .querySelectorAll(
                        '.live-option'
                    )
                    .forEach(item => {

                        item.classList.remove(
                            'active'
                        );

                    });


                button.classList.add(
                    'active'
                );


                setActivity(
                    button.dataset.activity
                );

            };

        });


    /* ====================================
       ВЫБОР ВРЕМЕНИ
    ==================================== */

    document
        .querySelectorAll(
            '.time-options button'
        )
        .forEach(button => {

            button.onclick = () => {

                document
                    .querySelectorAll(
                        '.time-options button'
                    )
                    .forEach(item => {

                        item.classList.remove(
                            'active'
                        );

                    });


                button.classList.add(
                    'active'
                );


                setDuration(
                    Number(
                        button.dataset.time
                    )
                );

            };

        });


    /* ====================================
       ЗАКРЫТИЕ ПО ФОНУ
    ==================================== */

    const modal =
        document.querySelector(
            '#live-modal'
        );


    if (modal) {

        modal.onclick = event => {

            if (
                event.target === modal
            ) {

                closeLiveModal();

            }

        };

    }

}


/* ========================================
   ОТКРЫТЬ
======================================== */

export function openLiveModal() {

    const modal =
        document.querySelector(
            '#live-modal'
        );


    if (modal) {

        modal.classList.add(
            'open'
        );

    }

}


/* ========================================
   ЗАКРЫТЬ
======================================== */

export function closeLiveModal() {

    const modal =
        document.querySelector(
            '#live-modal'
        );


    if (modal) {

        modal.classList.remove(
            'open'
        );

    }

}