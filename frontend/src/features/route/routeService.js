import L from 'leaflet';
import { getMap } from '../../services/map/mapService';

let routeLine = null;
let activeUser = null;
let animationFrame = null;

export async function startRoute(user) {
    activeUser = user;

    if (user.lat == null || user.lng == null) return;

    const position = await getCurrentPosition();

    if (!position) return;

    await buildRoute(
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
    activeUser = null;
}

export function getRoute() {
    return activeUser;
}

async function buildRoute(fromLat, fromLng, toLat, toLng) {

    const map = getMap();
    if (!map) return;

    stopRoute();

    try {

        const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/` +
            `${fromLng},${fromLat};${toLng},${toLat}` +
            `?overview=full&geometries=geojson`
        );

        const json = await response.json();

        if (!json.routes?.length) return;

        const fullPath = json.routes[0].geometry.coordinates.map(item => [
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

    } catch (error) {
        console.error(error);
    }
}

function animateRoute(points) {

    let index = 0;

    const speed = 4; // чем больше — тем быстрее рисуется

    function draw() {

        if (!routeLine) return;

        const next = Math.min(index + speed, points.length);

        routeLine.setLatLngs(
            points.slice(0, next)
        );

        if (next < points.length) {

            const p = points[next - 1];

            getMap().panTo(p, {
                animate: true,
                duration: 0.15
            });

            index = next;

            animationFrame = requestAnimationFrame(draw);

        } else {

            animationFrame = null;

        }
    }

    draw();
}

function getCurrentPosition() {

    return new Promise(resolve => {

        navigator.geolocation.getCurrentPosition(

            position => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }),

            () => resolve(null),

            {
                enableHighAccuracy: true
            }

        );

    });

}