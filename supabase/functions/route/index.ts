const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const profiles = {
    driving: 'driving-car',
    bike: 'cycling-regular',
    foot: 'foot-walking'
};

Deno.serve(async (req) => {

    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: corsHeaders
        });
    }

    try {

        const body = await req.json();

        const {
            fromLat,
            fromLng,
            toLat,
            toLng,
            mode = 'driving'
        } = body;

        if (
            typeof fromLat !== 'number' ||
            typeof fromLng !== 'number' ||
            typeof toLat !== 'number' ||
            typeof toLng !== 'number'
        ) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid coordinates'
                }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const profile =
            profiles[mode as keyof typeof profiles] ||
            profiles.driving;

        const apiKey = Deno.env.get('ORS_API_KEY');

        if (!apiKey) {

            return new Response(
                JSON.stringify({
                    error: 'ORS_API_KEY is not configured'
                }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const response = await fetch(
            `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
            {
                method: 'POST',

                headers: {
                    'Authorization': apiKey,
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    coordinates: [
                        [fromLng, fromLat],
                        [toLng, toLat]
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            console.error('OpenRouteService error:', data);

            return new Response(
                JSON.stringify({
                    error: 'Routing service error',
                    details: data
                }),
                {
                    status: response.status,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const feature = data.features?.[0];

        if (!feature) {

            return new Response(
                JSON.stringify({
                    error: 'No route found'
                }),
                {
                    status: 404,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const summary = feature.properties?.summary;

        return new Response(
            JSON.stringify({
                geometry: feature.geometry,

                distance: summary?.distance || 0,

                duration: summary?.duration || 0,

                mode
            }),
            {
                status: 200,

                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            }
        );

    } catch (error) {

        console.error(error);

        return new Response(
            JSON.stringify({
                error: error.message
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            }
        );
    }
});