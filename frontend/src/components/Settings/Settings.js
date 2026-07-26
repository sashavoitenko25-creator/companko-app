import './Settings.css';

import {
    setMapTheme,
    getMapTheme,
    reloadMapTheme
}
from '../../services/map/mapThemeService';

import {
    getMap
}
from '../../services/map/mapService';

import L from 'leaflet';

export function Settings(){

return `

<div
id="settings-window"
class="settings-window"
>

<h2>
⚙ Настройки
</h2>

<div class="theme-switch">

<span class="theme-icon">
🌙
</span>

<label class="switch">

<input
type="checkbox"
id="map-theme-toggle"
/>

<span class="slider"></span>

</label>

<span class="theme-icon">
☀️
</span>

</div>

<div class="settings-actions">

<button
id="report-problem-button"
class="settings-action"
>
🐞 Сообщить о проблеме
</button>

<button
id="suggest-idea-button"
class="settings-action"
>
💡 Предложить идею
</button>

</div>

</div>

`;

}

export function initSettings(){

const toggle =
document.querySelector(
'#map-theme-toggle'
);

if(toggle){

    toggle.checked =
    getMapTheme() === 'light';

    toggle.onchange = ()=>{

        const theme =
        toggle.checked
        ?
        'light'
        :
        'dark';

        setMapTheme(theme);

        const map =
        getMap();

        if(map){

            reloadMapTheme(
                map,
                L
            );

        }

    };

}

const reportButton =
document.querySelector(
'#report-problem-button'
);

if(reportButton){

    reportButton.onclick = ()=>{

        document
        .querySelector('#settings-window')
        ?.classList.remove('open');

        setTimeout(()=>{

            window.dispatchEvent(
                new Event(
                    'feedback:problem'
                )
            );

        },200);

    };

}

const ideaButton =
document.querySelector(
'#suggest-idea-button'
);

if(ideaButton){

    ideaButton.onclick = ()=>{

        document
        .querySelector('#settings-window')
        ?.classList.remove('open');

        setTimeout(()=>{

            window.dispatchEvent(
                new Event(
                    'feedback:idea'
                )
            );

        },200);

    };

}

}