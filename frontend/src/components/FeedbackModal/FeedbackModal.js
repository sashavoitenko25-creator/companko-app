import './FeedbackModal.css';

let currentType = 'problem';

export function FeedbackModal() {

return `

<div id="feedback-overlay" class="feedback-overlay">

    <div id="feedback-modal" class="feedback-modal">

        <button
            id="feedback-back"
            class="feedback-back">
            ←
        </button>

        <h2 id="feedback-title">
            Сообщить о проблеме
        </h2>

        <textarea
            id="feedback-text"
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

export function initFeedbackModal() {

const overlay =
document.querySelector('#feedback-overlay');

const modal =
document.querySelector('#feedback-modal');

const textarea =
document.querySelector('#feedback-text');

const title =
document.querySelector('#feedback-title');

if(!overlay || !modal)
    return;

window.addEventListener(
'feedback:problem',
()=>{

    currentType='problem';

    title.innerHTML='🐞 Сообщить о проблеме';

    textarea.value='';

    textarea.placeholder='Опишите проблему...';

    overlay.classList.add('open');

});

window.addEventListener(
'feedback:idea',
()=>{

    currentType='idea';

    title.innerHTML='💡 Предложить идею';

    textarea.value='';

    textarea.placeholder='Расскажите вашу идею...';

    overlay.classList.add('open');

});

overlay.onclick=(event)=>{

    if(event.target===overlay){

        overlay.classList.remove('open');

    }

};

document
.querySelector('#feedback-back')
.onclick=()=>{

    overlay.classList.remove('open');

};

document
.querySelector('#feedback-send')
.onclick=()=>{

    const text=
    textarea.value.trim();

    if(!text){

        textarea.focus();

        return;

    }

    console.log({

        type:currentType,

        text

    });

    textarea.value='';

    title.innerHTML='✅ Спасибо!';

    setTimeout(()=>{

        overlay.classList.remove('open');

        title.innerHTML=
        currentType==='problem'
        ?
        '🐞 Сообщить о проблеме'
        :
        '💡 Предложить идею';

    },1200);

};

}