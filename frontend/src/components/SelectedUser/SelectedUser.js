import './SelectedUser.css';

export function SelectedUser(user){

    const distance = user.distance || 0;

    const activity = user.activity || '';

    const icon = user.icon || '📍';

    return `

        <div class="selected-user">

            <div class="selected-user__header">

                <img

                    class="selected-user__avatar"

                    src="${user.photo}"

                    alt="${user.name}"

                />

                <div class="selected-user__content">

                    <div class="selected-user__name">

                        ${user.name}, ${user.age}

                    </div>

                    <div class="selected-user__activity">

                        ${icon}
                        ${activity}

                    </div>

                    <div class="selected-user__distance">

                        📍 ${distance} м

                    </div>

                </div>

            </div>

            <div class="selected-user__footer">

                <div class="selected-user__status">

                    <span class="selected-user__status-dot"></span>

                    Онлайн

                </div>

                <button

                    class="selected-user__button">

                    Построить маршрут

                </button>

            </div>

        </div>

    `;

}