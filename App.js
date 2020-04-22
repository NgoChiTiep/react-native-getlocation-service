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
import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import React, { Component } from 'react'
import { PermissionsAndroid } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {

      },
      regionUser: {

      },
      stringRegion: "",
      loading: false
    }
  }

  updateLocation = (location) => {
    console.log("this.state.region")
    console.log(this.state.region)
    let distance = getDistance(
      { latitude: location.latitude, longitude: location.longitude },

      {
        latitude: this.state.region.latitude,
        longitude: this.state.region.longitude
      },
    );
    console.log("distance")
    console.log(distance)
    if (distance < 100) {
      let url = 'http://118.70.177.14:37168/api/merchant/location?lat=' +
        location.latitude +
        '&long=' +
        location.longitude;
      fetch(url).then(data => {
        console.log("respone")
        console.log(data)
      })
        .catch(err => {

        })
    }
  }
  async componentDidMount() {
    BackgroundGeolocation.getLocations((locations) => {
      console.log("locations[0]")
      console.log(locations[0])
      var region = {
        latitude: locations[0].latitude,
        longitude: locations[0].longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
      this.setState({
        region: region,
        loading: false
      })
    })
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
      var region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
      this.setState({
        regionUser: region,
      })
      console.log("this.state.regionUser")
      console.log(this.state.regionUser)
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
        var region = {
          latitude: locations[0].latitude,
          longitude: locations[0].longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
        this.setState({
          regionUser: region
        })
        this.updateLocation(locations[0])
      }
      );
    });

    BackgroundGeolocation.headlessTask(async (event) => {
      if (event.name === 'location' ||
        event.name === 'stationary') {
        BackgroundGeolocation.getLocations((locations) => {
          var region = {
            latitude: locations[0].latitude,
            longitude: locations[0].longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }
          this.setState({
            regionUser: region
          })
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

    // you can also just start without checking for status
    // BackgroundGeolocation.start();
  }

  componentWillUnmount() {
    BackgroundGeolocation.removeAllListeners();
  }
  render() {
    const width = Dimensions.get('window').width
    const height = Dimensions.get('window').height
    const { region, regionUser, loading } = this.state
    return (
      <View style={{ flexDirection: "column" }}>
        <StatusBar barStyle="dark-content" />
        {regionUser.latitude && region.latitude &&
          <MapView
            style={{ width: width, height: height * 0.7 }}
            // region={region}
            initialRegion={regionUser}
            onRegionChangeComplete={this.onRegionChange}
            showsUserLocation={true}
          >
            {/* <Marker
              coordinate={{
                "latitude": regionUser.latitude,
                "longitude": regionUser.longitude
              }}
              title={"Your Location"}
            /> */}
            <Marker
              coordinate={{
                "latitude": this.state.region.latitude,
                "longitude": this.state.region.longitude
              }}
              draggable >
              <Image
                style={{ width: 40, height: 40, }}
                resizeMode="contain"
                source={require("./assets/location.png")}
              />
            </Marker>

          </MapView>

        }
        <View style={{ backgroundColor: "white", paddingHorizontal: 10, paddingVertical: 10 }}>
          <Text style={{ fontWeight: "bold", fontSize: 15, color: "grey", marginBottom: 15 }}>Move map for location</Text>
          <Text style={{ fontSize: 13, color: "grey", marginBottom: 5 }}>Location</Text>
          <Text style={{ fontSize: 13, color: "grey", marginBottom: 10 }}>
            { loading?
            "Indentifying location...." : this.state.stringRegion}</Text>
          <View style={{ width: "100%", height: 0.7, backgroundColor: "grey", marginBottom: 10 }} />
          <Button
            title="Pick this location"
            color="#3976ff"
            disabled={loading? true : false}
            onPress={() => this.getRegion()}
          />
        </View>
      </View>
    

    )
  }
  setLoading = () =>{
    this.setState({
      loading: true
    })
  }
  getRegion = () => {
    console.log("!23213")
  }
  onRegionChange = (region) => {
    this.setState({
      region: region,
      loading: true
    }, ()=> this.fetchAddress())
  }
  fetchAddress = () => {
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.region.latitude},${this.state.region.longitude}&key=AIzaSyACQH75po6ZJc1-u2BzbneQ76tZnD2BMps`)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("responseJson")
        console.log(responseJson)
        const stringRegion = responseJson.results[0].formatted_address;
        this.setState({
          stringRegion: stringRegion,
          loading: false
        });
      });
  }


}


const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
    height: Dimensions.get('window').height
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  button: {
    width: 300, paddingVertical: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#3976ff"
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

