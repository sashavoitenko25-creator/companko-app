import './AdminPanel.css';

import {
    getFeedback,
    deleteFeedback
}
from '../../services/supabase/feedbackService';

let currentType = 'problem';

export function AdminPanel(){

return `

<div
id="admin-panel"
class="admin-panel">

    <div class="admin-header">

        <button
        id="admin-back"
        class="admin-back">

            ←

        </button>

        <h2>
            Админка
        </h2>

    </div>

    <div class="admin-tabs">

        <button
        id="admin-problems"
        class="admin-tab active">

            🐞 Проблемы

        </button>

        <button
        id="admin-ideas"
        class="admin-tab">

            💡 Идеи

        </button>

    </div>

    <div
    id="admin-list"
    class="admin-list">

    </div>

</div>

`;

}

export function initAdminPanel(){

    const panel =
    document.querySelector('#admin-panel');

    document
    .querySelector('#admin-back')
    ?.addEventListener(
        'click',
        ()=>{

            panel.classList.remove('open');

        }
    );

    document
    .querySelector('#admin-problems')
    ?.addEventListener(
        'click',
        ()=>{

            currentType='problem';

            updateTabs();

            loadFeedback();

        }
    );

    document
    .querySelector('#admin-ideas')
    ?.addEventListener(
        'click',
        ()=>{

            currentType='idea';

            updateTabs();

            loadFeedback();

        }
    );

}

function updateTabs(){

    document
    .querySelector('#admin-problems')
    ?.classList.toggle(
        'active',
        currentType==='problem'
    );

    document
    .querySelector('#admin-ideas')
    ?.classList.toggle(
        'active',
        currentType==='idea'
    );

}

export async function loadFeedback(){

    const list =
    document.querySelector('#admin-list');

    if(!list)
        return;

    list.innerHTML='Загрузка...';

    const feedback =
    await getFeedback(currentType);

    if(!feedback.length){

        list.innerHTML='Сообщений нет';

        return;

    }

    list.innerHTML='';

    feedback.forEach(item=>{

        const card =
        document.createElement('div');

        card.className='admin-item';

        card.innerHTML=`

<div class="admin-name">

${item.first_name || 'Без имени'}

</div>

<div class="admin-date">

${new Date(item.created_at).toLocaleString()}

</div>

<div class="admin-message">

${item.message}

</div>

<button
class="admin-delete">

Удалить

</button>

`;

        card
        .querySelector('.admin-delete')
        .onclick=async()=>{

            await deleteFeedback(item.id);

            loadFeedback();

        };

        list.appendChild(card);

    });

}