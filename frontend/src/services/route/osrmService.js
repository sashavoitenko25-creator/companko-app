export async function getRoute(
    from,
    to,
    mode = 'foot'
){

    const profile =
        mode === 'bike'
        ?
        'bike'
        :
        mode === 'car'
        ?
        'car'
        :
        'foot';



    const url =

    `https://router.project-osrm.org/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;



    const response =
        await fetch(url);



    const data =
        await response.json();



    if(
        !data.routes ||
        !data.routes.length
    ){

        throw new Error(
            'Route not found'
        );

    }



    const route =
        data.routes[0];



    return {

        distance:
        Math.round(
            route.distance
        ),


        duration:
        Math.round(
            route.duration / 60
        ),


        geometry:
        route.geometry.coordinates.map(
            point=>[
                point[1],
                point[0]
            ]
        )

    };

}