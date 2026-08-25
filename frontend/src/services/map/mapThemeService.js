/* =========================================================
   MAP THEME SERVICE
========================================================= */

let currentLayer = null;

const LIGHT_MAP =
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const DARK_MAP =
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

export function getMapTheme(){
    return (
        localStorage.getItem(
            'map-theme'
        ) || 'light'
    );
}

/** Класс на body для стилей кнопок */
export function applyMapThemeClass(theme){
    const t =
        theme === 'dark' ? 'dark' : 'light';

    document.body.classList.remove(
        'map-theme-light',
        'map-theme-dark'
    );

    document.body.classList.add(
        `map-theme-${t}`
    );
}

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

    applyMapThemeClass(theme);

    window.dispatchEvent(
        new CustomEvent(
            'map-theme:changed',
            {
                detail: { theme }
            }
        )
    );
}

export function getTileUrl(){
    const theme = getMapTheme();

    if(theme === 'dark'){
        return DARK_MAP;
    }

    return LIGHT_MAP;
}

export function setCurrentTileLayer(layer){
    currentLayer = layer;
}

export function getCurrentTileLayer(){
    return currentLayer;
}

export function reloadMapTheme(map, L){
    if(!map || !L)
        return;

    if(currentLayer){
        try{
            map.removeLayer(currentLayer);
        }
        catch(error){
            console.warn(
                'MAP OLD TILE REMOVE ERROR',
                error
            );
        }
    }

    const layer = L.tileLayer(
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

    layer.on(
        'tileerror',
        event=>{
            console.error(
                'MAP TILE ERROR',
                event.tile?.src
            );
        }
    );

    layer.addTo(map);
    setCurrentTileLayer(layer);

    // на всякий случай синхронизируем класс
    applyMapThemeClass(getMapTheme());

    return layer;
}

// при загрузке модуля сразу ставим класс
applyMapThemeClass(getMapTheme());