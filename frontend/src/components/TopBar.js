import './TopBar.css';

export function TopBar(){

    return `

        <header class="top-bar">

            <button
                class="top-bar__menu">

                ☰

            </button>

            <h1
                class="top-bar__title">

                Компанько

            </h1>

            <button
                class="top-bar__profile">

                <img

                    src="https://i.pravatar.cc/120"

                    alt="profile"

                />

            </button>

        </header>

    `;

}