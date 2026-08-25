import './LiveModal.css';

import {
    setActivity,
    setDuration
} from '../store/liveStore';

import {
    getProfile
} from '../features/profile/profileStore';

import {
    t
} from '../i18n';

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

        <h2 id="live-modal-title">
            ${t('start_live_title')}
        </h2>

        <p id="live-modal-what">
            ${t('what_to_do')}
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
                    <strong id="live-text-beer">
                        ${t('activity_beer')}
                    </strong>
                    <span id="live-sub-beer">
                        ${t('activity_beer_sub')}
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
                    <strong id="live-text-coffee">
                        ${t('activity_coffee')}
                    </strong>
                    <span id="live-sub-coffee">
                        ${t('activity_coffee_sub')}
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
                    <strong id="live-text-walk">
                        ${t('activity_walk')}
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
                    <strong id="live-text-chat">
                        ${t('activity_chat')}
                    </strong>
                </div>

            </button>

        </div>

        <p id="live-modal-how-long">
            ${t('how_long')}
        </p>

        <div class="time-options">

            <button
                data-time="15"
                id="live-time-15">
                ${t('min_15')}
            </button>

            <button
                data-time="30"
                id="live-time-30">
                ${t('min_30')}
            </button>

            <button
                class="active"
                data-time="60"
                id="live-time-60">
                ${t('min_60')}
            </button>

        </div>

        <button
            id="start-live"
            class="start-live">
            ${t('start_live_btn')}
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

    const gender =
        getUserGender();

    console.log(
        'LIVE USER GENDER:',
        gender
    );

    const images =
        ACTIVITY_IMAGES[gender];

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

    // Обновление текстов при смене языка
    window.addEventListener(
        'language:changed',
        () => {
            updateLiveModalTexts();
        }
    );

}

/* ========================================
   ОБНОВЛЕНИЕ ТЕКСТОВ
======================================== */

function updateLiveModalTexts() {

    const setText = (id, key) => {
        const el = document.querySelector(id);
        if (el) el.textContent = t(key);
    };

    setText('#live-modal-title', 'start_live_title');
    setText('#live-modal-what', 'what_to_do');
    setText('#live-text-beer', 'activity_beer');
    setText('#live-sub-beer', 'activity_beer_sub');
    setText('#live-text-coffee', 'activity_coffee');
    setText('#live-sub-coffee', 'activity_coffee_sub');
    setText('#live-text-walk', 'activity_walk');
    setText('#live-text-chat', 'activity_chat');
    setText('#live-modal-how-long', 'how_long');
    setText('#live-time-15', 'min_15');
    setText('#live-time-30', 'min_30');
    setText('#live-time-60', 'min_60');
    setText('#start-live', 'start_live_btn');

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