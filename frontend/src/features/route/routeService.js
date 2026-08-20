import L from 'leaflet';


import {
    getMap
} from '../../services/map/mapService';


import {
    supabase
} from '../../services/supabase/supabaseClient';




let routeLine = null;

let activeUser = null;

let animationFrame = null;

let activeMode = 'car';

let mapListenersAttached = false;




/* =========================================================
   START ROUTE
========================================================= */

export async function startRoute(
    user,
    mode = 'car'
){

    activeUser = user;

    activeMode = mode;


    if(
        user.lat == null ||
        user.lng == null
    ){

        return null;

    }


    const position =
        await getCurrentPosition();


    if(!position){

        return null;

    }


    return await buildRoute(

        position.latitude,

        position.longitude,

        user.lat,

        user.lng

    );

}




/* =========================================================
   STOP ROUTE
========================================================= */

export function stopRoute(){

    const map =
        getMap();


    if(animationFrame){

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;

    }


    if(
        routeLine &&
        map
    ){

        map.removeLayer(
            routeLine
        );

    }


    routeLine = null;

    activeUser = null;


    /*
     * После удаления маршрута
     * отключаем наши слушатели.
     */

    if(map){

        removeMapListeners(
            map
        );

    }

}




/* =========================================================
   BUILD ROUTE
========================================================= */

async function buildRoute(

    fromLat,
    fromLng,

    toLat,
    toLng

){

    const map =
        getMap();


    if(!map){

        return null;

    }


    /*
     * Удаляем старый маршрут
     * перед созданием нового.
     */

    stopRoute();


    try{

        console.log(
            'Building route:',
            {

                fromLat,

                fromLng,

                toLat,

                toLng,

                mode:
                    activeMode

            }
        );


        const {
            data,
            error
        } =
            await supabase.functions.invoke(

                'route',

                {

                    body:{

                        fromLat,

                        fromLng,

                        toLat,

                        toLng,

                        mode:
                            activeMode

                    }

                }

            );


        if(error){

            console.error(

                'Route function error:',

                error

            );

            return null;

        }


        console.log(
            'Route response:',
            data
        );


        if(
            !data?.geometry
        ){

            console.error(

                'No route geometry:',

                data

            );

            return null;

        }


        const fullPath =

            data.geometry.coordinates.map(

                ([lng, lat]) => [

                    lat,

                    lng

                ]

            );


        /*
         * =====================================================
         * ROUTE LINE
         * =====================================================
         *
         * ВАЖНО:
         *
         * Используем Canvas renderer.
         *
         * Это значительно лучше работает
         * вместе с leaflet-rotate во время
         * вращения и перемещения карты.
         */

        routeLine =
            L.polyline(

                [],

                {

                    color:
                        '#7c3aed',

                    weight:
                        6,

                    opacity:
                        0.95,

                    lineCap:
                        'round',

                    lineJoin:
                        'round',

                    renderer:
                        L.canvas()

                }

            ).addTo(map);


        /*
         * =====================================================
         * FIT BOUNDS
         * =====================================================
         */

        map.fitBounds(

            fullPath,

            {

                padding:[
                    80,
                    80
                ],

                animate:true,

                duration:1

            }

        );


        /*
         * =====================================================
         * СИНХРОНИЗАЦИЯ С КАРТОЙ
         * =====================================================
         *
         * Во время:
         *
         * - вращения
         * - перемещения
         * - zoom
         *
         * принудительно обновляем renderer.
         */

        attachMapListeners(
            map
        );


        /*
         * =====================================================
         * АНИМАЦИЯ МАРШРУТА
         * =====================================================
         */

        animateRoute(
            fullPath
        );


        const distance =
            Number(
                data.distance
            ) || 0;


        const duration =
            Number(
                data.duration
            ) || 0;


        return {

            distance,

            duration:
                Math.max(

                    1,

                    Math.round(
                        duration / 60
                    )

                )

        };


    }

    catch(error){

        console.error(

            'Route error:',

            error

        );


        return null;

    }

}




/* =========================================================
   MAP LISTENERS
========================================================= */

function attachMapListeners(
    map
){

    if(
        mapListenersAttached
    ){

        return;

    }


    mapListenersAttached = true;


    /*
     * Обычное перемещение карты.
     */

    map.on(
        'move',
        refreshRouteRenderer
    );


    /*
     * Zoom.
     */

    map.on(
        'zoom',
        refreshRouteRenderer
    );


    /*
     * Начало/изменение вращения.
     */

    map.on(
        'rotate',
        refreshRouteRenderer
    );


    /*
     * На всякий случай обновляем
     * ещё и после завершения действий.
     */

    map.on(
        'moveend',
        refreshRouteRenderer
    );


    map.on(
        'zoomend',
        refreshRouteRenderer
    );


}




/* =========================================================
   REMOVE MAP LISTENERS
========================================================= */

function removeMapListeners(
    map
){

    if(
        !mapListenersAttached
    ){

        return;

    }


    map.off(
        'move',
        refreshRouteRenderer
    );


    map.off(
        'zoom',
        refreshRouteRenderer
    );


    map.off(
        'rotate',
        refreshRouteRenderer
    );


    map.off(
        'moveend',
        refreshRouteRenderer
    );


    map.off(
        'zoomend',
        refreshRouteRenderer
    );


    mapListenersAttached = false;

}




/* =========================================================
   REFRESH ROUTE RENDERER
========================================================= */

function refreshRouteRenderer(){

    if(!routeLine){

        return;

    }


    /*
     * Получаем renderer маршрута.
     */

    const renderer =
        routeLine._renderer;


    if(
        renderer &&
        typeof renderer._update === 'function'
    ){

        renderer._update();

    }


    /*
     * Дополнительное обновление
     * SVG/Canvas позиции.
     */

    if(
        typeof routeLine.redraw === 'function'
    ){

        routeLine.redraw();

    }

}




/* =========================================================
   ANIMATE ROUTE
========================================================= */

function animateRoute(
    points
){

    let i = 0;


    function draw(){

        if(!routeLine){

            return;

        }


        i += 5;


        routeLine.setLatLngs(

            points.slice(
                0,
                i
            )

        );


        /*
         * После каждого кадра
         * сразу обновляем положение
         * относительно карты.
         */

        refreshRouteRenderer();


        if(
            i < points.length
        ){

            animationFrame =
                requestAnimationFrame(
                    draw
                );

        }

        else{

            animationFrame = null;

        }

    }


    draw();

}




/* =========================================================
   CURRENT POSITION
========================================================= */

function getCurrentPosition(){

    return new Promise(
        resolve => {

            if(
                !navigator.geolocation
            ){

                resolve(null);

                return;

            }


            navigator.geolocation.getCurrentPosition(

                position => {

                    resolve({

                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude

                    });

                },


                error => {

                    console.error(

                        'Geolocation error:',

                        error

                    );


                    resolve(null);

                },


                {

                    enableHighAccuracy:true

                }

            );

        }

    );

}