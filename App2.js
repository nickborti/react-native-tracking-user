import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Button, Alert, Linking } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
// import { Constants, Location, Permissions } from 'expo';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as IntentLauncher from 'expo-intent-launcher';

const openGeneralLocationSettings = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('App-Prefs:root=Privacy&path=LOCATION')
      return
    }
  
    await IntentLauncher.startActivityAsync(IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS)
  }
  
  const openAppLocationSettings = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:')
      return
    }
  
    await IntentLauncher.startActivityAsync(IntentLauncher.ACTION_APPLICATION_SETTINGS)
  }
  
  
  export default class App2 extends React.Component {
    state = {
      location: null,
      providerStatus: null,
      permission: null
    }
  
    getLocation = async () => {
      this.setState({ location: 'fetching...' })
      const permission = await Permissions.askAsync(Permissions.LOCATION)
      const providerStatus = await Location.getProviderStatusAsync()
      this.setState({ permission, providerStatus })
  
      try {
        const timeout = new Promise((resolve, reject) => {
          return setTimeout(() => reject(new Error('Location timeout')), 20 * 1000)
        })
  
        console.log('location.accuracy', Location.Accuracy)
  
        const locationPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
  
        const location = await Promise.race([locationPromise, timeout])
  
        this.setState({ location })
      } catch (err) {
        this.setState({ location: err.message })
      }
    }
  
    render() {
      const { location, permission, providerStatus } = this.state
      return (
        <View style={styles.container}>
          <View style={styles.locationInformation}>
            <View>
              <Text>{`Location: ${JSON.stringify(location)}`}</Text>
            </View>
            <View>
              <Text>{`Permission: ${JSON.stringify(permission)}`}</Text>
            </View>
            <View>
              <Text>{`Provider Status: ${JSON.stringify(providerStatus)}`}</Text>
            </View>
          </View>
          
          <View style={styles.controls}>
            <Button title="Get Location" onPress={this.getLocation} />
            <Button title="Open general location settings" onPress={openGeneralLocationSettings} />
            <Button title="Open app location settings" onPress={openAppLocationSettings} />
          </View>
        </View>
      );
    }
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingTop: Constants.statusBarHeight,
      backgroundColor: '#ecf0f1',
      padding: 8,
    },
    locationInformation: {
      justifyContent: 'space-around',
      flex: 0.7
    },
    controls: {
      justifyContent: 'space-around',
      flex: 0.3
    }
  });