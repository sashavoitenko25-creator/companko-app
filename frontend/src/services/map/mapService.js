import L from 'leaflet';



let mapInstance = null;


let currentTheme = 'dark';







const DARK_MAP =

'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';





const LIGHT_MAP =

'https://tile.openstreetmap.org/{z}/{x}/{y}.png';









export function setMap(map){


    mapInstance = map;


}







export function getMap(){


    return mapInstance;


}









export function setMapTheme(theme){



    const map = getMap();



    if(!map)

        return;





    currentTheme =

    theme === 'light'

        ? 'light'

        : 'dark';







    map.eachLayer(

        layer=>{


            if(

                layer instanceof L.TileLayer

            ){


                map.removeLayer(

                    layer

                );


            }


        }

    );








    L.tileLayer(

        getTileUrl(),

        {

            maxZoom:19

        }

    )

    .addTo(map);





}









export function getTileUrl(){



    if(

        currentTheme === 'light'

    ){


        return LIGHT_MAP;


    }



    return DARK_MAP;



}









export function getMapTheme(){


    return currentTheme;


}