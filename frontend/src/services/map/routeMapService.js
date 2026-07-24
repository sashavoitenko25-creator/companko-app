import L from 'leaflet';


let routeLine = null;



export function drawRoute(
    map,
    points
){


    if(routeLine){

        map.removeLayer(
            routeLine
        );

    }




    routeLine = L.polyline(

        points,

        {

            color:'#8b63ff',

            weight:6,

            opacity:.9

        }

    )
    .addTo(map);



    map.fitBounds(

        routeLine.getBounds(),

        {
            padding:[
                80,
                80
            ]
        }

    );


}



export function clearRoute(map){


    if(routeLine){


        map.removeLayer(
            routeLine
        );


        routeLine=null;


    }


}