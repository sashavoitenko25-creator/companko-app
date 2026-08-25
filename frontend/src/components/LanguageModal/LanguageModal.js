import './LanguageModal.css';

import {
    t,
    getLang,
    setLang,
    getAvailableLanguages
} from '../../i18n';

export function LanguageModal() {
    return `
<div id="language-overlay" class="language-overlay">
    <div class="language-modal">
        <button id="language-back" class="language-back">←</button>
        <h2 id="language-title">${t('language_title')}</h2>
        <div id="language-list" class="language-list"></div>
    </div>
</div>
`;
}

export function initLanguageModal() {
    const overlay = document.querySelector('#language-overlay');
    const title = document.querySelector('#language-title');
    const list = document.querySelector('#language-list');
    const backBtn = document.querySelector('#language-back');

    if (!overlay || !list) return;

    function renderList() {
        const langs = getAvailableLanguages();
        const current = getLang();

        list.innerHTML = langs.map(lang => `
            <button
                class="language-item ${lang.code === current ? 'active' : ''}"
                data-lang="${lang.code}"
            >
                ${lang.label}
                ${lang.code === current ? ' ✓' : ''}
            </button>
        `).join('');

        list.querySelectorAll('.language-item').forEach(btn => {
            btn.onclick = () => {
                const code = btn.dataset.lang;
                setLang(code);
                overlay.classList.remove('open');

                // Перерисовываем текст модалки и настроек сразу
                updateLanguageUI();
            };
        });
    }

    function updateLanguageUI() {
        if (title) title.textContent = t('language_title');

        // Обновляем кнопку в настройках и заголовок
        const settingsTitle = document.querySelector('#settings-window h2');
        if (settingsTitle) settingsTitle.textContent = t('settings_title');

        const changeBtn = document.querySelector('#change-language-button');
        if (changeBtn) changeBtn.textContent = t('change_language');

        const reportBtn = document.querySelector('#report-problem-button');
        if (reportBtn) reportBtn.textContent = t('report_problem');

        const ideaBtn = document.querySelector('#suggest-idea-button');
        if (ideaBtn) ideaBtn.textContent = t('suggest_idea');

        renderList();
    }

    window.addEventListener('language:open', () => {
        renderList();
        if (title) title.textContent = t('language_title');
        overlay.classList.add('open');
    });

    window.addEventListener('language:changed', () => {
        updateLanguageUI();
    });

    backBtn.onclick = () => {
        overlay.classList.remove('open');
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('open');
        }
    };

    // Первичная отрисовка при загрузке
    updateLanguageUI();
}