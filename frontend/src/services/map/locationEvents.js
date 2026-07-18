import L from 'leaflet';


import {
    getMap
} from './mapService';


import {
    getProfile
} from '../../features/profile/profileStore';


import {
    getLiveState
} from '../../store/liveStore';


import {
    UserMarker
} from '../../components/UserMarker';




let myMarker = null;

let currentPosition = null;









export function initLocationEvents(){



    window.addEventListener(


        'location:updated',


        (event)=>{


            const position = event.detail;



            currentPosition = [


                position.lat,


                position.lng


            ];



            updateMyMarker();



        }


    );





    window.addEventListener(


        'live:started',


        ()=>{


            refreshMyMarker();


        }


    );





    window.addEventListener(


        'live:stopped',


        ()=>{


            refreshMyMarker();


        }


    );



}









function updateMyMarker(){



    const map = getMap();



    if(!map || !currentPosition)

        return;





    if(myMarker){


        myMarker.setLatLng(

            currentPosition

        );


        myMarker.setIcon(

            createIcon()

        );


        attachClick();


        return;


    }








    myMarker = L.marker(


        currentPosition,


        {

            icon:createIcon(),

            zIndexOffset:2000

        }


    )

    .addTo(map);





    attachClick();



}









function attachClick(){



    if(!myMarker)

        return;




    myMarker.off('click');





    myMarker.on(


        'click',


        ()=>{



            const live = getLiveState();



            const profile = getProfile();





            // если это свой LIVE

            if(live.session_id){



                console.log(

                    'MY LIVE CLICK'

                );



                window.dispatchEvent(



                    new CustomEvent(


                        'my-live:selected',


                        {


                            detail:{

                                profile,

                                live


                            }


                        }


                    )


                );



                return;


            }



        }


    );



}









function refreshMyMarker(){



    if(!myMarker)

        return;




    myMarker.setIcon(

        createIcon()

    );



}









function createIcon(){



    const live = getLiveState();


    const profile = getProfile();





    if(live.session_id){



        return L.divIcon({



            className:'',



            html:


            UserMarker({



                photo:


                profile?.photo_url ||


                profile?.photo ||


                'https://i.pravatar.cc/150'



            }),



            iconSize:[64,64],


            iconAnchor:[32,32]



        });



    }







    return L.divIcon({



        className:'',



        html:`



        <div class="my-location">


            <div class="my-location__pulse"></div>


        </div>



        `,


        iconSize:[30,30],


        iconAnchor:[15,15]



    });



}