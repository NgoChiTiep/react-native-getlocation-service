/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
console.disableYellowBox = true;
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import AsyncStorage from '@react-native-community/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { getDistance } from 'geolib';
import React, { Component } from 'react';
import {
  Button,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import NotificationService from './NotificationService';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasGeoFence: false,
      region: {},
      listRegion: [],
      loading: false,
      buttonText: '',
    };
    this.notification = new NotificationService(this.onNotification);
  }

  //Gets called when the notification comes in
  onNotification = notif => {
    Alert.alert(notif.title, notif.message);
  };

  updateLocation = async location => {
    var list = [...this.state.listRegion];
    if (list.length > 0) {
      await list.map((item, i) => {
        let distance = getDistance(
          { latitude: item.latitude, longitude: item.longitude },
          {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        );
        console.log('distance');
        console.log(distance);
        console.log(item.radius);
        if (distance < item.radius) {
          if (!item.flag) {
            // let url = 'http://118.70.177.14:37168/api/merchant/location?lat=' +
            //   item.latitude +
            //   '&long=' +
            //   item.longitude;
            // fetch(url)
            //   .then(data => {
            //     console.log('respone call api');
            //     console.log(data);
            //   })
            this.notification.localNotification(
              'Thông báo',
              `Bạn đang ở gần ${item.value}`,
            );
            item.flag = true;
            console.log('-----------------');
            console.log(item);
          }
        } else {
          item.flag = false;
        }
      });
      this.setState({
        listRegion: list,
      });
    }
  };
  async configLocation() {
    var listDefine = await AsyncStorage.getItem('define_region');
    console.log(JSON.parse(listDefine));
    if (listDefine) {
      this.setState({
        listRegion: JSON.parse(listDefine),
      });
    }

    Geolocation.getCurrentPosition(
      res => {
        var region = {
          latitude: res.coords.latitude,
          longitude: res.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        };
        this.setState({
          region: region,
          loading: false,
        });
      },
      err => { },
    );

    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      // stationaryRadius: 50,
      distanceFilter: 100,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: false,
      notificationsEnabled: false,
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
        'X-FOO': 'bar',
      },
      // customize post properties
      postTemplate: {
        lat: '@latitude',
        lon: '@longitude',
        foo: 'bar', // you can also add your own properties
      },
    });

    BackgroundGeolocation.on('location', location => {
      this.updateLocation(location);
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

    BackgroundGeolocation.on('stationary', stationaryLocation => {
      // handle stationary locations here
      Actions.sendLocation(stationaryLocation);
    });

    BackgroundGeolocation.on('error', error => {
      console.log('[ERROR] BackgroundGeolocation error:', error);
    });

    BackgroundGeolocation.on('start', () => {
      console.log('[INFO] BackgroundGeolocation service has been started');
    });

    BackgroundGeolocation.on('stop', () => {
      console.log('[INFO] BackgroundGeolocation service has been stopped');
    });

    BackgroundGeolocation.on('authorization', status => {
      console.log(
        '[INFO] BackgroundGeolocation authorization status: ' + status,
      );
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(
          () =>
            Alert.alert(
              'App requires location tracking permission',
              'Would you like to open app settings?',
              [
                {
                  text: 'Yes',
                  onPress: () => BackgroundGeolocation.showAppSettings(),
                },
                {
                  text: 'No',
                  onPress: () => console.log('No Pressed'),
                  style: 'cancel',
                },
              ],
            ),
          1000,
        );
      }
    });

    BackgroundGeolocation.on('background', () => {
      console.log('[INFO] App is in background');
      Geolocation.getCurrentPosition(
        res => {
          this.updateLocation(res.coords);
        },
        err => { },
      );
    });
    if (Platform.OS == 'android') {
      BackgroundGeolocation.headlessTask(async event => {
        if (event.name === 'location' || event.name === 'stationary') {
          Geolocation.getCurrentPosition(
            res => {
              this.updateLocation(res.coords);
            },
            err => { },
          );
        }
      });
    }

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
      console.log(
        '[INFO] BackgroundGeolocation service is running',
        status.isRunning,
      );
      console.log(
        '[INFO] BackgroundGeolocation services enabled',
        status.locationServicesEnabled,
      );
      console.log(
        '[INFO] BackgroundGeolocation auth status: ' + status.authorization,
      );

      if (status.isRunning) {
        this.setState({
          buttonText: 'Stop Service',
        });
      } else {
        this.setState({
          buttonText: 'Start Service',
        });
      }

      // you don't need to check status before start (this is just the example)
      // BackgroundGeolocation.start(); //triggers start on start event
    });
  }


  async componentDidMount() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'OEV App',
          message: 'OEV App access to your location ',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.configLocation();
        console.log('You can use the location');
      } else {
        console.log('location permission denied');
      }
    } else {
      this.configLocation();
    }
  }

  componentWillUnmount() {
    BackgroundGeolocation.removeAllListeners();
  }
  render() {
    const width = Dimensions.get('window').width;
    const height = Dimensions.get('window').height;
    const { region, loading, buttonText, listRegion } = this.state;
    return (
      <ScrollView style={{ flexDirection: 'column', flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        {region.latitude && (
          <MapView
            style={{ width: width, height: height * 0.7 }}
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
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                    source={require('./assets/location.png')}
                  />
                  <Callout tooltip={true}  style={{ backgroundColor: "white", width: width*0.8, height: 100, borderRadius: 10 }} onPress={null}>
                    {/* <View style={{ backgroundColor: "white", width: width*0.8, height: 100, borderRadius: 10 }}> */}
                      <Text>{item.value}</Text>
                      <Button
                        title="Remove"
                        onPress={this.removeMarker}
                      />
                    {/* </View> */}
                  </Callout>
                </Marker>
              ))}

          </MapView>
        )}

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
          <Text style={{ fontSize: 13, color: 'grey', marginBottom: 5 }}>
            Location
          </Text>
          <Text style={{ fontSize: 13, color: 'grey', marginBottom: 10 }}>
            {loading ? 'Indentifying location....' : this.state.region.value}
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
          <View style={{ height: 20 }} />

          <Button
            title={buttonText}
            color={'#FD3376'}
            onPress={() => this.stopService()}
          />
        </View>
      </ScrollView>
    );
  }
  removeMarker(){
    
  }
  stopService() {
    BackgroundGeolocation.checkStatus(status => {
      console.log(
        '[INFO] BackgroundGeolocation service is running',
        status.isRunning,
      );
      console.log(
        '[INFO] BackgroundGeolocation services enabled',
        status.locationServicesEnabled,
      );
      console.log(
        '[INFO] BackgroundGeolocation auth status: ' + status.authorization,
      );

      if (status.isRunning) {
        BackgroundGeolocation.stop();
        this.setState({
          buttonText: 'Start Service',
        });
      } else {
        BackgroundGeolocation.start();
        this.setState({
          buttonText: 'Stop Service',
        });
      }
    });
  }
  setLoading = () => {
    this.setState({
      loading: true,
    });
  };
  chooseRegion = () => {
    var detail = {
      latitude: this.state.region.latitude,
      longitude: this.state.region.longitude,
      key: this.state.region.key,
      value: this.state.region.value,
      radius: this.state.region.radius,
      latitudeDelta: this.state.region.latitudeDelta,
      longitudeDelta: this.state.region.longitudeDelta,
    };
    this.setState(
      {
        listRegion: [...this.state.listRegion, detail],
      },
      async () => {
        var save = JSON.stringify(this.state.listRegion);
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
        var detail = {
          latitude: this.state.region.latitude,
          longitude: this.state.region.longitude,
          key: responseJson.results[0].place_id,
          value: responseJson.results[0].formatted_address,
          radius: 100,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        };
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
