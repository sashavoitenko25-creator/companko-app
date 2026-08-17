import './SelectedUser.css';


/* ========================================
   СТАТУС ОТНОШЕНИЙ
======================================== */

function getRelationshipStatus(user) {

    const value =
        String(
            user?.relationship_status ||
            user?.relationshipStatus ||
            user?.marital_status ||
            user?.status ||
            'single'
        )
        .toLowerCase()
        .trim();


    const female =
        user?.gender === 'female';


    /* ====================================
       СВОБОДЕН / СВОБОДНА
    ==================================== */

    if (
        value === 'single' ||
        value === 'free' ||
        value === 'available' ||
        value === 'свободен' ||
        value === 'свободна'
    ) {

        return {

            text:
                female
                    ? 'Свободна'
                    : 'Свободен',

            icon: '●',

            className: 'status-single'

        };

    }


    /* ====================================
       В ОТНОШЕНИЯХ
    ==================================== */

    if (
        value === 'relationship' ||
        value === 'in_relationship' ||
        value === 'in relationship' ||
        value === 'taken' ||
        value === 'отношения' ||
        value === 'в отношениях'
    ) {

        return {

            text: 'В отношениях',

            icon: '♥',

            className: 'status-relationship'

        };

    }


    /* ====================================
       В ПОИСКЕ
    ==================================== */

    if (
        value === 'looking' ||
        value === 'searching' ||
        value === 'looking_for_relationship' ||
        value === 'в поиске'
    ) {

        return {

            text: 'В поиске',

            icon: '✦',

            className: 'status-looking'

        };

    }


    /* ====================================
       ТОЛЬКО ОБЩЕНИЕ
    ==================================== */

    if (
        value === 'chat' ||
        value === 'communication' ||
        value === 'only_chat' ||
        value === 'только общение'
    ) {

        return {

            text: 'Только общение',

            icon: '•',

            className: 'status-chat'

        };

    }


    /* ====================================
       ОТКРЫТ К ЗНАКОМСТВАМ
    ==================================== */

    if (
        value === 'open' ||
        value === 'open_to_meet' ||
        value === 'open_to_dating' ||
        value === 'знакомства'
    ) {

        return {

            text:
                female
                    ? 'Открыта к знакомствам'
                    : 'Открыт к знакомствам',

            icon: '✧',

            className: 'status-open'

        };

    }


    /* ====================================
       ВСЁ СЛОЖНО
    ==================================== */

    if (
        value === 'complicated' ||
        value === 'its_complicated' ||
        value === 'сложно' ||
        value === 'всё сложно'
    ) {

        return {

            text: 'Всё сложно',

            icon: '◇',

            className: 'status-complicated'

        };

    }


    /* ====================================
       ПО УМОЛЧАНИЮ
    ==================================== */

    return {

        text:
            female
                ? 'Свободна'
                : 'Свободен',

        icon: '●',

        className: 'status-single'

    };

}


/* ========================================
   ЭКРАНИРОВАНИЕ HTML
======================================== */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, '&amp;')

        .replace(/</g, '&lt;')

        .replace(/>/g, '&gt;')

        .replace(/"/g, '&quot;')

        .replace(/'/g, '&#039;');

}


/* ========================================
   КАРТОЧКА ПОЛЬЗОВАТЕЛЯ
======================================== */

export function SelectedUser(user = {}) {


    /* ====================================
       ДАННЫЕ
    ==================================== */

    const distance =
        Number(user.distance) || 0;


    const activity =
        user.activity || '';


    const icon =
        user.icon || '🔥';


    const status =
        getRelationshipStatus(user);


    const photo =
        user.photo ||
        user.photo_url ||
        'https://i.pravatar.cc/150';


    const name =
        user.name ||
        user.first_name ||
        'Гость';


    const age =
        user.age ||
        '';


    /* ====================================
       БЕЗОПАСНЫЕ ДАННЫЕ
    ==================================== */

    const safeName =
        escapeHTML(name);


    const safeAge =
        escapeHTML(age);


    const safeActivity =
        escapeHTML(
            activity || 'Активен сейчас'
        );


    const safePhoto =
        escapeHTML(photo);


    /* ====================================
       HTML
    ==================================== */

    return `

        <div class="selected-user">


            <!-- ==================================
                 HEADER
            ================================== -->

            <div class="selected-user__header">


                <!-- AVATAR -->

                <img

                    class="selected-user__avatar"

                    src="${safePhoto}"

                    alt="${safeName}"

                />


                <!-- CONTENT -->

                <div class="selected-user__content">


                    <!-- NAME -->

                    <div class="selected-user__name">

                        ${safeName}${safeAge ? `, ${safeAge}` : ''}

                    </div>


                    <!-- ACTIVITY -->

                    <div class="selected-user__activity">

                        <span class="selected-user__activity-icon">

                            ${icon}

                        </span>

                        <span>

                            ${safeActivity}

                        </span>

                    </div>


                    <!-- DISTANCE -->

                    <div class="selected-user__distance">

                        <span class="selected-user__distance-icon">

                            ●

                        </span>

                        <span>

                            ${distance} м

                        </span>

                    </div>


                </div>


            </div>


            <!-- ==================================
                 FOOTER
            ================================== -->

            <div class="selected-user__footer">


                <!-- ==================================
                     STATUS
                ================================== -->

                <div
                    class="
                        selected-user__status
                        ${status.className}
                    "
                >


                    <span
                        class="
                            selected-user__status-icon
                        "
                    >

                        ${status.icon}

                    </span>


                    <div
                        class="
                            selected-user__status-content
                        "
                    >


                        <span
                            class="
                                selected-user__status-label
                            "
                        >

                            Статус

                        </span>


                        <strong>

                            ${status.text}

                        </strong>


                    </div>


                </div>


                <!-- ==================================
                     ROUTE BUTTON
                ================================== -->

                <button

                    class="selected-user__button"

                    type="button"

                >


                    <span
                        class="
                            selected-user__button-text
                        "
                    >

                        Построить маршрут

                    </span>


                    <span
                        class="
                            selected-user__button-icon
                        "
                        aria-hidden="true"
                    >

                        →

                    </span>


                </button>


            </div>


        </div>

    `;

}