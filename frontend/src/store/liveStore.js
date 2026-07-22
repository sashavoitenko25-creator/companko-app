let liveState = {


    session_id:null,


    activity:null,


    duration:null,


    expires_at:null


};





export function setActivity(value){

    liveState.activity=value;

}






export function setDuration(value){

    liveState.duration=value;

}






export function setLiveSession(session){


    if(!session)

        return;



    liveState={


        session_id:

        session.id || null,


        activity:

        session.activity || null,


        duration:

        session.duration || null,


        expires_at:

        session.expires_at || null


    };


}








export function clearLiveState(){


    liveState={


        session_id:null,


        activity:null,


        duration:null,


        expires_at:null


    };


}






export function getLiveState(){


    return liveState;


}