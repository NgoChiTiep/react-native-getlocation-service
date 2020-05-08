import { Platform } from "react-native";
import { PERMISSIONS, request, check, RESULTS } from "react-native-permissions";
import Geolocation from '@react-native-community/geolocation';

const checkIOS = () => check(PERMISSIONS.IOS.LOCATION_ALWAYS)
    .then((result) => {
        console.log("result+++++r")
        console.log(result)
        switch (result) {
            case RESULTS.UNAVAILABLE:
                console.log(
                    'This feature is not available (on this device / in this context)',
                );
                break;
            case RESULTS.DENIED:
                console.log(
                    'The permission has not been requested / is denied but requestable',
                );
                break;
            case RESULTS.GRANTED:
                console.log('The permission is granted');
                break;
            case RESULTS.BLOCKED:
                console.log('The permission is denied and not requestable anymore');
                break;
        }
    })
    .catch((error) => {
        // …
    });


const checkAndroid = () => {
    return check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then(async (result) => {
            console.log("permisson-------")
            console.log(result)
            switch (result) {
                case RESULTS.UNAVAILABLE:
                    console.log(
                        'This feature is not available (on this device / in this context)',
                    );
                    break;
                case RESULTS.DENIED:
                    console.log(
                        'The permission has not been requested / is denied but requestable',
                    );
                    var region = await requestAndroid()
                    return region
                case RESULTS.GRANTED:
                    console.log('The permission is granted');
                    try {
                        var region = await getLocation()
                        return region
                    } catch (error) {
                        console.log("errorrrr")
                        return error
                    }
                case RESULTS.BLOCKED:
                    console.log('The permission is denied and not requestable anymore');
                    break;
            }
        })
        .catch((error) => {
            // …
        });
}
async function getLocation() {
    console.log("123123123")
    return new Promise((resolve, reject) =>
        Geolocation.getCurrentPosition(
            res => {
                console.log("222222")
                console.log(res)
                var region = {
                    latitude: res.coords.latitude,
                    longitude: res.coords.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001,
                };
                return resolve(region)
            },
            err => {
                console.log("1111111111111")
                console.log(err)
                var region = {
                    latitude: 21.027763,
                    longitude: 105.834160,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001,
                };
                return reject(region)
            },
        )
    )
}
function requestAndroid() {
    return request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((result) => {
        console.log("request")
        console.log(result)
        if (result == RESULTS.GRANTED) {
            return getLocation()
        }
        else {
            var region = {
                latitude: 21.027763,
                longitude: 105.834160,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001,
            };
            return region
        }
    });
}
export const checkPermisson = {
    checkIOS,
    checkAndroid,
    getLocation
}