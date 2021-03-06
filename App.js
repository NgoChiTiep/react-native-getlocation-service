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
import { getDistance, isPointWithinRadius } from 'geolib';
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
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import NotificationService from './NotificationService';
import ItemSearch from './ItemSearch';
import { checkPermisson } from './CheckPermisson';
var _ = require('lodash');
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasGeoFence: false,
      region: {},
      listRegion: [],
      listSearch: [],
      loading: false,
      buttonText: 'Stop Service',
      visibleSearch: true,
    };
    this.notification = new NotificationService(this.onNotification);
    this.onChangeTextDelayed = _.debounce(this.onChangeText, 200);
  }

  async componentDidMount() {
    var listDefine = await AsyncStorage.getItem('define_region');
    if (listDefine) {
      this.setState({
        listRegion: listDefine ? JSON.parse(listDefine) : [],
      });
    }

    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      saveBatteryOnBackground: true,
      stationaryRadius: 20,
      distanceFilter: 20,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: false,
      notificationsEnabled: false,
      startOnBoot: true,
      stopOnTerminate: false,
      startForeground: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 10000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
      url: null,
    });
    var region = null

    try {
      region = await checkPermisson.getLocation()
    } catch (error) {
      region = error
    }
    this.setState({
      region: region,
      loading: false,
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
      // Actions.sendLocation(stationaryLocation);
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
      console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
      console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
      console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

      // you don't need to check status before start (this is just the example)
      BackgroundGeolocation.start(); //triggers start on start event
    });
  }

  updateLocation = async location => {
    var listLocation = [...this.state.listRegion]
    var log = await AsyncStorage.getItem('history')
    var listLog = log ? JSON.parse(log) : []
    if (listLocation.length > 0) {
      listLocation.forEach((item, i) => {
        let check = isPointWithinRadius(
          {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          { latitude: item.latitude, longitude: item.longitude },
          item.radius
        )
        if (check) {
          if (item.flag == true) {
            item.flag = false
            this.notification.localNotification(
              'Notice',
              `You are nearby ${item.value}`,
            );

            fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
              item.latitude
              },${
              item.longitude
              }&key=AIzaSyACQH75po6ZJc1-u2BzbneQ76tZnD2BMps`,
            )
              .then(response => response.json())
              .then(responseJson => {
                var date = new Date().getDate(); //Current Date
                var month = new Date().getMonth() + 1; //Current Month
                var year = new Date().getFullYear(); //Current Year
                var hours = new Date().getHours(); //Current Hours
                var min = new Date().getMinutes();
                var time = date + '/' + month + '/' + year + ' ' + hours + ':' + min
                var detail = {
                  latitude: item.latitude,
                  longitude: item.longitude,
                  key: responseJson.results[0].place_id,
                  value: responseJson.results[0].formatted_address,
                  radius: 100,
                  latitudeDelta: 0.001,
                  longitudeDelta: 0.001,
                  time: time
                };
                var newLog = [...listLog, detail]
                AsyncStorage.setItem('history', JSON.stringify(newLog))
              });
          }
          // else console.log('falseeeeee')
        }
        else {
          item.flag = true
        }

      });
      AsyncStorage.setItem(
        'define_region',
        JSON.stringify(listLocation)
      )
    }
  };

  render() {
    const {
      region,
      loading,
      buttonText,
      listRegion,
      visibleSearch,
      listSearch,
    } = this.state;

    var mapStyle = [
      {
        featureType: 'all',
        elementType: 'all',
        stylers: [
          {
            visibility: 'on',
          },
        ],
      },
    ];

    return (
      <View style={{ flexDirection: 'column', flex: 1 }}>
        <SafeAreaView />
        <StatusBar barStyle="dark-content" />
        {region.latitude && (
          <MapView
            style={{ width: width, height: height * 0.7 }}
            initialRegion={region}
            provider={PROVIDER_GOOGLE}
            customMapStyle={mapStyle}
            zoomControlEnabled={true}
            zoomEnabled={true}
            zoomTapEnabled={true}
            onRegionChangeComplete={this.onRegionChange}
            moveOnMarkerPress={false}
            onMapReady={this.onMapReady}
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
                  <Callout
                    tooltip={true}
                    style={styles.makerInfo}
                    onPress={this.removeMarker(item)}>
                    <Text
                      style={{ fontSize: 14, color: 'white', marginBottom: 10 }}>
                      {item.value}
                    </Text>
                    <View style={styles.makerInfoButton}>
                      <Text style={{ fontSize: 14, color: '#D85A4B' }}>
                        Remove
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
          </MapView>
        )}
        {/* {visibleSearch ? (
          <View
            style={{
              width: width,
              position: 'absolute',
              top: 20,
              alignItems: 'center',
              flexDirection: 'column',
            }}>
            <View
              style={{
                width: width * 0.8,
                backgroundColor: 'white',
                borderRadius: 20,
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
              }}>
              <TextInput
                style={{
                  paddingVertical: Platform.OS == 'android' ? 5 : 10,
                  paddingHorizontal: 15,
                }}
                onChangeText={this.onChangeTextDelayed}
                placeholder="Search"
              />
            </View>
            {listSearch.length > 0 && (
              <FlatList
                style={{
                  width: width * 0.8,
                  maxHeight: 300,
                  flex: 1,
                  backgroundColor: 'white',
                  marginTop: 5,
                  borderRadius: 4,
                  elevation: 1,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.22,
                  shadowRadius: 2.22,
                }}
                data={listSearch}
                renderItem={this.renderItem}
              />
            )}
          </View>
        ) : null} */}
        <View style={styles.viewBottom}>
          <View style={styles.contentBottom}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                flex: 1,
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
            </View>

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
            <View style={{ marginBottom: 15 }}>
              <Button
                title="Pick this location"
                color="#50a14f"
                disabled={loading ? true : false}
                onPress={this.chooseRegion}
              />
            </View>
            <Button
              title="History"
              color="#3976ff"
              onPress={this.history}
            />
            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#3976ff',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 10,
                }}
                disabled={loading ? true : false}
                onPress={this.clearAsyncStorage}>
                <Text style={{ color: 'white' }}>Clear all geofences</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#FD3376',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 10,
                }}
                onPress={() => this.stopService()}>
                <Text style={{ color: 'white' }}>{buttonText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }
  history = () => {
    this.props.navigation.navigate('History')
  }
  // renderItem = value => {
  //   return (
  //     <ItemSearch item={value.item} onPress={this.choosePlace(value.item)} />
  //   );
  // };

  clearAsyncStorage = async () => {
    await AsyncStorage.removeItem("define_region");
    this.setState({
      listRegion: [],
    });
  };

  // chọn location trong danh sách tìm kiếm
  // choosePlace = item => () => {
  //   fetch(
  //     `https://maps.googleapis.com/maps/api/place/details/json?placeid=${
  //     item.place_id
  //     }&key=AIzaSyBuUbr2XwDM9nExYvtgRWNgweSFx9RiEic`,
  //   )
  //     .then(response => response.json())
  //     .then(responseJson => {
  //       var location = {
  //         latitude: responseJson.result.geometry.location.lat,
  //         longitude: responseJson.result.geometry.location.lng,
  //         latitudeDelta: 0.001,
  //         longitudeDelta: 0.001,
  //       };
  //       this.setState({
  //         region: location,
  //         listSearch: [],
  //       });
  //     });
  // };

  // nhập location tìm kiếm
  onChangeText = value => {
    fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${value}&key=AIzaSyBuUbr2XwDM9nExYvtgRWNgweSFx9RiEic`,
    )
      .then(response => response.json())
      .then(responseJson => {
        console.log('responseJson');
        console.log(responseJson);
        this.setState({
          listSearch: responseJson.predictions,
        });
      });
  };

  
  removeMarker = item => () => {
    var newList = this.state.listRegion.filter(obj => obj.key !== item.key);
    this.setState(
      {
        listRegion: newList,
      },
      () =>
        AsyncStorage.setItem(
          'define_region',
          JSON.stringify(this.state.listRegion),
        ),
    );
  };

  // ngắt background service
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

  // lưu vị trí vào localStorage
  chooseRegion = () => {
    var detail = {
      latitude: this.state.region.latitude,
      longitude: this.state.region.longitude,
      key: this.state.region.key,
      flag: true,
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

  // lấy vị trí theo tâm bản đồ
  onRegionChange = region => {
    this.setState(
      {
        region: region,
        loading: true,
      },
      () => this.fetchAddress(),
    );
  };

  // lấy thông tin vị trí theo lat long
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
  componentWillUnmount() {
    BackgroundGeolocation.removeAllListeners();
  }

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
  makerInfo: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderColor: 'red',
    borderWidth: 1,
    backgroundColor: '#556080',
    // height: 100,
    borderRadius: 50,
    width: width * 0.9,
  },
  makerInfoButton: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
    // position: 'absolute',
  },
  viewBottom: {
    width: width,
    position: 'absolute',
    flexDirection: 'column',
    bottom: 0,
    alignItems: 'flex-end',
  },
  contentBottom: {
    width: width,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
