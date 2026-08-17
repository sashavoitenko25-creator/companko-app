import './SelectedUser.css';

let timer = null;
let ignoreCloseAll = false;


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
   НАЗВАНИЯ АКТИВНОСТЕЙ
======================================== */

const ACTIVITY_NAMES = {

    beer: 'Выпить',
    coffee: 'Выпить кофе',
    walk: 'Гулять',
    chat: 'Общаться'

};


/* ========================================
   ИКОНКИ
======================================== */

const ACTIVITY_ICONS = {

    beer: '🍺',
    coffee: '☕',
    walk: '🚶',
    chat: '💬'

};


/* ========================================
   КОНТЕЙНЕР КАРТОЧКИ
======================================== */

export function SelectedUser() {

    return `

        <div
            id="selected-user"
            class="selected-user hidden">
        </div>

    `;

}


/* ========================================
   ПОКАЗАТЬ КАРТОЧКУ
======================================== */

export function showUserCard(user) {

    /*
     * Блокируем ui:close-all на короткое время.
     * Это нужно потому, что при открытии своей
     * карточки другое событие могло сразу
     * закрывать её.
     */

    ignoreCloseAll = true;

    setTimeout(() => {

        ignoreCloseAll = false;

    }, 500);


    const container =
        document.querySelector(
            '#selected-user'
        );


    if (!container) {
        return;
    }


    /* Останавливаем старый таймер */

    if (timer) {

        clearInterval(timer);

        timer = null;

    }


    /* ====================================
       СВОЯ КАРТОЧКА ИЛИ ДРУГОЙ ПОЛЬЗОВАТЕЛЬ
    ==================================== */

    const isMine =
        user.own === true ||
        user.isMine === true;


    console.log(
        'OPEN CARD USER:',
        user
    );


    /* ====================================
       ОСНОВНЫЕ ДАННЫЕ
    ==================================== */

    const name =
        user.name ||
        user.first_name ||
        'Гость';


    const age =
        user.age ||
        '';


    const photo =
        user.photo ||
        user.photo_url ||
        'https://i.pravatar.cc/600';


    const distance =
        Number(user.distance) || 0;


    /* ====================================
       ПОЛ
    ==================================== */

    const gender =
        user.gender === 'female'
            ? 'female'
            : 'male';


    const genderText =
        gender === 'female'
            ? '♀ Женщина'
            : '♂ Мужчина';


    /* ====================================
       АКТИВНОСТЬ
    ==================================== */

    const activity =
        user.activity ||
        '';


    const activityKey =
        getActivityKey(activity);


    const activityName =
        ACTIVITY_NAMES[activityKey] ||
        activity ||
        'Активность';


    const activityIcon =
        ACTIVITY_ICONS[activityKey] ||
        user.icon ||
        '🔥';


    const activityImage =
        ACTIVITY_IMAGES[gender]?.[activityKey] ||
        null;


    /* ====================================
       РАССТОЯНИЕ
    ==================================== */

    let distanceText = '';


    if (distance < 1000) {

        distanceText =
            `${Math.round(distance)} м`;

    } else {

        distanceText =
            `${(distance / 1000).toFixed(1)} км`;

    }


    /* ====================================
       КАРТИНКА АКТИВНОСТИ
    ==================================== */

    const activityImageHTML =
        activityImage

            ? `

                <div
                    class="profile-live-activity-image">

                    <img
                        src="${activityImage}"
                        alt=""
                    />

                </div>

            `

            : `

                <div
                    class="profile-live-activity-icon">

                    ${activityIcon}

                </div>

            `;


    /* ====================================
       КНОПКА
    ==================================== */

    const actionHTML = isMine

        ? `

            <div
                class="profile-live-owner">

                <span
                    class="profile-live-owner-dot">
                </span>

                Ваш LIVE

            </div>

        `

        : `

            <button
                class="user-card__route"
                type="button">

                <span>
                    🧭
                </span>

                <strong>
                    Построить маршрут
                </strong>

            </button>

        `;


    /* ====================================
       HTML КАРТОЧКИ
    ==================================== */

    container.innerHTML = `

        <div class="profile-live-card">


            <!-- HERO -->

            <div class="profile-live-hero">


                <img
                    class="profile-live-avatar"
                    src="${photo}"
                    alt="${escapeHTML(name)}"
                />


                <div
                    class="profile-live-hero-gradient">
                </div>


                <button
                    class="profile-live-close"
                    type="button">

                    ×

                </button>


                <div class="profile-live-badge">

                    <span></span>

                    LIVE

                </div>


                <div class="profile-live-hero-name">


                    <div class="profile-live-name">

                        ${escapeHTML(name)}
                        ${age
                            ? `, ${escapeHTML(age)}`
                            : ''
                        }

                    </div>


                    <div class="profile-live-gender">

                        ${genderText}

                    </div>


                </div>


            </div>


            <!-- BODY -->

            <div class="profile-live-body">


                <!-- META -->

                <div class="profile-live-meta">


                    <div
                        class="profile-live-meta-item">


                        <span
                            class="profile-live-meta-icon">

                            📍

                        </span>


                        <div>

                            <small>
                                Расстояние
                            </small>

                            <strong>

                                ${
                                    distanceText ||
                                    'Рядом'
                                }

                            </strong>

                        </div>


                    </div>


                    <div
                        class="profile-live-meta-item">


                        <span
                            class="profile-live-meta-icon">

                            ${activityIcon}

                        </span>


                        <div>

                            <small>
                                Сейчас
                            </small>

                            <strong>

                                ${activityName}

                            </strong>

                        </div>


                    </div>


                </div>


                <!-- ACTIVITY -->

                <div
                    class="profile-live-activity-card">


                    ${activityImageHTML}


                    <div
                        class="profile-live-activity-info">


                        <span>
                            Сейчас хочет
                        </span>


                        <strong>
                            ${activityName}
                        </strong>


                    </div>


                    <div
                        class="profile-live-activity-arrow">

                        ›

                    </div>


                </div>


                <!-- BOTTOM -->

                <div
                    class="profile-live-bottom">


                    <!-- TIMER -->

                    <div
                        class="profile-live-time">


                        <div
                            class="live-circle">


                            <svg
                                viewBox="0 0 80 80">


                                <circle
                                    class="circle-bg"
                                    cx="40"
                                    cy="40"
                                    r="34">
                                </circle>


                                <circle
                                    id="circle-progress"
                                    class="circle-progress"
                                    cx="40"
                                    cy="40"
                                    r="34">
                                </circle>


                            </svg>


                            <div
                                id="live-time-text"
                                class="live-time-text">

                                --:--

                            </div>


                        </div>


                        <div
                            class="profile-live-time-label">

                            осталось

                        </div>


                    </div>


                    <!-- ACTION -->

                    <div
                        class="profile-live-actions">

                        ${actionHTML}

                    </div>


                </div>


            </div>


        </div>

    `;


    /* ====================================
       ПОКАЗЫВАЕМ
    ==================================== */

    container.classList.remove(
        'hidden'
    );


    requestAnimationFrame(() => {

        container.classList.add(
            'selected-user--visible'
        );

    });


    /* ====================================
       КНОПКА ЗАКРЫТИЯ
    ==================================== */

    const closeButton =
        container.querySelector(
            '.profile-live-close'
        );


    if (closeButton) {

        closeButton.onclick = () => {

            hideUserCard();

        };

    }


    /* ====================================
       ТАЙМЕР
    ==================================== */

    startCountdown(
        user.expires_at,
        user.duration
    );

}


/* ========================================
   ОПРЕДЕЛЕНИЕ АКТИВНОСТИ
======================================== */

function getActivityKey(activity) {

    if (!activity) {
        return 'beer';
    }


    const value =
        String(activity)
            .toLowerCase()
            .trim();


    if (
        value === 'beer' ||
        value === 'alcohol' ||
        value.includes('алког')
    ) {

        return 'beer';

    }


    if (
        value === 'coffee' ||
        value.includes('кофе')
    ) {

        return 'coffee';

    }


    if (
        value === 'walk' ||
        value === 'walking' ||
        value.includes('гуля')
    ) {

        return 'walk';

    }


    if (
        value === 'chat' ||
        value === 'talking' ||
        value.includes('общ')
    ) {

        return 'chat';

    }


    return 'beer';

}


/* ========================================
   ТАЙМЕР LIVE
======================================== */

function startCountdown(
    expiresAt,
    duration
) {

    const text =
        document.querySelector(
            '#live-time-text'
        );


    const circle =
        document.querySelector(
            '#circle-progress'
        );


    if (!text || !circle) {
        return;
    }


    if (!expiresAt) {

        text.innerHTML = '--:--';

        return;

    }


    const end =
        new Date(
            expiresAt
        ).getTime();


    const total =
        duration
            ? duration * 60
            : 3600;


    const radius = 34;


    const circumference =
        2 *
        Math.PI *
        radius;


    circle.style.strokeDasharray =
        circumference;


    circle.style.strokeDashoffset =
        0;


    function update() {

        const now =
            Date.now();


        let left =
            Math.floor(
                (end - now) / 1000
            );


        if (left < 0) {
            left = 0;
        }


        const min =
            Math.floor(
                left / 60
            );


        const sec =
            left % 60;


        text.innerHTML =
            min +
            ':' +
            String(sec)
                .padStart(2, '0');


        const progress =
            Math.max(
                0,
                Math.min(
                    1,
                    left / total
                )
            );


        circle.style.strokeDashoffset =
            circumference -
            (
                circumference *
                progress
            );


        if (left <= 0) {

            clearInterval(
                timer
            );

            timer = null;

        }

    }


    update();


    timer =
        setInterval(
            update,
            1000
        );

}


/* ========================================
   ЗАКРЫТЬ КАРТОЧКУ
======================================== */

export function hideUserCard() {

    if (timer) {

        clearInterval(
            timer
        );

        timer = null;

    }


    const container =
        document.querySelector(
            '#selected-user'
        );


    if (!container) {
        return;
    }


    container.classList.remove(
        'selected-user--visible'
    );


    setTimeout(() => {

        container.classList.add(
            'hidden'
        );

    }, 250);

}


/* ========================================
   ЗАКРЫТИЕ ЧЕРЕЗ ui:close-all
======================================== */

window.addEventListener(
    'ui:close-all',
    () => {

        /*
         * При открытии своей карточки
         * некоторое время игнорируем
         * ui:close-all.
         */

        if (ignoreCloseAll) {
            return;
        }


        hideUserCard();

    }
);


/* ========================================
   ЗАЩИТА HTML
======================================== */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );

}