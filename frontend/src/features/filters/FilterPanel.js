import './FilterPanel.css';
import {
    getFilters,
    setFilters,
    resetFilters,
    hasActiveFilters
} from '../../store/filterStore';
import {
    t
} from '../../i18n';

function getActivities() {
    return [
        { id: 'beer',  label: t('activity_filter_beer') },
        { id: 'coffee', label: t('activity_filter_coffee') },
        { id: 'walk',  label: t('activity_filter_walk') },
        { id: 'chat',  label: t('activity_filter_chat') }
    ];
}

function getRelationships() {
    return [
        { id: 'single',        label: t('rel_single') },
        { id: 'relationship',  label: t('rel_relationship') },
        { id: 'married',       label: t('rel_married') },
        { id: 'not_specified', label: t('rel_not_specified') }
    ];
}

function getRadiusOptions() {
    return [
        { value: null,   label: t('radius_any') },
        { value: 500,    label: t('radius_500') },
        { value: 1000,   label: t('radius_1km') },
        { value: 3000,   label: t('radius_3km') },
        { value: 5000,   label: t('radius_5km') },
        { value: 10000,  label: t('radius_10km') }
    ];
}

let draft = null;
let panelInitialized = false;

/* ========================================
   HTML
======================================== */

export function FilterPanel(){

    setTimeout(
        initFilterPanel,
        0
    );

    const activities = getActivities();
    const relationships = getRelationships();
    const radiusOptions = getRadiusOptions();

    return `
<div
    id="filter-panel"
    class="filter-panel"
>
    <div
        class="filter-panel__backdrop"
        id="filter-panel-backdrop"
    ></div>
    <div class="filter-panel__sheet">
        <div class="filter-panel__handle"></div>
        <div class="filter-panel__header">
            <div class="filter-panel__title" id="filter-panel-title">
                ${t('filters_title')}
            </div>
            <button
                type="button"
                class="filter-panel__close"
                id="filter-panel-close"
                aria-label="${t('filters_close')}"
            >
                ×
            </button>
        </div>
        <!-- АКТИВНОСТИ -->
        <div class="filter-section">
            <div class="filter-section__label" id="filter-label-activities">
                ${t('filters_busy_with')}
            </div>
            <div
                class="filter-chips"
                id="filter-activities"
            >
                ${
                    activities.map(item => `
                        <button
                            type="button"
                            class="filter-chip"
                            data-activity="${item.id}"
                        >
                            ${item.label}
                        </button>
                    `).join('')
                }
            </div>
        </div>
        <!-- ВОЗРАСТ -->
        <div class="filter-section">
            <div class="filter-section__label" id="filter-label-age">
                ${t('filters_age')}
            </div>
            <div class="filter-age-row">
                <label class="filter-age-field">
                    <span id="filter-age-from-label">${t('filters_age_from')}</span>
                    <input
                        id="filter-age-from"
                        type="number"
                        inputmode="numeric"
                        min="1"
                        max="120"
                        placeholder="18"
                    >
                </label>
                <label class="filter-age-field">
                    <span id="filter-age-to-label">${t('filters_age_to')}</span>
                    <input
                        id="filter-age-to"
                        type="number"
                        inputmode="numeric"
                        min="1"
                        max="120"
                        placeholder="45"
                    >
                </label>
            </div>
        </div>
        <!-- ОТНОШЕНИЯ -->
        <div class="filter-section">
            <div class="filter-section__label" id="filter-label-relationship">
                ${t('filters_relationship')}
            </div>
            <div
                class="filter-chips"
                id="filter-relationships"
            >
                ${
                    relationships.map(item => `
                        <button
                            type="button"
                            class="filter-chip"
                            data-relationship="${item.id}"
                        >
                            ${item.label}
                        </button>
                    `).join('')
                }
            </div>
        </div>
        <!-- РАДИУС -->
        <div class="filter-section">
            <div class="filter-section__label" id="filter-label-radius">
                ${t('filters_radius')}
            </div>
            <div
                class="filter-chips"
                id="filter-radius"
            >
                ${
                    radiusOptions.map(item => `
                        <button
                            type="button"
                            class="filter-chip"
                            data-radius="${item.value === null ? 'any' : item.value}"
                        >
                            ${item.label}
                        </button>
                    `).join('')
                }
            </div>
        </div>
        <!-- ACTIONS -->
        <div class="filter-actions">
            <button
                type="button"
                class="filter-btn filter-btn--ghost"
                id="filter-reset"
            >
                ${t('filters_reset')}
            </button>
            <button
                type="button"
                class="filter-btn filter-btn--primary"
                id="filter-apply"
            >
                ${t('filters_apply')}
            </button>
        </div>
    </div>
</div>
<!-- КНОПКА ПОД ПРОФИЛЕМ -->
<div class="filters-trigger">
    <button
        type="button"
        class="filters-trigger__btn"
        id="filters-open-btn"
    >
        <span id="filters-open-label">
            ${t('filters_btn')}
        </span>
    </button>
</div>
`;
}

/* ========================================
   BOTTOM BAR HIDE / SHOW
======================================== */

function hideBottomBar(){

    const bar =
        document.querySelector(
            '.bottom-bar'
        );

    if(!bar)
        return;

    bar.style.opacity = '0';
    bar.style.pointerEvents = 'none';
    bar.style.transform = 'translateY(20px)';
    bar.style.transition = 'opacity .2s ease, transform .2s ease';

}

function showBottomBar(){

    const bar =
        document.querySelector(
            '.bottom-bar'
        );

    if(!bar)
        return;

    bar.style.opacity = '';
    bar.style.pointerEvents = '';
    bar.style.transform = '';

}

/* ========================================
   OPEN / CLOSE
======================================== */

export function openFilterPanel(){

    const panel =
        document.querySelector(
            '#filter-panel'
        );

    if(!panel)
        return;

    // Закрываем настройки, если они открыты
    const settings =
        document.querySelector(
            '#settings-window'
        );

    const settingsButton =
        document.querySelector(
            '#settings-button'
        );

    if(settings){
        settings.classList.remove(
            'open'
        );
    }

    if(settingsButton){
        settingsButton.classList.remove(
            'open-state'
        );
        settingsButton.blur();
    }

    draft = getFilters();
    syncDraftToUI();
    hideBottomBar();

    panel.classList.add(
        'open'
    );

}

export function closeFilterPanel(){

    document
        .querySelector(
            '#filter-panel'
        )
        ?.classList.remove(
            'open'
        );

    showBottomBar();

}

/* ========================================
   INIT
======================================== */

function initFilterPanel(){

    if(panelInitialized)
        return;

    panelInitialized = true;

    draft = getFilters();

    const openBtn =
        document.querySelector(
            '#filters-open-btn'
        );

    const closeBtn =
        document.querySelector(
            '#filter-panel-close'
        );

    const backdrop =
        document.querySelector(
            '#filter-panel-backdrop'
        );

    const applyBtn =
        document.querySelector(
            '#filter-apply'
        );

    const resetBtn =
        document.querySelector(
            '#filter-reset'
        );

    openBtn?.addEventListener(
        'click',
        event => {
            event.preventDefault();
            event.stopPropagation();
            openFilterPanel();
        }
    );

    closeBtn?.addEventListener(
        'click',
        closeFilterPanel
    );

    backdrop?.addEventListener(
        'click',
        closeFilterPanel
    );

    applyBtn?.addEventListener(
        'click',
        () => {
            collectDraftFromUI();
            setFilters(
                draft
            );
            updateTriggerState();
            closeFilterPanel();
        }
    );

    resetBtn?.addEventListener(
        'click',
        () => {
            resetFilters();
            draft = getFilters();
            syncDraftToUI();
            updateTriggerState();
        }
    );

    document
        .querySelectorAll(
            '#filter-activities [data-activity]'
        )
        .forEach(btn => {

            btn.addEventListener(
                'click',
                () => {

                    const id =
                        btn.dataset.activity;

                    if(!draft.activities)
                        draft.activities = [];

                    if(
                        draft.activities.includes(id)
                    ){
                        draft.activities =
                            draft.activities.filter(
                                item => item !== id
                            );
                    }
                    else{
                        draft.activities = [
                            ...draft.activities,
                            id
                        ];
                    }

                    syncDraftToUI();

                }
            );

        });

    document
        .querySelectorAll(
            '#filter-relationships [data-relationship]'
        )
        .forEach(btn => {

            btn.addEventListener(
                'click',
                () => {

                    const id =
                        btn.dataset.relationship;

                    if(!draft.relationshipStatuses)
                        draft.relationshipStatuses = [];

                    if(
                        draft.relationshipStatuses.includes(id)
                    ){
                        draft.relationshipStatuses =
                            draft.relationshipStatuses.filter(
                                item => item !== id
                            );
                    }
                    else{
                        draft.relationshipStatuses = [
                            ...draft.relationshipStatuses,
                            id
                        ];
                    }

                    syncDraftToUI();

                }
            );

        });

    document
        .querySelectorAll(
            '#filter-radius [data-radius]'
        )
        .forEach(btn => {

            btn.addEventListener(
                'click',
                () => {

                    const raw =
                        btn.dataset.radius;

                    draft.radiusMeters =
                        raw === 'any'
                            ? null
                            : Number(raw);

                    syncDraftToUI();

                }
            );

        });

    updateTriggerState();

    window.addEventListener(
        'filters:changed',
        updateTriggerState
    );

    window.addEventListener(
        'language:changed',
        () => {
            updateFilterPanelTexts();
            updateTriggerState();
        }
    );

}

/* ========================================
   UPDATE TEXTS ON LANGUAGE CHANGE
======================================== */

function updateFilterPanelTexts(){

    const setText = (id, key) => {
        const el = document.querySelector(id);
        if (el) el.textContent = t(key);
    };

    setText('#filter-panel-title', 'filters_title');
    setText('#filter-label-activities', 'filters_busy_with');
    setText('#filter-label-age', 'filters_age');
    setText('#filter-age-from-label', 'filters_age_from');
    setText('#filter-age-to-label', 'filters_age_to');
    setText('#filter-label-relationship', 'filters_relationship');
    setText('#filter-label-radius', 'filters_radius');
    setText('#filter-reset', 'filters_reset');
    setText('#filter-apply', 'filters_apply');

    const closeBtn = document.querySelector('#filter-panel-close');
    if (closeBtn) closeBtn.setAttribute('aria-label', t('filters_close'));

    // Обновляем чипы активностей
    getActivities().forEach(item => {
        const btn = document.querySelector(
            `#filter-activities [data-activity="${item.id}"]`
        );
        if (btn) btn.textContent = item.label;
    });

    // Обновляем чипы отношений
    getRelationships().forEach(item => {
        const btn = document.querySelector(
            `#filter-relationships [data-relationship="${item.id}"]`
        );
        if (btn) btn.textContent = item.label;
    });

    // Обновляем чипы радиуса
    getRadiusOptions().forEach(item => {
        const key = item.value === null ? 'any' : String(item.value);
        const btn = document.querySelector(
            `#filter-radius [data-radius="${key}"]`
        );
        if (btn) btn.textContent = item.label;
    });

}

/* ========================================
   UI SYNC
======================================== */

function syncDraftToUI(){

    if(!draft)
        draft = getFilters();

    document
        .querySelectorAll(
            '#filter-activities [data-activity]'
        )
        .forEach(btn => {

            const id =
                btn.dataset.activity;

            btn.classList.toggle(
                'active',
                (draft.activities || []).includes(id)
            );

        });

    document
        .querySelectorAll(
            '#filter-relationships [data-relationship]'
        )
        .forEach(btn => {

            const id =
                btn.dataset.relationship;

            btn.classList.toggle(
                'active',
                (draft.relationshipStatuses || []).includes(id)
            );

        });

    document
        .querySelectorAll(
            '#filter-radius [data-radius]'
        )
        .forEach(btn => {

            const raw =
                btn.dataset.radius;

            const value =
                raw === 'any'
                    ? null
                    : Number(raw);

            const active =
                draft.radiusMeters == null
                    ? value == null
                    : Number(draft.radiusMeters) === value;

            btn.classList.toggle(
                'active',
                active
            );

        });

    const ageFrom =
        document.querySelector(
            '#filter-age-from'
        );

    const ageTo =
        document.querySelector(
            '#filter-age-to'
        );

    if(ageFrom){
        ageFrom.value =
            draft.ageFrom != null
                ? String(draft.ageFrom)
                : '';
    }

    if(ageTo){
        ageTo.value =
            draft.ageTo != null
                ? String(draft.ageTo)
                : '';
    }

}

function collectDraftFromUI(){

    if(!draft)
        draft = getFilters();

    const ageFromRaw =
        document.querySelector(
            '#filter-age-from'
        )?.value;

    const ageToRaw =
        document.querySelector(
            '#filter-age-to'
        )?.value;

    const ageFrom =
        ageFromRaw
            ? Number(ageFromRaw)
            : null;

    const ageTo =
        ageToRaw
            ? Number(ageToRaw)
            : null;

    draft.ageFrom =
        Number.isFinite(ageFrom)
            ? ageFrom
            : null;

    draft.ageTo =
        Number.isFinite(ageTo)
            ? ageTo
            : null;

}

function updateTriggerState(){

    const btn =
        document.querySelector(
            '#filters-open-btn'
        );

    if(!btn)
        return;

    const active =
        hasActiveFilters();

    btn.classList.toggle(
        'has-active',
        active
    );

    const label =
        document.querySelector(
            '#filters-open-label'
        );

    if(label){
        label.textContent =
            active
                ? t('filters_btn_active')
                : t('filters_btn');
    }

}