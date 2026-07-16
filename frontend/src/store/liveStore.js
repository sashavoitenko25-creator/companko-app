let liveState = {

    activity:null,

    duration:null

};


export function setActivity(value){

    liveState.activity=value;

}


export function setDuration(value){

    liveState.duration=value;

}


export function getLiveState(){

    return liveState;

}