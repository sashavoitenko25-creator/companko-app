export function getCurrentLocation() {

    return new Promise((resolve, reject) => {

        if (!navigator.geolocation) {
            reject(
                new Error('Geolocation is not supported')
            );
            return;
        }


        navigator.geolocation.getCurrentPosition(
            (position)=>{

                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });

            },
            (error)=>{
                reject(error);
            },
            {
                enableHighAccuracy:true,
                timeout:10000
            }
        );

    });

}