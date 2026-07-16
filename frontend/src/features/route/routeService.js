let activeRoute = null;



export function startRoute(user){


    activeRoute = user;


    window.dispatchEvent(

        new CustomEvent(
            'route:started',
            {
                detail:user
            }
        )

    );


}



export function stopRoute(){


    activeRoute = null;


    window.dispatchEvent(

        new CustomEvent(
            'route:stopped'
        )

    );


}



export function getRoute(){

    return activeRoute;

}