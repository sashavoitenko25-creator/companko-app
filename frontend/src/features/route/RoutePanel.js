import './route.css';


import {
    stopRoute,
    startRoute
} from './routeService';


import {
    getRoute
} from '../../services/route/osrmService';



export function RoutePanel(){

return `

<div
id="route-panel"
class="route-panel">


<div class="route-panel__title">

Маршрут

</div>



<div id="route-info"></div>



<div class="transport-buttons">


<button data-mode="foot">
🚶 Пешком
</button>


<button data-mode="bike">
🚲 Велосипед
</button>


<button data-mode="car">
🚗 Машина
</button>


</div>



<button id="route-cancel">

Отменить

</button>


</div>

`;

}





export function showRoute(user){


window.dispatchEvent(
new Event('ui:close-all')
);



const panel =
document.querySelector(
'#route-panel'
);



const info =
document.querySelector(
'#route-info'
);



if(!panel || !info)
return;




panel.classList.add(
'route-panel--open'
);



let mode='foot';




async function build(){


try{


info.innerHTML=`

<div>
Строим маршрут...
</div>

`;



const result =
await getRoute(

window.myLocation,

{

lat:user.latitude,

lng:user.longitude

},

mode

);




info.innerHTML=`

<div class="route-user">

${user.name}

</div>


<div>
📍 ${result.distance} м
</div>


<div>
⏱ ${result.duration} минут
</div>

`;



startRoute({

geometry:
result.geometry

});


}

catch(error){


console.error(
error
);


info.innerHTML=
`
Ошибка построения маршрута
`;

}


}




document

.querySelectorAll(
'.transport-buttons button'
)

.forEach(button=>{


button.onclick=()=>{


document

.querySelectorAll(
'.transport-buttons button'
)

.forEach(
b=>b.classList.remove(
'active'
)
);



button.classList.add(
'active'
);



mode =
button.dataset.mode;



build();



};


});




build();




document

.querySelector('#route-cancel')

.onclick=()=>{


panel.classList.remove(
'route-panel--open'
);


stopRoute();


};


}