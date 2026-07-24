import L from 'leaflet';
import { getMap } from '../../services/map/mapService';

let routeLine = null;
let activeUser = null;
let animationFrame = null;
let activeMode = 'driving';

const PROFILE = {
    car: 'driving',
    bike: 'cycling',
    foot: 'foot'
};

export async function startRoute(user, mode = 'driving') {

    activeUser = user;
    activeMode = mode;

    if (user.lat == null || user.lng == null) return null;

    const position = await getCurrentPosition();

    if (!position) return null;

    return await buildRoute(
        position.latitude,
        position.longitude,
        user.lat,
        user.lng
    );

}

export function stopRoute() {
    const map = getMap();

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    if (routeLine && map) {
        map.removeLayer(routeLine);
    }

    routeLine = null;
}

async function buildRoute(fromLat, fromLng, toLat, toLng) {

    const map = getMap();
    if (!map) return null;

    stopRoute();

    let profile = 'driving';

    switch (activeMode) {

        case 'foot':
            profile = 'foot';
            break;

        case 'bike':
            profile = 'bike';
            break;

        default:
            profile = 'driving';
            break;

    }

    try {

        const response = await fetch(
            `https://router.project-osrm.org/route/v1/${profile}/` +
            `${fromLng},${fromLat};${toLng},${toLat}` +
            `?overview=full&geometries=geojson`
        );

        const json = await response.json();

        if (!json.routes?.length) return null;

        const route = json.routes[0];

        const fullPath = route.geometry.coordinates.map(item => [
            item[1],
            item[0]
        ]);

        routeLine = L.polyline([], {
            color: '#7c3aed',
            weight: 6,
            opacity: 0.95
        }).addTo(map);

        map.fitBounds(fullPath, {
            padding: [80, 80],
            animate: true,
            duration: 1
        });

        animateRoute(fullPath);

        return {
            distance: route.distance,
            duration: Math.round(route.duration / 60)
        };

    } catch (error) {

        console.error(error);

        return null;

    }

}

function animateRoute(points) {

    let i = 0;

    function draw() {

        if (!routeLine) return;

        i += 5;

        routeLine.setLatLngs(
            points.slice(0, i)
        );

        if (i < points.length) {

            animationFrame =
                requestAnimationFrame(draw);

        }
    }

    draw();
}

function getCurrentPosition() {

    return new Promise(resolve => {

        navigator.geolocation.getCurrentPosition(

            pos => resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            }),

            () => resolve(null),

            {
                enableHighAccuracy: true
            }

        );

    });

}