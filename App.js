/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
console.disableYellowBox = true;
import { getDistance, getPreciseDistance, getLatitude } from 'geolib';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import AsyncStorage from '@react-native-community/async-storage';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  Button
} from 'react-native';
import { PermissionsAndroid } from "react-native";
import React, { Component } from 'react'
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
      },
      regionUser: {

      },
      pickRegion: {

      },
      listRegion: [

      ],
      placeID: "",
      stringRegion: "",
      loading: false
    }
  }


  updateLocation = (location) => {
    console.log("--------------get distance")
    console.log(location)
    if (this.state.listRegion.length > 0) {
      this.state.listRegion.forEach((item, i) => {
        let distance = getDistance(
          { latitude: item.latitude, longitude: item.longitude },
          {
            latitude: location.latitude,
            longitude: location.longitude
          },
        );
        console.log("distance")
        console.log(distance)
        if (distance < item.radius) {
          let url = 'http://118.70.177.14:37168/api/merchant/location?lat=' +
            item.latitude +
            '&long=' +
            item.longitude;
          fetch(url).then(data => {
            console.log("respone")
            console.log(data)
          })
            .catch(err => {

            })
        }
      })
    }
  }
  async configLocation() {
    
    var listDefine = await AsyncStorage.getItem("define_region")
    console.log(JSON.parse(listDefine))
    if (listDefine) {
      this.setState({
        listRegion: JSON.parse(listDefine)
      })
    }
    // BackgroundGeolocation.getLocations((locations) => {
    //   console.log("locations[0]")
    //   console.log(locations[0])
    //   var region = {
    //     latitude: locations[0].latitude,
    //     longitude: locations[0].longitude,
    //     latitudeDelta: 0.001,
    //     longitudeDelta: 0.001
    //   }
    //   this.setState({
    //     region: region,
    //     loading: false
    //   })
    // })
    navigator.geolocation.getCurrentPosition(
      position => {
        const location = JSON.stringify(position);
        console.log("888888888888888")
        console.log(location)
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      // stationaryRadius: 50,
      // distanceFilter: 50,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: true,
      startOnBoot: true,
      stopOnTerminate: false,
      startForeground: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
      url: 'http://192.168.81.15:3000/location',
      httpHeaders: {
        'X-FOO': 'bar'
      },
      // customize post properties
      postTemplate: {
        lat: '@latitude',
        lon: '@longitude',
        foo: 'bar' // you can also add your own properties
      }
    });

    BackgroundGeolocation.on('location', (location) => {
      this.updateLocation(location)
      // handle your locations here
      // to perform long running operation on iOS
      // you need to create background task
      BackgroundGeolocation.startTask(taskKey => {

        // execute long running task
        // eg. ajax post location
        // IMPORTANT: task has to be ended by endTask
        BackgroundGeolocation.endTask(taskKey);
      });
    });

    BackgroundGeolocation.on('stationary', (stationaryLocation) => {
      // handle stationary locations here
      Actions.sendLocation(stationaryLocation);
    });

    BackgroundGeolocation.on('error', (error) => {
      console.log('[ERROR] BackgroundGeolocation error:', error);
    });

    BackgroundGeolocation.on('start', () => {
      console.log('[INFO] BackgroundGeolocation service has been started');
    });

    BackgroundGeolocation.on('stop', () => {
      console.log('[INFO] BackgroundGeolocation service has been stopped');
    });

    BackgroundGeolocation.on('authorization', (status) => {
      console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(() =>
          Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
            { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
            { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
          ]), 1000);
      }
    });

    BackgroundGeolocation.on('background', () => {
      console.log('[INFO] App is in background');

      BackgroundGeolocation.getLocations((locations) => {
        this.updateLocation(locations[0])
      }
      );
    });

    BackgroundGeolocation.headlessTask(async (event) => {
      if (event.name === 'location' ||
        event.name === 'stationary') {
        BackgroundGeolocation.getLocations((locations) => {
          this.updateLocation(locations[0])
        }
        );
      }
    });
    BackgroundGeolocation.on('foreground', () => {
      console.log('[INFO] App is in foreground');
    });

    BackgroundGeolocation.on('abort_requested', () => {
      console.log('[INFO] Server responded with 285 Updates Not Required');

      // Here we can decide whether we want stop the updates or not.
      // If you've configured the server to return 285, then it means the server does not require further update.
      // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
      // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
    });

    BackgroundGeolocation.on('http_authorization', () => {
      console.log('[INFO] App needs to authorize the http requests');
    });

    BackgroundGeolocation.checkStatus(status => {
      console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
      console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
      console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

      // you don't need to check status before start (this is just the example)
      BackgroundGeolocation.start(); //triggers start on start event
    });
  }
  async componentDidMount() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'OEV App',
          'message': 'OEV App access to your location '
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.configLocation()
        console.log("You can use the location")
      } else {
        console.log("location permission denied")
      }
    }

  }

  componentWillUnmount() {
    BackgroundGeolocation.removeAllListeners();
  }
  render() {
    const width = Dimensions.get('window').width
    const height = Dimensions.get('window').height
    const { region, regionUser, loading, pickRegion, listRegion } = this.state
    return (
      <ScrollView style={{ flexDirection: "column", flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        {
          region.latitude &&
          <MapView
            style={{ width: width, height: height * 0.7 }}
            initialRegion={region}
            onRegionChangeComplete={this.onRegionChange}
            showsUserLocation={true}
          >
            <Marker
              coordinate={{
                "latitude": this.state.region.latitude,
                "longitude": this.state.region.longitude
              }}
              draggable
            />
            {
              listRegion.length > 0 && listRegion.map((item, i) => <Marker
                key={i}
                coordinate={{
                  "latitude": item.latitude,
                  "longitude": item.longitude
                }}
                draggable >
                <Image
                  style={{ width: 40, height: 40, }}
                  resizeMode="contain"
                  source={require("./assets/location.png")}
                />
              </Marker>)
            }
          </MapView>
        }

        <View style={{ flex: 1, backgroundColor: "white", paddingHorizontal: 10, paddingVertical: 10 }}>
          <Text style={{ fontWeight: "bold", fontSize: 15, color: "grey", marginBottom: 15 }}>Move map for location</Text>
          <Text style={{ fontSize: 13, color: "grey", marginBottom: 5 }}>Location</Text>
          <Text style={{ fontSize: 13, color: "grey", marginBottom: 10 }}>
            {loading ?
              "Indentifying location...." : this.state.region.value}</Text>
          <View style={{ width: "100%", height: 0.7, backgroundColor: "grey", marginBottom: 10 }} />
          <Button
            title="Pick this location"
            color="#3976ff"
            disabled={loading ? true : false}
            onPress={this.chooseRegion}
          />
        </View>
      </ScrollView>
    )
  }
  setLoading = () => {
    this.setState({
      loading: true
    })
  }
  chooseRegion = () => {
    this.setState({
      listRegion: [...this.state.listRegion, this.state.region]
    }, async () => {
      var save = JSON.stringify(this.state.listRegion)
      await AsyncStorage.setItem('define_region', save)
    })
  }
  onRegionChange = (region) => {
    this.setState({
      region: region,
      loading: true
    }, () => this.fetchAddress())
  }
  fetchAddress = () => {
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.region.latitude},${this.state.region.longitude}&key=AIzaSyACQH75po6ZJc1-u2BzbneQ76tZnD2BMps`)
      .then((response) => response.json())
      .then((responseJson) => {
        var detail = { ...this.state.region }
        detail.key = responseJson.results[0].place_id
        detail.value = responseJson.results[0].formatted_address
        detail.radius = 100
        this.setState({
          region: detail,
          loading: false
        });
      });
  }
}


