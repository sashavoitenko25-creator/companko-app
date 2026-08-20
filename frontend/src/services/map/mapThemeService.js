/* =========================================================
   MAP THEME SERVICE
========================================================= */


let currentLayer = null;


/* =========================================================
   DARK MAP
========================================================= */

const DARK_MAP =
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';


/* =========================================================
   LIGHT MAP
========================================================= */

const LIGHT_MAP =
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';


/* =========================================================
   GET THEME
========================================================= */

export function getMapTheme(){

    return (
        localStorage.getItem(
            'map-theme'
        ) || 'dark'
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

        theme = 'dark';

    }


    localStorage.setItem(
        'map-theme',
        theme
    );

}


/* =========================================================
   GET TILE URL
========================================================= */

export function getTileUrl(){

    const theme =
        getMapTheme();


    if(theme === 'light'){

        return LIGHT_MAP;

    }


    return DARK_MAP;

}


/* =========================================================
   CURRENT TILE LAYER
========================================================= */

export function setCurrentTileLayer(layer){

    currentLayer =
        layer;

}


export function getCurrentTileLayer(){

    return currentLayer;

}


/* =========================================================
   RELOAD MAP THEME
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
                'Не удалось удалить старый слой карты',
                error
            );

        }

    }


    /* -----------------------------------------
       Создаём новый слой
    ----------------------------------------- */

    const newLayer =
        L.tileLayer(

            getTileUrl(),

            {

                minZoom:2,

                maxZoom:19,

                maxNativeZoom:19,

                tileSize:256,

                updateWhenIdle:false,

                updateWhenZooming:true,

                keepBuffer:2,

                crossOrigin:true

            }

        );


    /* -----------------------------------------
       Добавляем карту
    ----------------------------------------- */

    newLayer.addTo(
        map
    );


    /* -----------------------------------------
       Сохраняем текущий слой
    ----------------------------------------- */

    setCurrentTileLayer(
        newLayer
    );


    return newLayer;

}