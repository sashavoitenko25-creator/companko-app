import './Profile.css';

import {
    saveProfile,
    getProfile
} from '../../features/profile/profileStore';

import {
    getTelegramUser
} from '../../services/telegram/telegramService';

import {
    createUser
} from '../../services/supabase/userService';

import {
    createProfile,
    getProfileByUserId,
    updateProfile
} from '../../services/supabase/profileService';

import {
    showLiveRequiredNotice
} from '../../features/route/RoutePanel';

import {
    t
} from '../../i18n';

let selectedGender = null;
let selectedRelationshipStatus = 'not_specified';
let profileInitialized = false;

/* ========================================
   СТАТУСЫ ОТНОШЕНИЙ
======================================== */

function getRelationshipStatuses() {
    return {
        relationship: t('rel_profile_relationship'),
        married: t('rel_profile_married'),
        single: t('rel_profile_single'),
        not_specified: t('rel_profile_not_specified')
    };
}

/* ========================================
   ВАЛИДАЦИЯ
======================================== */

function sanitizeName(value) {
    return value
        .replace(/[^\p{L}\s'-]/gu, '')
        .replace(/\s{2,}/g, ' ');
}

function sanitizeAge(value) {
    return value
        .replace(/\D/g, '');
}

/* ========================================
   PROFILE
======================================== */

export function Profile() {

    profileInitialized = false;

    const tgUser =
        getTelegramUser();

    const oldProfile =
        getProfile();

    selectedGender =
        oldProfile?.gender || null;

    selectedRelationshipStatus =
        oldProfile?.relationship_status ||
        'not_specified';

    setTimeout(
        initProfile,
        0
    );

    const isEditing =
        !!oldProfile;

    const statuses =
        getRelationshipStatuses();

    return `
        <main class="${
            isEditing
                ? 'profile-modal'
                : 'profile-page'
        }">

            ${
                isEditing
                    ? `
                        <div
                            class="profile-modal__backdrop"
                            id="profile-modal-backdrop"
                        ></div>
                    `
                    : ''
            }

            <div class="profile-card">

                ${
                    isEditing
                        ? `
                            <button
                                type="button"
                                class="profile-close"
                                id="profile-close"
                                aria-label="${t('profile_close')}"
                            >
                                ×
                            </button>
                        `
                        : ''
                }

                <!-- HEADER -->
                <div class="profile-header">

                    <img
                        class="profile-avatar"
                        src="${
                            tgUser?.photo_url ||
                            oldProfile?.photo_url ||
                            'https://i.pravatar.cc/150'
                        }"
                        alt=""
                    >

                    <h1 id="profile-title">
                        ${
                            oldProfile
                                ? t('profile_edit')
                                : t('profile_create')
                        }
                    </h1>

                    <p id="profile-subtitle">
                        ${t('profile_subtitle')}
                    </p>

                </div>

                <!-- ИМЯ -->
                <div class="profile-field">

                    <label id="profile-name-label">
                        ${t('profile_name')}
                    </label>

                    <input
                        id="profile-name"
                        placeholder="${t('profile_name_placeholder')}"
                        value="${
                            oldProfile?.name ||
                            tgUser?.first_name ||
                            ''
                        }"
                    >

                </div>

                <!-- ВОЗРАСТ -->
                <div class="profile-field">

                    <label id="profile-age-label">
                        ${t('profile_age')}
                    </label>

                    <input
                        id="profile-age"
                        type="number"
                        inputmode="numeric"
                        placeholder="${t('profile_age_placeholder')}"
                        value="${
                            oldProfile?.age || ''
                        }"
                    >

                </div>

                <!-- ПОЛ -->
                <label class="profile-label" id="profile-gender-label">
                    ${t('profile_gender')}
                </label>

                <div class="gender-box">

                    <button
                        type="button"
                        class="gender-choice ${
                            selectedGender === 'male'
                                ? 'active'
                                : ''
                        }"
                        data-gender="male"
                        id="profile-gender-male"
                    >
                        ${t('profile_male')}
                    </button>

                    <button
                        type="button"
                        class="gender-choice ${
                            selectedGender === 'female'
                                ? 'active'
                                : ''
                        }"
                        data-gender="female"
                        id="profile-gender-female"
                    >
                        ${t('profile_female')}
                    </button>

                </div>

                <!-- СТАТУС ОТНОШЕНИЙ -->
                <div class="profile-field">

                    <label id="profile-relationship-label">
                        ${t('profile_relationship')}
                    </label>

                    <div
                        class="relationship-select"
                        id="relationship-select"
                    >

                        <button
                            type="button"
                            class="relationship-select-button"
                            id="relationship-select-button"
                        >
                            <span
                                id="relationship-selected-text"
                            >
                                ${
                                    statuses[
                                        selectedRelationshipStatus
                                    ]
                                }
                            </span>
                            <span class="relationship-arrow">
                                ▾
                            </span>
                        </button>

                        <div
                            class="relationship-options"
                            id="relationship-options"
                        >
                            ${
                                Object.entries(
                                    statuses
                                )
                                .map(
                                    ([value, label]) => `
                                        <button
                                            type="button"
                                            class="relationship-option ${
                                                selectedRelationshipStatus === value
                                                    ? 'active'
                                                    : ''
                                            }"
                                            data-relationship="${value}"
                                        >
                                            ${label}
                                        </button>
                                    `
                                )
                                .join('')
                            }
                        </div>

                    </div>

                </div>

                <!-- SAVE -->
                <button
                    id="profile-save"
                    class="save-button"
                    type="button"
                >
                    ${
                        oldProfile
                            ? t('profile_save')
                            : t('profile_create_btn')
                    }
                </button>

            </div>

        </main>
    `;

}

/* ========================================
   ИНИЦИАЛИЗАЦИЯ
======================================== */

function initProfile() {

    if (profileInitialized) {
        return;
    }

    profileInitialized = true;

    /* ====================================
       ИМЯ
    ==================================== */

    const nameInput =
        document.querySelector(
            '#profile-name'
        );

    nameInput?.addEventListener(
        'input',
        () => {

            const cleanValue =
                sanitizeName(
                    nameInput.value
                );

            if (
                nameInput.value !==
                cleanValue
            ) {
                nameInput.value =
                    cleanValue;
            }

        }
    );

    /* ====================================
       ВОЗРАСТ
    ==================================== */

    const ageInput =
        document.querySelector(
            '#profile-age'
        );

    ageInput?.addEventListener(
        'input',
        () => {

            const cleanValue =
                sanitizeAge(
                    ageInput.value
                );

            if (
                ageInput.value !==
                cleanValue
            ) {
                ageInput.value =
                    cleanValue;
            }

        }
    );

    /* ====================================
       ЗАКРЫТИЕ РЕДАКТИРОВАНИЯ
    ==================================== */

    const closeButton =
        document.querySelector(
            '#profile-close'
        );

    const backdrop =
        document.querySelector(
            '#profile-modal-backdrop'
        );

    const closeProfile =
        () => {

            window.dispatchEvent(
                new CustomEvent(
                    'profile:close'
                )
            );

        };

    closeButton?.addEventListener(
        'click',
        closeProfile
    );

    backdrop?.addEventListener(
        'click',
        closeProfile
    );

    /* ====================================
       ПОЛ
    ==================================== */

    document
        .querySelectorAll(
            '[data-gender]'
        )
        .forEach(button => {

            button.onclick = () => {

                document
                    .querySelectorAll(
                        '[data-gender]'
                    )
                    .forEach(item => {

                        item.classList.remove(
                            'active'
                        );

                    });

                button.classList.add(
                    'active'
                );

                selectedGender =
                    button.dataset.gender;

            };

        });

    /* ====================================
       СТАТУС — ОТКРЫТИЕ СПИСКА
    ==================================== */

    const relationshipSelect =
        document.querySelector(
            '#relationship-select'
        );

    const relationshipButton =
        document.querySelector(
            '#relationship-select-button'
        );

    const relationshipOptions =
        document.querySelector(
            '#relationship-options'
        );

    const relationshipText =
        document.querySelector(
            '#relationship-selected-text'
        );

    if (
        relationshipButton &&
        relationshipOptions
    ) {

        relationshipButton.onclick =
            event => {

                event.preventDefault();
                event.stopPropagation();

                relationshipSelect
                    ?.classList.toggle(
                        'open'
                    );

            };

        relationshipOptions
            .querySelectorAll(
                '[data-relationship]'
            )
            .forEach(option => {

                option.onclick =
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        selectedRelationshipStatus =
                            option.dataset.relationship;

                        const statuses =
                            getRelationshipStatuses();

                        relationshipText.textContent =
                            statuses[
                                selectedRelationshipStatus
                            ];

                        relationshipOptions
                            .querySelectorAll(
                                '[data-relationship]'
                            )
                            .forEach(item => {

                                item.classList.remove(
                                    'active'
                                );

                            });

                        option.classList.add(
                            'active'
                        );

                        relationshipSelect
                            .classList.remove(
                                'open'
                            );

                    };

            });

        document.addEventListener(
            'click',
            event => {

                if (
                    !relationshipSelect.contains(
                        event.target
                    )
                ) {

                    relationshipSelect
                        .classList.remove(
                            'open'
                        );

                }

            }
        );

    }

    /* ====================================
       СОХРАНЕНИЕ
    ==================================== */

    document
        .querySelector(
            '#profile-save'
        )
        ?.addEventListener(
            'click',
            saveProfileHandler
        );

    // Обновление при смене языка
    window.addEventListener(
        'language:changed',
        () => {
            updateProfileTexts();
        }
    );

}

/* ========================================
   ОБНОВЛЕНИЕ ТЕКСТОВ
======================================== */

function updateProfileTexts() {

    const oldProfile = getProfile();
    const statuses = getRelationshipStatuses();

    const setText = (id, key) => {
        const el = document.querySelector(id);
        if (el) el.textContent = t(key);
    };

    const title = document.querySelector('#profile-title');
    if (title) {
        title.textContent = oldProfile
            ? t('profile_edit')
            : t('profile_create');
    }

    setText('#profile-subtitle', 'profile_subtitle');
    setText('#profile-name-label', 'profile_name');
    setText('#profile-age-label', 'profile_age');
    setText('#profile-gender-label', 'profile_gender');
    setText('#profile-relationship-label', 'profile_relationship');
    setText('#profile-gender-male', 'profile_male');
    setText('#profile-gender-female', 'profile_female');

    const nameInput = document.querySelector('#profile-name');
    if (nameInput) nameInput.placeholder = t('profile_name_placeholder');

    const ageInput = document.querySelector('#profile-age');
    if (ageInput) ageInput.placeholder = t('profile_age_placeholder');

    const closeBtn = document.querySelector('#profile-close');
    if (closeBtn) closeBtn.setAttribute('aria-label', t('profile_close'));

    const saveBtn = document.querySelector('#profile-save');
    if (saveBtn) {
        saveBtn.textContent = oldProfile
            ? t('profile_save')
            : t('profile_create_btn');
    }

    const relationshipText = document.querySelector('#relationship-selected-text');
    if (relationshipText) {
        relationshipText.textContent =
            statuses[selectedRelationshipStatus] ||
            statuses.not_specified;
    }

    document
        .querySelectorAll('#relationship-options [data-relationship]')
        .forEach(option => {
            const key = option.dataset.relationship;
            if (statuses[key]) {
                option.textContent = statuses[key];
            }
        });

}

/* ========================================
   СОХРАНЕНИЕ ПРОФИЛЯ
======================================== */

async function saveProfileHandler() {

    try {

        const nameInput =
            document.querySelector(
                '#profile-name'
            );

        const ageInput =
            document.querySelector(
                '#profile-age'
            );

        const name =
            sanitizeName(
                nameInput?.value || ''
            ).trim();

        const age =
            sanitizeAge(
                ageInput?.value || ''
            ).trim();

        if (!name) {
            showLiveRequiredNotice(
                t('profile_err_name')
            );
            nameInput?.focus();
            return;
        }

        if (!age) {
            showLiveRequiredNotice(
                t('profile_err_age')
            );
            ageInput?.focus();
            return;
        }

        if (!selectedGender) {
            showLiveRequiredNotice(
                t('profile_err_gender')
            );
            return;
        }

        const ageNumber =
            Number(age);

        if (
            !Number.isInteger(ageNumber) ||
            ageNumber < 1 ||
            ageNumber > 120
        ) {
            showLiveRequiredNotice(
                t('profile_err_age_invalid')
            );
            ageInput?.focus();
            return;
        }

        if (ageNumber < 18) {
            showLiveRequiredNotice(
                t('profile_err_age_18')
            );
            ageInput?.focus();
            return;
        }

        const tgUser =
            getTelegramUser();

        if (!tgUser) {
            alert(
                t('profile_err_tg')
            );
            return;
        }

        const user =
            await createUser({
                telegram_id:
                    Number(
                        tgUser.telegram_id
                    ),
                first_name:
                    tgUser.first_name,
                photo_url:
                    tgUser.photo_url ||
                    null,
                language_code:
                    tgUser.language_code ||
                    'ru'
            });

        const profileData = {
            user_id:
                user.id,
            name:
                name,
            age:
                ageNumber,
            gender:
                selectedGender,
            telegram_id:
                Number(
                    tgUser.telegram_id
                ),
            photo_url:
                tgUser.photo_url ||
                null,
            relationship_status:
                selectedRelationshipStatus ||
                'not_specified'
        };

        const old =
            await getProfileByUserId(
                user.id
            );

        let profile;

        if (old) {
            profile =
                await updateProfile(
                    old.id,
                    profileData
                );
        }
        else {
            profile =
                await createProfile(
                    profileData
                );
        }

        saveProfile({
            ...profile,
            id:
                user.id,
            user_id:
                user.id,
            telegram_id:
                tgUser.telegram_id,
            first_name:
                tgUser.first_name,
            photo_url:
                tgUser.photo_url,
            relationship_status:
                selectedRelationshipStatus
        });

        window.dispatchEvent(
            new CustomEvent(
                'profile:created',
                {
                    detail: profile
                }
            )
        );

        window.location.reload();

    }
    catch (error) {

        console.error(
            'PROFILE ERROR',
            error
        );

        alert(
            t('profile_err_save')
        );

    }

}