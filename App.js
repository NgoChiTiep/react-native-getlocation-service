/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
console.disableYellowBox = true;
import {getDistance, getPreciseDistance, getLatitude} from 'geolib';
// import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import AsyncStorage from '@react-native-community/async-storage';
import RNSimpleNativeGeofencing from 'react-native-simple-native-geofencing';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  NativeEventEmitter,
  Image,
  Dimensions,
  Button,
} from 'react-native';
import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import React, {Component, useState} from 'react';
import {PermissionsAndroid} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';

async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location permission',
        message: 'Needed obviously',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Granted Permission');
    } else {
      console.log('Denied Permission');
    }
  } catch (err) {
    console.warn(err);
  }
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasGeoFence: false,
      region: {
        latitude: 21.027763,
        longitude: 105.83416,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      },
      regionUser: {},
      pickRegion: {},
      listRegion: [],
      placeID: '',
      stringRegion: '',
      loading: false,
    };
  }
  componentWillMount() {
    //see above
    if (Platform.OS === 'android') {
      requestLocationPermission();
    }
  }
  componentDidMount = async () => {
    //set up Notifications
    RNSimpleNativeGeofencing.initNotification({
      channel: {
        title: 'Message Channel Title',
        description: 'Message Channel Description',
      },
      start: {
        notify: true,
        title: 'Start Tracking',
        description: 'You are now tracked',
      },
      stop: {
        notify: true,
        title: 'Stopped Tracking',
        description: 'You are not tracked any longer',
      },
      enter: {
        notify: true,
        title: 'Attention',
        //[value] will be replaced ob geofences' value attribute
        description: 'You entered a [value] Zone',
      },
      exit: {
        notify: true,
        title: 'Left Zone',
        description: 'You left a [value] Zone',
      },
    });
    var listDefine = await AsyncStorage.getItem('define_region');
    console.log('12321312');
    console.log(JSON.parse(listDefine));
    if (listDefine) {
      this.setState(
        {
          listRegion: JSON.parse(listDefine),
        },
        () => console.log(this.state.listRegion),
      );
    }

    const myModuleEvt = new NativeEventEmitter(RNSimpleNativeGeofencing);
    let subscription = myModuleEvt.addListener(
      'leftMonitoringBorderWithDuration',
      result => {
        //result is a Object with the remaining
        //duration of the activ geofences & a boolean
        //for leaving or entering the monitoring boarder

        console.log('Event :');
        console.log(JSON.stringify(result, null, 2));
      },
    );
  };
  fail() {
    console.log('Fail to start geofencing');
  }
  startMonitoring() {
    let geofences = [
      {
        key: 'geoNum1',
        latitude: 38.9204,
        longitude: -77.0175,
        radius: 200,
        value: 'yellow',
      },
      {
        key: 'geoNum2',
        latitude: 38.9248,
        longitude: -77.0258,
        radius: 100,
        value: 'green',
      },
      {
        key: 'geoNum3',
        latitude: 47.423,
        longitude: -122.084,
        radius: 150,
        value: 'red',
      },
    ];
    RNSimpleNativeGeofencing.addGeofences(geofences, 3000000, this.fail);
    this.setState({
      hasGeoFence: true,
    });
  }

  stopMonitoring() {
    RNSimpleNativeGeofencing.removeAllGeofences();
  }

  componentWillUnmount() {
    // BackgroundGeolocation.removeAllListeners();
  }
  render() {
    const width = Dimensions.get('window').width;
    const height = Dimensions.get('window').height;
    const {
      region,
      regionUser,
      loading,
      pickRegion,
      listRegion,
      hasGeoFence,
      startMonitoring,
    } = this.state;
    return (
      <ScrollView style={{flexDirection: 'column', flex: 1}}>
        <StatusBar barStyle="dark-content" />
        <MapView
          style={{width: width, height: height * 0.7}}
          initialRegion={region}
          onRegionChangeComplete={this.onRegionChange}
          showsUserLocation={true}>
          <Marker
            coordinate={{
              latitude: this.state.region.latitude,
              longitude: this.state.region.longitude,
            }}
            draggable
          />
          {listRegion.length > 0 &&
            listRegion.map((item, i) => (
              <Marker
                key={i}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                draggable>
                <Image
                  style={{width: 40, height: 40}}
                  resizeMode="contain"
                  source={require('./assets/location.png')}
                />
              </Marker>
            ))}
        </MapView>

        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            paddingHorizontal: 10,
            paddingVertical: 10,
          }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 15,
              color: 'grey',
              marginBottom: 15,
            }}>
            Move map for location
          </Text>
          <Text style={{fontSize: 13, color: 'grey', marginBottom: 5}}>
            Location
          </Text>
          <Text style={{fontSize: 13, color: 'grey', marginBottom: 10}}>
            {loading ? 'Indentifying location....' : this.state.region.title}
          </Text>
          <View
            style={{
              width: '100%',
              height: 0.7,
              backgroundColor: 'grey',
              marginBottom: 10,
            }}
          />
          <Button
            title="Pick this location"
            color="#3976ff"
            disabled={loading ? true : false}
            onPress={this.chooseRegion}
          />
        </View>
        <View style={styles.buttons}>
          {hasGeoFence ? (
            <Button
              onPress={stopMonitoring}
              style={styles.button}
              title="Stop Monitoring"
            />
          ) : (
            <Button
              onPress={startMonitoring}
              style={styles.button}
              title="Start Monitoring"
            />
          )}
          <Button
            onPress={() => onDelete(id)}
            style={styles.button}
            color="red"
            title="Delete"
          />
        </View>
      </ScrollView>
    );
  }
  setLoading = () => {
    this.setState({
      loading: true,
    });
  };
  chooseRegion = () => {
    this.setState(
      {
        listRegion: [...this.state.listRegion, this.state.region],
      },
      async () => {
        var save = JSON.stringify(this.state.listRegion);
        console.log('--------------------');
        console.log(save);
        await AsyncStorage.setItem('define_region', save);
      },
    );
  };
  onRegionChange = region => {
    this.setState(
      {
        region: region,
        loading: true,
      },
      () => this.fetchAddress(),
    );
  };
  fetchAddress = () => {
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
        this.state.region.latitude
      },${
        this.state.region.longitude
      }&key=AIzaSyACQH75po6ZJc1-u2BzbneQ76tZnD2BMps`,
    )
      .then(response => response.json())
      .then(responseJson => {
        var detail = {...this.state.region};
        detail.key = responseJson.results[0].place_id;
        detail.title = responseJson.results[0].formatted_address;
        detail.radius = 100;
        this.setState({
          region: detail,
          loading: false,
        });
      });
  };
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#fad7ff',
    padding: 10,
    marginTop: 8,
    marginHorizontal: 16,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  buttons: {
    backgroundColor: '#ffa6fc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    marginBottom: 8,
    marginHorizontal: 16,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  title: {
    fontSize: 32,
  },
  button: {
    alignSelf: 'center',
  },
  delete: {
    color: 'red',
  },
  remind: {
    color: 'blue',
  },
});
