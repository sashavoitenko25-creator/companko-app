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
⚙ Настройки карты
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



</div>


`;


}





export function initSettings(){


const toggle =
document.querySelector(
'#map-theme-toggle'
);



if(!toggle)
return;




toggle.checked =
getMapTheme()
===
'light';





toggle.onchange = ()=>{



const theme =
toggle.checked
?
'light'
:
'dark';




setMapTheme(
theme
);




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