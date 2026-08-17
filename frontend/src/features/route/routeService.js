import L from 'leaflet';
import { getMap } from '../../services/map/mapService';
import { supabase } from '../../services/supabase/supabaseClient';

let routeLine = null;
let activeUser = null;
let animationFrame = null;
let activeMode = 'driving';

export async function startRoute(user, mode = 'driving') {
    activeUser = user;
    activeMode = mode;

    if (user.lat == null || user.lng == null) {
        return null;
    }

    const position = await getCurrentPosition();

    if (!position) {
        return null;
    }

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

async function buildRoute(
    fromLat,
    fromLng,
    toLat,
    toLng
) {
    const map = getMap();

    if (!map) {
        return null;
    }

    stopRoute();

    try {
        const { data, error } = await supabase.functions.invoke(
            'route',
            {
                body: {
                    fromLat,
                    fromLng,
                    toLat,
                    toLng,
                    mode: activeMode
                }
            }
        );

        if (error) {
            console.error('Route function error:', error);
            return null;
        }

        if (!data?.geometry) {
            console.error('No route geometry:', data);
            return null;
        }

        const fullPath = data.geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
        );

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
            distance: data.distance,
            duration: Math.max(
                1,
                Math.round(data.duration / 60)
            )
        };

    } catch (error) {
        console.error('Route error:', error);
        return null;
    }
}

function animateRoute(points) {
    let i = 0;

    function draw() {
        if (!routeLine) {
            return;
        }

        i += 5;

        routeLine.setLatLngs(
            points.slice(0, i)
        );

        if (i < points.length) {
            animationFrame =
                requestAnimationFrame(draw);
        } else {
            animationFrame = null;
        }
    }

    draw();
}

function getCurrentPosition() {
    return new Promise(resolve => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
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
                enableHighAccuracy: true
            }
        );
    });
}