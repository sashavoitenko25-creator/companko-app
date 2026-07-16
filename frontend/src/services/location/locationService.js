let currentPosition = null;



export function getCurrentPosition(){


    return currentPosition;


}




export function watchLocation(){


    if(!navigator.geolocation){


        console.error(
            "Geolocation not supported"
        );


        return;


    }





    navigator.geolocation.watchPosition(


        (position)=>{


            currentPosition = {


                lat:
                position.coords.latitude,


                lng:
                position.coords.longitude


            };



            window.dispatchEvent(

                new CustomEvent(

                    'location:updated',

                    {

                        detail:
                        currentPosition

                    }

                )

            );


        },



        (error)=>{


            console.error(
                error
            );


        },


        {


            enableHighAccuracy:true,


            timeout:10000,


            maximumAge:5000


        }


    );


}