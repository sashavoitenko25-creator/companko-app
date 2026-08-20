/* =========================================================
   MAP THEME SERVICE
========================================================= */

let currentLayer = null;


/* =========================================================
   КАРТЫ
========================================================= */

/*
 * Основная светлая карта
 */
const LIGHT_MAP =
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';


/*
 * Тёмная карта
 */
const DARK_MAP =
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';


/* =========================================================
   THEME
========================================================= */

export function getMapTheme(){

    return (
        localStorage.getItem(
            'map-theme'
        ) || 'light'
    );

}


/* =========================================================
   SET THEME
========================================================= */

export function setMapTheme(theme){

    if(
        theme !== 'dark' &&
        theme !== 'light'
    ){

        theme = 'light';

    }


    localStorage.setItem(
        'map-theme',
        theme
    );

}


/* =========================================================
   TILE URL
========================================================= */

export function getTileUrl(){

    const theme =
        getMapTheme();


    if(theme === 'dark'){

        return DARK_MAP;

    }


    return LIGHT_MAP;

}


/* =========================================================
   CURRENT LAYER
========================================================= */

export function setCurrentTileLayer(layer){

    currentLayer =
        layer;

}


export function getCurrentTileLayer(){

    return currentLayer;

}


/* =========================================================
   RELOAD THEME
========================================================= */

export function reloadMapTheme(
    map,
    L
){

    if(!map || !L)
        return;


    /* -----------------------------------------
       Удаляем старый слой
    ----------------------------------------- */

    if(currentLayer){

        try{

            map.removeLayer(
                currentLayer
            );

        }

        catch(error){

            console.warn(
                'MAP OLD TILE REMOVE ERROR',
                error
            );

        }

    }


    /* -----------------------------------------
       Новый слой
    ----------------------------------------- */

    const layer =
        L.tileLayer(

            getTileUrl(),

            {

                minZoom:2,

                maxZoom:19,

                maxNativeZoom:19,

                tileSize:256,

                updateWhenIdle:false,

                updateWhenZooming:true,

                keepBuffer:3,

                detectRetina:false,

                attribution:
                    '&copy; OpenStreetMap contributors'

            }

        );


    /* -----------------------------------------
       Ошибка тайла
    ----------------------------------------- */

    layer.on(

        'tileerror',

        event=>{

            console.error(
                'MAP TILE ERROR',
                event.tile?.src
            );

        }

    );


    /* -----------------------------------------
       Добавляем
    ----------------------------------------- */

    layer.addTo(
        map
    );


    setCurrentTileLayer(
        layer
    );


    return layer;

}