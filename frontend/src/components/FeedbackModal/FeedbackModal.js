import './FeedbackModal.css';

import {
    getProfile
} from '../../features/profile/profileStore';

import {
    sendFeedback
} from '../../services/supabase/feedbackService';

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
            Сообщить о проблеме
        </h2>

        <textarea
        id="feedback-message"
        class="feedback-text"
        placeholder="Опишите подробнее..."
        ></textarea>

        <button
        id="feedback-send"
        class="feedback-send">
            Отправить
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

    window.addEventListener(
        'feedback:problem',
        ()=>{

            feedbackType='problem';

            title.innerHTML='🐞 Сообщить о проблеме';

            textarea.value='';

            overlay.classList.add('open');

        }
    );

    window.addEventListener(
        'feedback:idea',
        ()=>{

            feedbackType='idea';

            title.innerHTML='💡 Предложить идею';

            textarea.value='';

            overlay.classList.add('open');

        }
    );

    document
        .querySelector('#feedback-back')
        .onclick=()=>{

            overlay.classList.remove('open');

        };

    overlay.onclick=(e)=>{

        if(e.target===overlay){

            overlay.classList.remove('open');

        }

    };

    document
        .querySelector('#feedback-send')
        .onclick=async()=>{

            const text=
            textarea.value.trim();

            if(!text)
                return;

            const profile=
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

                overlay.classList.remove('open');

            }

            catch(error){

                console.error(error);

            }

        };

}