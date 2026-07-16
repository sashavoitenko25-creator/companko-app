import './Header.css';

export function Header() {
    return `
        <header class="header">
            <div class="header__logo">
                <span class="header__logo-dot"></span>
                <span class="header__title">Companko</span>
            </div>

            <button class="header__profile" aria-label="Profile">
                <div class="header__avatar"></div>
            </button>
        </header>
    `;
}