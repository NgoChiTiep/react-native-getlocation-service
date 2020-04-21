/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import { getDistance, getPreciseDistance, getLatitude } from 'geolib';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image
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

const homePlace = { description: 'Home', geometry: { location: { lat: 21.0312269, lng: 105.7726269 } } };
const workPlace = { description: 'Work', geometry: { location: { lat: 21.0312269, lng: 105.7726269 } } };
const GooglePlacesInput = (props) => {
  return (
    <GooglePlacesAutocomplete
      placeholder='Search'
      minLength={2} // minimum length of text to search
      autoFocus={false}
      returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
      keyboardAppearance={'light'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
      listViewDisplayed='auto'    // true/false/undefined
      fetchDetails={true}
      onPress={(data, detail = null) => { // 'details' is provided when fetchDetails = true
        console.log("detail")
        console.log(data)
        props.onPress(data)
      }}

      getDefaultValue={() => ''}

      query={{
        // available options: https://developers.google.com/places/web-service/autocomplete
        key: 'AIzaSyACQH75po6ZJc1-u2BzbneQ76tZnD2BMps',
        language: 'en', // language of the results
        types: '(cities)' // default: 'geocode'
      }}

      styles={{
        textInputContainer: {
          width: '100%'
        },
        description: {
          fontWeight: 'bold'
        },
        predefinedPlacesDescription: {
          color: '#1faadb'
        }
      }}

      currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
      currentLocationLabel="Current location"
      nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
      GoogleReverseGeocodingQuery={{
        // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
      }}
      GooglePlacesSearchQuery={{
        // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
        rankby: 'distance',
        type: 'cafe'
      }}

      GooglePlacesDetailsQuery={{
        // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
        fields: 'formatted_address',
      }}

      filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
      predefinedPlaces={[homePlace, workPlace]}

      debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
    // renderLeftButton={()  => <Image source={require('path/custom/left-icon')} />}
    // renderRightButton={() => <Text>Custom text after the input</Text>}
    />
  );
}
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectLocation: {}
    }
  }

  updateLocation = (location) => {
    let distance = getDistance(
      { latitude: location.latitude, longitude: location.longitude },
      //location nhà tịp
      {
        latitude: this.state.selectLocation.location ? this.state.selectLocation.location.lat : 21.027763,
        longitude: this.state.selectLocation.location ? this.state.selectLocation.location.lng : 105.834160
      },
      //location hồ gươm
      // { latitude: 21.0312364, longitude: 105.7726794 },
    );
    console.log("distance")
    console.log(distance)
    if (distance < 500) {
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
  componentDidMount() {
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
        console.log("---------------------")
        console.log(event)
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

    // you can also just start without checking for status
    // BackgroundGeolocation.start();
  }

  componentWillUnmount() {
    // unregister all event listeners
    BackgroundGeolocation.removeAllListeners();


  }
  render() {
    return (
      <View>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            keyboardShouldPersistTaps="always"
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>

            <View style={styles.body}>

              <GooglePlacesInput onPress={this.onPress} />
              <Text>{this.state.selectLocation.description ? this.state.selectLocation.description : ""}</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    )
  }
  onPress = async (location) => {
    var url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${location.place_id}&key=AIzaSyACQH75po6ZJc1-u2BzbneQ76tZnD2BMps`
    await fetch(url).then((response) => response.json())
      .then((json) => {
        console.log(json)
        let newLocation = location
        newLocation.location = json.result.geometry.location
        this.setState({
          selectLocation: newLocation
        })
        console.log("newLocation")
        console.log(newLocation)
      })

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
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
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

