import './BottomSheet.css';

import {
    t
} from '../../i18n';

export function BottomSheet(){

    return `
    <div class="bottom-sheet">

        <div class="bottom-sheet__box">

            <h2 id="bs-title">
                ${t('start_live_title')}
            </h2>

            <h3 id="bs-what">
                ${t('bs_what_doing')}
            </h3>

            <div class="activity-options">

                <button 
                class="activity-option"
                data-activity="coffee"
                id="bs-act-coffee">
                    ☕
                    ${t('bs_coffee')}
                </button>

                <button 
                class="activity-option"
                data-activity="walk"
                id="bs-act-walk">
                    🚶
                    ${t('bs_walk')}
                </button>

                <button 
                class="activity-option"
                data-activity="talk"
                id="bs-act-talk">
                    💬
                    ${t('bs_talk')}
                </button>

                <button 
                class="activity-option"
                data-activity="sport"
                id="bs-act-sport">
                    🏃
                    ${t('bs_sport')}
                </button>

            </div>

            <h3 id="bs-time-label">
                ${t('bs_live_time')}
            </h3>

            <div class="time-options">

                <button data-time="30" id="bs-time-30">
                    ${t('min_30')}
                </button>

                <button data-time="60" id="bs-time-60">
                    ${t('hour_1')}
                </button>

                <button data-time="120" id="bs-time-120">
                    ${t('hour_2')}
                </button>

            </div>

            <button 
            class="bottom-sheet__start"
            id="bs-start">
                ${t('bs_start')}
            </button>

        </div>

    </div>
    `;

}