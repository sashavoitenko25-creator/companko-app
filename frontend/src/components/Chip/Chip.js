import './Chip.css';


export function Chip({
    icon,
    text,
    active=false
}){

    return `

        <button class="chip ${active ? 'chip--active':''}">

            <span class="chip__icon">
                ${icon}
            </span>

            <span class="chip__text">
                ${text}
            </span>

        </button>

    `;

}