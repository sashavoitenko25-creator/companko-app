import './FilterPanel.css';

import {
    getFilters,
    setFilters,
    resetFilters,
    hasActiveFilters
} from '../../store/filterStore';


const ACTIVITIES = [
    { id: 'beer',  label: '🍺 Выпить' },
    { id: 'coffee', label: '☕ Кофе' },
    { id: 'walk',  label: '🚶 Гулять' },
    { id: 'chat',  label: '💬 Общаться' }
];


const RELATIONSHIPS = [
    { id: 'single',        label: '💔 Свободен / свободна' },
    { id: 'relationship',  label: '❤️ В отношениях' },
    { id: 'married',       label: '💍 Женат / замужем' },
    { id: 'not_specified', label: '🤫 Не указано' }
];


const RADIUS_OPTIONS = [
    { value: null,   label: 'Любой' },
    { value: 500,    label: '500 м' },
    { value: 1000,   label: '1 км' },
    { value: 3000,   label: '3 км' },
    { value: 5000,   label: '5 км' },
    { value: 10000,  label: '10 км' }
];


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

            <div class="filter-panel__title">
                Фильтры
            </div>

            <button
                type="button"
                class="filter-panel__close"
                id="filter-panel-close"
                aria-label="Закрыть"
            >
                ×
            </button>

        </div>


        <!-- АКТИВНОСТИ -->
        <div class="filter-section">

            <div class="filter-section__label">
                Чем заняты
            </div>

            <div
                class="filter-chips"
                id="filter-activities"
            >
                ${
                    ACTIVITIES.map(item => `
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

            <div class="filter-section__label">
                Возраст
            </div>

            <div class="filter-age-row">

                <label class="filter-age-field">
                    <span>От</span>
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
                    <span>До</span>
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

            <div class="filter-section__label">
                Статус отношений
            </div>

            <div
                class="filter-chips"
                id="filter-relationships"
            >
                ${
                    RELATIONSHIPS.map(item => `
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

            <div class="filter-section__label">
                Радиус
            </div>

            <div
                class="filter-chips"
                id="filter-radius"
            >
                ${
                    RADIUS_OPTIONS.map(item => `
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
                Сбросить
            </button>

            <button
                type="button"
                class="filter-btn filter-btn--primary"
                id="filter-apply"
            >
                Применить
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
            Фильтры
        </span>
        <span
            class="filters-trigger__arrow"
        >
            ▾
        </span>
    </button>

</div>

`;

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


    draft = getFilters();

    syncDraftToUI();

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


    /*
     * Чипы активностей
     */
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


    /*
     * Чипы отношений
     */
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


    /*
     * Радиус
     */
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
                ? 'Фильтры •'
                : 'Фильтры';

    }

}