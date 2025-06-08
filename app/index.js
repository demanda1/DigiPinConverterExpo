import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { Get_DIGIPIN, Get_LatLng_By_Digipin } from '../src/utils/DigiPinConverter';

export default function Index() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [digipin, setDigipin] = useState('');
  const [result, setResult] = useState('');
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude, accuracy } = location.coords;
      setSelectedLocation({ latitude, longitude });
      setAccuracy(accuracy);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleMapPress = (e) => {
    setSelectedLocation(e.nativeEvent.coordinate);
    setAccuracy(null);
  };

  const getDigipin = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location first');
      return;
    }

    try {
      const result = Get_DIGIPIN(
        selectedLocation.latitude,
        selectedLocation.longitude,
      );
      setResult(`DIGIPIN: ${result}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const getCoordinates = () => {
    if (!digipin.trim()) {
      Alert.alert('Error', 'Please enter a DIGIPIN');
      return;
    }

    try {
      const coords = Get_LatLng_By_Digipin(digipin);
      setSelectedLocation(coords);
      setResult(
        `Latitude: ${coords.latitude.toFixed(6)}\nLongitude: ${coords.longitude.toFixed(
          6,
        )}`,
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text style={styles.title}>DIGIPIN Converter</Text>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 20.5937,
              longitude: 78.9629,
              latitudeDelta: 30,
              longitudeDelta: 30,
            }}
            onPress={handleMapPress}>
            {selectedLocation && (
              <>
                <Marker coordinate={selectedLocation} />
                {accuracy && (
                  <Circle
                    center={selectedLocation}
                    radius={accuracy}
                    fillColor="rgba(33, 150, 243, 0.2)"
                    strokeColor="rgba(33, 150, 243, 0.5)"
                  />
                )}
              </>
            )}
          </MapView>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}>
            <MaterialIcons name="my-location" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={getDigipin}>
          <Text style={styles.buttonText}>Get DIGIPIN</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TextInput
          style={styles.input}
          placeholder="Enter DIGIPIN"
          value={digipin}
          onChangeText={setDigipin}
          autoCapitalize="characters"
        />

        <TouchableOpacity style={styles.button} onPress={getCoordinates}>
          <Text style={styles.buttonText}>Get Coordinates</Text>
        </TouchableOpacity>

        {result ? <Text style={styles.result}>{result}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 40,
  },
  mapContainer: {
    height: 400,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2196F3',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
}); 