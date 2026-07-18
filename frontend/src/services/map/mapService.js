let map = null;

let routeLine = null;

export function setMap(instance){

    map = instance;

}

export function getMap(){

    return map;

}

export function setRouteLine(line){

    routeLine = line;

}

export function getRouteLine(){

    return routeLine;

}

export function clearRouteLine(){

    if(map && routeLine){

        map.removeLayer(routeLine);

        routeLine = null;

    }

}