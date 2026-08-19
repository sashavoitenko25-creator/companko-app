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


let selectedGender = null;

let selectedRelationshipStatus = 'not_specified';

let profileInitialized = false;


/* ========================================
   СТАТУСЫ ОТНОШЕНИЙ
======================================== */

const RELATIONSHIP_STATUSES = {

    relationship: '❤️ В отношениях',

    married: '💍 Женат / замужем',

    single: '💔 Свободен / свободна',

    not_specified: '🤫 Не хочу указывать'

};


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
                                aria-label="Закрыть"
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


                    <h1>
                        ${
                            oldProfile
                                ? 'Редактирование'
                                : 'Создание профиля'
                        }
                    </h1>


                    <p>
                        Как вас будут видеть другие
                    </p>

                </div>


                <!-- ИМЯ -->

                <div class="profile-field">

                    <label>
                        Имя
                    </label>


                    <input
                        id="profile-name"
                        placeholder="Ваше имя"
                        value="${
                            oldProfile?.name ||
                            tgUser?.first_name ||
                            ''
                        }"
                    >

                </div>


                <!-- ВОЗРАСТ -->

                <div class="profile-field">

                    <label>
                        Возраст
                    </label>


                    <input
                        id="profile-age"
                        type="number"
                        placeholder="Возраст"
                        value="${
                            oldProfile?.age || ''
                        }"
                    >

                </div>


                <!-- ПОЛ -->

                <label class="profile-label">
                    Пол
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
                    >

                        👨 Мужчина

                    </button>


                    <button
                        type="button"
                        class="gender-choice ${
                            selectedGender === 'female'
                                ? 'active'
                                : ''
                        }"
                        data-gender="female"
                    >

                        👩 Женщина

                    </button>


                </div>


                <!-- СТАТУС ОТНОШЕНИЙ -->

                <div class="profile-field">

                    <label>
                        Статус отношений
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
                                    RELATIONSHIP_STATUSES[
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
                                    RELATIONSHIP_STATUSES
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
                            ? 'Сохранить'
                            : 'Создать профиль'
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


                        relationshipText.textContent =
                            RELATIONSHIP_STATUSES[
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

}


/* ========================================
   СОХРАНЕНИЕ ПРОФИЛЯ
======================================== */

async function saveProfileHandler() {

    try {


        const tgUser =
            getTelegramUser();


        if (!tgUser) {

            alert(
                'Telegram user not found'
            );

            return;

        }


        /* ====================================
           USER
        ==================================== */

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


        /* ====================================
           ДАННЫЕ ПРОФИЛЯ
        ==================================== */

        const profileData = {

            user_id:
                user.id,

            name:
                document
                    .querySelector(
                        '#profile-name'
                    )
                    ?.value
                    ?.trim() || '',

            age:
                Number(
                    document
                        .querySelector(
                            '#profile-age'
                        )
                        ?.value || 0
                ),

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


        /* ====================================
           СУЩЕСТВУЮЩИЙ ПРОФИЛЬ
        ==================================== */

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


        /* ====================================
           LOCAL STORE
        ==================================== */

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


        /* ====================================
           СИГНАЛ
        ==================================== */

        window.dispatchEvent(
            new CustomEvent(
                'profile:created',
                {
                    detail: profile
                }
            )
        );


        /* ====================================
           ПЕРЕЗАГРУЗКА
        ==================================== */

        window.location.reload();


    }

    catch (error) {

        console.error(
            'PROFILE ERROR',
            error
        );


        alert(
            'Ошибка сохранения'
        );

    }

}