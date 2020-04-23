/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
const serviceLocation = async (taskData) => {
    //taskData.remainingTime tells you the remaining time of the geofencing
    // so you can reuse it to update yours
    console.log("taskData");
    console.log(taskData);
    // do stuff
    var listDefine = await AsyncStorage.getItem("define_region")
    RNSimpleNativeGeofencing.updateGeofences(
        listDefine,
        taskData.remainingTime
    );
};
AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('serviceLocation', () => serviceLocation);