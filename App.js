import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

import BgTracking from './bgTracking';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu',
});

export default class App extends Component {

  async componentDidMount() {

    // await AsyncStorage.removeItem('locations');

    // let locationsFetched = await AsyncStorage.getItem('locations');
    // const tripStarted = await AsyncStorage.getItem('tripStarted');

    // console.log("ASYNC ", locationsFetched);
    // if (locationsFetched !== null && locationsFetched.length > 0) {
    //   console.log("LOCATIONS:::: ", JSON.parse(AsyncStorage.getItem('locations')));
    // }

    // if (tripStarted) {

    // }

    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: true,
      startOnBoot: false,
      startForeground: false,
      stopOnTerminate: false,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
    //   url: 'http://192.168.81.15:3000/location',
    //   httpHeaders: {
    //     'X-FOO': 'bar'
    //   },
      // customize post properties
      postTemplate: {
        lat: '@latitude',
        lon: '@longitude',
        foo: 'bar' // you can also add your own properties
      }
    });

    BackgroundGeolocation.on('location', async (location) => {
      // handle your locations here
      console.log("location:: ", location);
      // let locationsArray = await AsyncStorage.getItem('locations');
      // if (locationsArray !== null) {
      //   let newLocationsArray = JSON.parse(locationsArray);
      //   newLocationsArray.push(location);
      //   await AsyncStorage.setItem('locations', JSON.stringify(newLocationsArray));
      // } else if (locationsArray === null){
      //   await AsyncStorage.setItem('locations', JSON.stringify([location]));
      // }
      // to perform long running operation on iOS
      // you need to create background task
      BackgroundGeolocation.startTask(taskKey => {
        // execute long running task
        console.log("starttask");
        // eg. ajax post location
        // IMPORTANT: task has to be ended by endTask
        BackgroundGeolocation.endTask(taskKey);
      });
    });

    BackgroundGeolocation.on('stationary', (stationaryLocation) => {
      // handle stationary locations here
      console.log("stationary location:: ", stationaryLocation);
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
  }

  componentWillUnmount() {
    // unregister all event listeners
    // BackgroundGeolocation.removeAllListeners();
  }

  onStartTracking = () => {
    BackgroundGeolocation.checkStatus(status => {
        console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
        console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
        console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
  
        // you don't need to check status before start (this is just the example)
        if (!status.isRunning) {
          BackgroundGeolocation.start(); //triggers start on start event
          AsyncStorage.setItem('tripStarted', true);
        }
      });
  
      // you can also just start without checking for status
      // BackgroundGeolocation.start();
  }

  onStopTracking = () => {
    // BackgroundGeolocation.checkStatus(status => {
    //     console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
    //     console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
    //     console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
  
    //     // you don't need to check status before start (this is just the example)
    //     if (status.isRunning) {
          BackgroundGeolocation.stop(); //triggers stop on stop event
          AsyncStorage.setItem('tripStarted', false);
      //   }
      // });
  
      // you can also just start without checking for status
      // BackgroundGeolocation.start();
  }


  
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
        <MapView
            provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={styles.map}
            // region={{
            //   latitude: 37.78825,
            //   longitude: -122.4324,
            //   latitudeDelta: 0.015,
            //   longitudeDelta: 0.0121,
            // }}
        >
        </MapView>
        <Button onPress={this.onStartTracking} title="Start tracking"/>
        <Button onPress={this.onStopTracking} title="End tracking" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
});
