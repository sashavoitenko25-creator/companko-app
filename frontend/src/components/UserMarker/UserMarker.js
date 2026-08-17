import './UserMarker.css';


/* ========================================
   ЦВЕТА АКТИВНОСТЕЙ
======================================== */

function getActivityColor(activity) {

    const value =
        String(activity || '')
            .toLowerCase()
            .trim();


    /* 🚶 ГУЛЯТЬ */

    if (
        value === 'walk' ||
        value === 'walking' ||
        value.includes('гуля')
    ) {

        return '#45e879';

    }


    /* ☕ КОФЕ */

    if (
        value === 'coffee' ||
        value.includes('кофе')
    ) {

        return '#b87945';

    }


    /* 🍺 АЛКОГОЛЬ */

    if (
        value === 'beer' ||
        value === 'alcohol' ||
        value.includes('алког')
    ) {

        return '#ff8a3d';

    }


    /* 💬 ОБЩЕНИЕ */

    if (
        value === 'chat' ||
        value === 'talking' ||
        value.includes('общ')
    ) {

        return '#45b7ff';

    }


    /* ПО УМОЛЧАНИЮ */

    return '#9b5cff';

}


/* ========================================
   MARKER
======================================== */

export function UserMarker(user) {


    const color =
        getActivityColor(
            user?.activity
        );


    const photo =
        user?.photo ||
        user?.photo_url ||
        'https://i.pravatar.cc/150';


    return `

        <div
            class="user-marker"
            style="--activity-color: ${color};"
        >


            <div
                class="user-marker__circle"
            >


                <img
                    src="${photo}"
                    alt="avatar"
                >


            </div>


            <div
                class="user-marker__badge"
            >

                <span class="user-marker__badge-dot"></span>

                LIVE

            </div>


        </div>

    `;

}