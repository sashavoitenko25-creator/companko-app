import './AdminPanel.css';

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