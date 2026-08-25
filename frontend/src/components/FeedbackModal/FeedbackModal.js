import './FeedbackModal.css';

import {
    getProfile
} from '../../features/profile/profileStore';

import {
    sendFeedback
} from '../../services/supabase/feedbackService';

import {
    t
} from '../../i18n';

let feedbackType = 'problem';

export function FeedbackModal(){

    return `

<div
id="feedback-overlay"
class="feedback-overlay">

    <div class="feedback-modal">

        <button
        id="feedback-back"
        class="feedback-back">
            ←
        </button>

        <h2
        id="feedback-title">
            ${t('feedback_problem')}
        </h2>

        <textarea
        id="feedback-message"
        class="feedback-text"
        placeholder="${t('feedback_placeholder')}"
        ></textarea>

        <button
        id="feedback-send"
        class="feedback-send">
            ${t('feedback_send')}
        </button>

    </div>

</div>

`;

}

export function initFeedbackModal(){

    const overlay =
        document.querySelector(
            '#feedback-overlay'
        );

    const title =
        document.querySelector(
            '#feedback-title'
        );

    const textarea =
        document.querySelector(
            '#feedback-message'
        );

    const sendBtn =
        document.querySelector(
            '#feedback-send'
        );

    function updateFeedbackTexts(){

        if(textarea){
            textarea.placeholder =
                t('feedback_placeholder');
        }

        if(sendBtn){
            sendBtn.textContent =
                t('feedback_send');
        }

        // Обновляем заголовок только если модалка закрыта
        // (когда открыта — заголовок ставится по типу)
        if(
            title &&
            overlay &&
            !overlay.classList.contains('open')
        ){
            title.textContent =
                feedbackType === 'idea'
                    ? t('feedback_idea')
                    : t('feedback_problem');
        }

    }

    window.addEventListener(
        'feedback:problem',
        ()=>{

            feedbackType = 'problem';

            if(title){
                title.textContent =
                    t('feedback_problem');
            }

            if(textarea){
                textarea.value = '';
                textarea.placeholder =
                    t('feedback_placeholder');
            }

            if(sendBtn){
                sendBtn.textContent =
                    t('feedback_send');
            }

            overlay?.classList.add('open');

        }
    );

    window.addEventListener(
        'feedback:idea',
        ()=>{

            feedbackType = 'idea';

            if(title){
                title.textContent =
                    t('feedback_idea');
            }

            if(textarea){
                textarea.value = '';
                textarea.placeholder =
                    t('feedback_placeholder');
            }

            if(sendBtn){
                sendBtn.textContent =
                    t('feedback_send');
            }

            overlay?.classList.add('open');

        }
    );

    // Обновление текстов при смене языка
    window.addEventListener(
        'language:changed',
        ()=>{
            updateFeedbackTexts();
        }
    );

    document
        .querySelector('#feedback-back')
        ?.addEventListener('click', ()=>{

            overlay?.classList.remove('open');

        });

    if(overlay){

        overlay.onclick = (e)=>{

            if(e.target === overlay){

                overlay.classList.remove('open');

            }

        };

    }

    if(sendBtn){

        sendBtn.onclick = async ()=>{

            const text =
                textarea?.value.trim();

            if(!text)
                return;

            const profile =
                getProfile();

            try{

                await sendFeedback({

                    telegram_id:
                        profile.telegram_id,

                    first_name:
                        profile.first_name,

                    username:
                        profile.username,

                    type:
                        feedbackType,

                    message:
                        text

                });

                overlay?.classList.remove('open');

                setTimeout(()=>{

                    alert(
                        t('feedback_thanks')
                    );

                },200);

            }

            catch(error){

                console.error(error);

            }

        };

    }

}