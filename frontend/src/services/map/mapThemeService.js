let currentLayer = null;


const DARK_MAP =
'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';


const LIGHT_MAP =
'https://tile.openstreetmap.org/{z}/{x}/{y}.png';



export function getMapTheme(){


    return localStorage.getItem(
        'map-theme'
    ) || 'dark';


}





export function setMapTheme(theme){


    localStorage.setItem(
        'map-theme',
        theme
    );


}





export function getTileUrl(){


    const theme =
    getMapTheme();



    if(theme === 'light'){


        return LIGHT_MAP;


    }


    return DARK_MAP;


}





export function setCurrentTileLayer(layer){


    currentLayer = layer;


}





export function reloadMapTheme(map, L){



    if(currentLayer){


        map.removeLayer(
            currentLayer
        );


    }





    currentLayer =
    L.tileLayer(

        getTileUrl(),

        {

            maxZoom:19

        }

    )
    .addTo(map);



    setCurrentTileLayer(
        currentLayer
    );


}