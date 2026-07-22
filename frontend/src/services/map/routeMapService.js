import L from 'leaflet';


let routeLine = null;



export function drawRoute(
    map,
    from,
    to
){


    if(routeLine){

        map.removeLayer(
            routeLine
        );

    }



    routeLine = L.polyline(

        [
            from,
            to
        ],

        {

            color:"#8b63ff",

            weight:5,

            opacity:0.8

        }

    )
    .addTo(map);




    map.fitBounds(

        [
            from,
            to
        ],

        {
            padding:[80,80]
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