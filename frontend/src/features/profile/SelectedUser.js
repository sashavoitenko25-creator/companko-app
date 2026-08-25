import './SelectedUser.css';

import {
    t
} from '../../i18n';

let timer = null;

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
   НАЗВАНИЯ / ИКОНКИ
======================================== */

function getActivityNames() {
    return {
        beer: t('activity_name_beer'),
        coffee: t('activity_name_coffee'),
        walk: t('activity_name_walk'),
        chat: t('activity_name_chat')
    };
}

const ACTIVITY_ICONS = {
    beer: '🍺',
    coffee: '☕',
    walk: '🚶',
    chat: '💬'
};

function getRelationshipStatuses() {
    return {
        relationship: {
            icon: '❤️',
            male: t('rel_card_relationship'),
            female: t('rel_card_relationship')
        },
        married: {
            icon: '💍',
            male: t('rel_card_married_m'),
            female: t('rel_card_married_f')
        },
        single: {
            icon: '💔',
            male: t('rel_card_single_m'),
            female: t('rel_card_single_f')
        },
        not_specified: {
            icon: '🤫',
            male: t('rel_card_not_specified'),
            female: t('rel_card_not_specified')
        }
    };
}

/* ========================================
   КОНТЕЙНЕР
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
   ПОКАЗ КАРТОЧКИ
======================================== */

export function showUserCard(user) {

    const container =
        document.querySelector(
            '#selected-user'
        );

    if (!container) {
        return;
    }

    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    const isMine =
        user?.own === true ||
        user?.isMine === true;

    console.log(
        'OPEN CARD USER:',
        user
    );

    console.log(
        'IS MY CARD:',
        isMine
    );

    container.dataset.owner =
        isMine
            ? 'true'
            : 'false';

    const name =
        user?.name ||
        user?.first_name ||
        t('guest');

    const age =
        user?.age ||
        '';

    const photo =
        user?.photo ||
        user?.photo_url ||
        'https://i.pravatar.cc/600';

    const distance =
        Number(user?.distance) || 0;

    const gender =
        user?.gender === 'female'
            ? 'female'
            : 'male';

    const genderText =
        gender === 'female'
            ? '♀'
            : '♂';

    const genderColor =
        gender === 'female'
            ? '#ff5c9a'
            : '#4da6ff';

    const relationshipStatus =
        user?.relationship_status ||
        'not_specified';

    const statuses =
        getRelationshipStatuses();

    const relationship =
        statuses[
            relationshipStatus
        ] ||
        statuses.not_specified;

    const relationshipText =
        gender === 'female'
            ? relationship.female
            : relationship.male;

    const relationshipIcon =
        relationship.icon;

    const activity =
        user?.activity ||
        '';

    const activityKey =
        getActivityKey(
            activity
        );

    const activityNames =
        getActivityNames();

    const activityName =
        activityNames[
            activityKey
        ] ||
        activity ||
        t('activity_default');

    const activityIcon =
        ACTIVITY_ICONS[
            activityKey
        ] ||
        user?.icon ||
        '🔥';

    const activityImage =
        ACTIVITY_IMAGES[
            gender
        ]?.[
            activityKey
        ] ||
        null;

    let distanceText = '';

    if (distance < 1000) {
        distanceText =
            `${Math.round(distance)} м`;
    } else {
        distanceText =
            `${(
                distance / 1000
            ).toFixed(1)} км`;
    }

    const activityImageHTML =
        activityImage
            ? `
                <div
                    class="profile-live-activity-image">
                    <img
                        src="${escapeHTML(activityImage)}"
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

    const actionHTML = isMine
        ? `
            <div
                class="profile-live-owner">
                <span
                    class="profile-live-owner-dot">
                </span>
                ${t('your_live')}
            </div>
        `
        : `
            <button
                class="user-card__route"
                type="button">
                <span class="route-button__icon">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M5 19L19 5"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                        />
                        <path
                            d="M19 5H11"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                        />
                        <path
                            d="M19 5V13"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                        />
                        <circle
                            cx="5"
                            cy="19"
                            r="2"
                            fill="currentColor"
                        />
                    </svg>
                </span>
                <strong>
                    ${t('build_route')}
                </strong>
            </button>
        `;

    container.innerHTML = `
        <div class="profile-live-card">

            <div class="profile-live-hero">

                <img
                    class="profile-live-avatar"
                    src="${escapeHTML(photo)}"
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

                <div
                    class="profile-live-hero-name">

                    <div
                        class="profile-live-name">
                        ${escapeHTML(name)}
                        ${
                            age
                                ? `, ${escapeHTML(age)}`
                                : ''
                        }
                    </div>

                    <div
                        class="profile-live-gender"
                        style="color:${genderColor};">
                        ${genderText}
                    </div>

                </div>

            </div>

            <div class="profile-live-body">

                <div class="profile-live-meta">

                    <div
                        class="profile-live-meta-item">
                        <span
                            class="profile-live-meta-icon">
                            📍
                        </span>
                        <div>
                            <small>
                                ${t('distance_label')}
                            </small>
                            <strong>
                                ${
                                    distanceText ||
                                    t('nearby')
                                }
                            </strong>
                        </div>
                    </div>

                    <div
                        class="profile-live-meta-item">
                        <span
                            class="profile-live-meta-icon">
                            ${relationshipIcon}
                        </span>
                        <div>
                            <small>
                                ${t('status_label')}
                            </small>
                            <strong>
                                ${escapeHTML(
                                    relationshipText
                                )}
                            </strong>
                        </div>
                    </div>

                </div>

                <div
                    class="profile-live-activity-card">

                    ${activityImageHTML}

                    <div
                        class="profile-live-activity-info">
                        <span>
                            ${t('wants_now')}
                        </span>
                        <strong>
                            ${escapeHTML(
                                activityName
                            )}
                        </strong>
                    </div>

                    <div
                        class="profile-live-activity-arrow">
                        ›
                    </div>

                </div>

                <div
                    class="profile-live-bottom">

                    <div
                        class="profile-live-time">

                        <div
                            class="live-circle">

                            <svg
                                viewBox="0 0 80 80"
                                aria-hidden="true">
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
                            ${t('time_left')}
                        </div>

                    </div>

                    <div
                        class="profile-live-actions">
                        ${actionHTML}
                    </div>

                </div>

            </div>

        </div>
    `;

    container.classList.remove(
        'hidden'
    );

    requestAnimationFrame(() => {
        container.classList.add(
            'selected-user--visible'
        );
    });

    const closeButton =
        container.querySelector(
            '.profile-live-close'
        );

    if (closeButton) {
        closeButton.onclick =
            (event) => {
                event.preventDefault();
                event.stopPropagation();
                hideUserCard();
            };
    }

    startCountdown(
        user?.expires_at,
        user?.duration
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
        value.includes('кофе') ||
        value.includes('кав')
    ) {
        return 'coffee';
    }

    if (
        value === 'walk' ||
        value === 'walking' ||
        value.includes('гуля') ||
        value.includes('spazier')
    ) {
        return 'walk';
    }

    if (
        value === 'chat' ||
        value === 'talking' ||
        value.includes('общ') ||
        value.includes('спіл')
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
        text.textContent =
            '--:--';
        return;
    }

    const end =
        new Date(
            expiresAt
        ).getTime();

    if (Number.isNaN(end)) {
        text.textContent =
            '--:--';
        return;
    }

    const total =
        duration
            ? Number(duration) * 60
            : 3600;

    const radius = 34;

    const circumference =
        2 *
        Math.PI *
        radius;

    circle.style.strokeDasharray =
        `${circumference}`;

    circle.style.strokeDashoffset =
        '0';

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

        text.textContent =
            `${min}:${String(sec).padStart(2, '0')}`;

        const progress =
            Math.max(
                0,
                Math.min(
                    1,
                    left / total
                )
            );

        const offset =
            circumference -
            (
                circumference *
                progress
            );

        circle.style.strokeDashoffset =
            offset;

        if (left <= 0) {

            if (timer) {
                clearInterval(
                    timer
                );
                timer = null;
            }

            text.textContent =
                '0:00';

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

        if (
            container.classList.contains(
                'selected-user--visible'
            )
        ) {
            return;
        }

        container.classList.add(
            'hidden'
        );

        container.dataset.owner =
            'false';

    }, 250);

}

/* ========================================
   UI:CLOSE-ALL
======================================== */

window.addEventListener(
    'ui:close-all',
    () => {

        const container =
            document.querySelector(
                '#selected-user'
            );

        if (!container) {
            return;
        }

        if (
            container.dataset.owner ===
            'true'
        ) {
            console.log(
                'KEEP MY LIVE CARD OPEN'
            );
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