import L from 'leaflet';
import { getMap } from '../../services/map/mapService';

let routeLine = null;
let activeUser = null;
let animationFrame = null;

const PROFILE = {
    car: 'driving',
    bike: 'cycling',
    foot: 'foot'
};

export async function startRoute(user, type = 'car') {
    activeUser = user;

    if (user.lat == null || user.lng == null) return null;

    const pos = await getCurrentPosition();
    if (!pos) return null;

    return await buildRoute(
        pos.latitude,
        pos.longitude,
        user.lat,
        user.lng,
        type
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

async function buildRoute(fromLat, fromLng, toLat, toLng, type) {

    stopRoute();

    const map = getMap();
    if (!map) return null;

    try {

        const profile = PROFILE[type] || 'driving';

        const response = await fetch(
            `https://router.project-osrm.org/route/v1/${profile}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
        );

        const json = await response.json();

        if (!json.routes || !json.routes.length)
            return null;

        const route = json.routes[0];

        const points = route.geometry.coordinates.map(p => [
            p[1],
            p[0]
        ]);

        routeLine = L.polyline([], {
            color: '#8B5CF6',
            weight: 6,
            opacity: 0.95
        }).addTo(map);

        map.fitBounds(points, {
            padding: [80, 80]
        });

        animateRoute(points);

        return {
            distance: Math.round(route.distance),
            duration: Math.round(route.duration / 60)
        };

    } catch (e) {

        console.error(e);

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