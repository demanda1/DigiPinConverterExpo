import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Get_DIGIPIN, Get_LatLng_By_Digipin } from '../src/utils/DigiPinConverter';
import FloatingButtons from './components/FloatingButtons';
import LoadingOverlay from './components/LoadingOverlay';
import LocationTooltip from './components/LocationTooltip';
import NavigateButton from './components/NavigateButton';
import OpenStreetMap from './components/OpenStreetMap';
import SearchBar from './components/SearchBar';

export default function Layout() {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [digipin, setDigipin] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [locationName, setLocationName] = useState(null);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const timeoutRef = useRef(null);
  const geocodeTimeoutRef = useRef(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const initialLocationSet = useRef(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);

  // Default to center of India
  const [region, setRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 20,
    longitudeDelta: 20,
  });

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = currentLocation.coords;

        try {
          const currentDigipin = Get_DIGIPIN(latitude, longitude);
          setDigipin(currentDigipin);
          setLocation(currentLocation);
          getLocationName(latitude, longitude);

          const newRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };
          
          setRegion(newRegion);

          if (mapRef.current && !initialLocationSet.current) {
            initialLocationSet.current = true;
            mapRef.current.animateToRegion(newRegion, 1000);
          }
        } catch (error) {
          Alert.alert('Notice', 'Your current location is outside the supported region.');
        }
      } catch (error) {
        Alert.alert('Error', 'Could not get your current location.');
      }
    })();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    };
  }, []);

  const getLocationName = useCallback(async (latitude, longitude) => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      if (results && results.length > 0) {
        const result = results[0];
        
        // Priority order for naming:
        // 1. POI name (if available)
        // 2. Street address
        // 3. Neighborhood/Sublocality
        // 4. City
        // 5. District
        
        if (result.name && !result.name.match(/^\d/)) {  // Use name if it's not just a number
          setLocationName(result.name);
          return;
        }
        
        if (result.street) {
          const streetName = result.streetNumber 
            ? `${result.streetNumber} ${result.street}`
            : result.street;
          setLocationName(streetName);
          return;
        }
        
        if (result.sublocality) {
          setLocationName(result.sublocality);
          return;
        }
        
        if (result.city) {
          setLocationName(result.city);
          return;
        }
        
        if (result.district) {
          setLocationName(result.district);
          return;
        }
        
        setLocationName('Unknown location');
      } else {
        setLocationName('Unknown location');
      }
    } catch (error) {
      setLocationName('Unknown location');
    }
  }, []);

  const updateDigipinForLocation = useCallback((latitude, longitude) => {
    try {
      const newDigipin = Get_DIGIPIN(latitude, longitude);
      setDigipin(newDigipin);
      return true;
    } catch (error) {
      setDigipin(null);
      setLocationName(null);
      return false;
    }
  }, []);

  const handleRegionChange = useCallback(() => {
    setIsMapMoving(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleRegionChangeComplete = useCallback(async (region) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a timeout to update the DIGIPIN after movement has stopped
    timeoutRef.current = setTimeout(() => {
      try {
        const newDigipin = Get_DIGIPIN(region.latitude, region.longitude);
        setDigipin(newDigipin);
        getLocationName(region.latitude, region.longitude);
      } catch (error) {
        setDigipin(null);
        setLocationName(null);
      }
      setIsMapMoving(false);
    }, 100);
  }, [getLocationName]);

  const handleLocationPress = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setLocation(location);
      
      const { latitude, longitude } = location.coords;
      
      if (!updateDigipinForLocation(latitude, longitude)) {
        Alert.alert('Error', 'Location is outside the supported region. Please try a location within India.');
        return;
      }

      getLocationName(latitude, longitude);

      // Update region with current location
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      
      setRegion(newRegion);
      
      // Send message to WebView to update map center
      if (mapRef.current) {
        mapRef.current.injectJavaScript(`
          map.setView([${latitude}, ${longitude}], 15, { animate: true });
        `);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please try again.');
    }
  };

  const handleLayersPress = () => {
    setMapType(prevType => prevType === 'standard' ? 'satellite' : 'standard');
  };

  const fetchRoute = async (startLat, startLng, endLat, endLng) => {
    try {
      // Using OSRM demo server - for production, you should set up your own OSRM server
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        setRouteCoordinates(coordinates);
      } else {
        Alert.alert('Error', 'Could not find a route to this location.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch route. Please try again.');
    }
  };

  const handleNavigatePress = async () => {
    if (isNavigating) {
      // If already navigating, clear the route
      setRouteCoordinates(null);
      setIsNavigating(false);
      
      // Return to the searched location view
      if (searchedLocation) {
        mapRef.current?.animateToRegion({
          latitude: searchedLocation.latitude,
          longitude: searchedLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
      return;
    }

    if (!location || !searchedLocation) {
      Alert.alert('Error', 'Both current and destination locations are required for navigation.');
      return;
    }

    // Set loading state immediately when navigation starts
    setIsLoadingRoute(true);

    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      await fetchRoute(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        searchedLocation.latitude,
        searchedLocation.longitude
      );

      // Fit map to show the entire route
      mapRef.current?.fitToCoordinates(
        [
          { 
            latitude: currentLocation.coords.latitude, 
            longitude: currentLocation.coords.longitude 
          },
          { 
            latitude: searchedLocation.latitude, 
            longitude: searchedLocation.longitude 
          }
        ],
        {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        }
      );
      
      setIsNavigating(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      // Clear loading state after everything is done
      setIsLoadingRoute(false);
    }
  };

  const handleSearch = async (searchData) => {
    try {
      // Clear previous route and navigation state
      setRouteCoordinates(null);
      setIsNavigating(false);

      if (searchData.isDirectionsMode) {
        let fromCoords, toCoords;

        // Process "From" location
        const cleanFromDigipin = searchData.from.trim().replace(/\s+/g, '');
        if (cleanFromDigipin.includes('-')) {
          try {
            fromCoords = Get_LatLng_By_Digipin(cleanFromDigipin);
          } catch (error) {
            const geocodeResult = await Location.geocodeAsync(searchData.from);
            if (!geocodeResult || geocodeResult.length === 0) {
              Alert.alert('Error', 'Invalid "From" DIGIPIN or location not found. Please try again.');
              return;
            }
            fromCoords = {
              latitude: geocodeResult[0].latitude,
              longitude: geocodeResult[0].longitude
            };
          }
        } else {
          const geocodeResult = await Location.geocodeAsync(searchData.from);
          if (!geocodeResult || geocodeResult.length === 0) {
            Alert.alert('Error', '"From" location not found. Please try a different search.');
            return;
          }
          fromCoords = {
            latitude: geocodeResult[0].latitude,
            longitude: geocodeResult[0].longitude
          };
        }

        // Process "To" location
        const cleanToDigipin = searchData.to.trim().replace(/\s+/g, '');
        if (cleanToDigipin.includes('-')) {
          try {
            toCoords = Get_LatLng_By_Digipin(cleanToDigipin);
          } catch (error) {
            const geocodeResult = await Location.geocodeAsync(searchData.to);
            if (!geocodeResult || geocodeResult.length === 0) {
              Alert.alert('Error', 'Invalid "To" DIGIPIN or location not found. Please try again.');
              return;
            }
            toCoords = {
              latitude: geocodeResult[0].latitude,
              longitude: geocodeResult[0].longitude
            };
          }
        } else {
          const geocodeResult = await Location.geocodeAsync(searchData.to);
          if (!geocodeResult || geocodeResult.length === 0) {
            Alert.alert('Error', '"To" location not found. Please try a different search.');
            return;
          }
          toCoords = {
            latitude: geocodeResult[0].latitude,
            longitude: geocodeResult[0].longitude
          };
        }

        // Verify both coordinates are within bounds
        try {
          Get_DIGIPIN(fromCoords.latitude, fromCoords.longitude);
          Get_DIGIPIN(toCoords.latitude, toCoords.longitude);
        } catch (error) {
          Alert.alert('Error', 'One or both locations are outside the supported region. Please try locations within India.');
          return;
        }

        // Store the locations
        setFromLocation(fromCoords);
        setToLocation(toCoords);
        setSearchedLocation(toCoords);

        // Start route finding
        setIsLoadingRoute(true);
        try {
          await fetchRoute(
            fromCoords.latitude,
            fromCoords.longitude,
            toCoords.latitude,
            toCoords.longitude
          );

          // Fit map to show both locations
          mapRef.current?.fitToCoordinates(
            [fromCoords, toCoords],
            {
              edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
              animated: true,
            }
          );
        } finally {
          setIsLoadingRoute(false);
        }
      } else {
        // Single location search mode
        let latitude, longitude;
        
        // Try to parse as DIGIPIN by removing any spaces
        const cleanDigipin = searchData.searchText.trim().replace(/\s+/g, '');
        
        // Check if it might be a DIGIPIN (contains at least one hyphen)
        if (cleanDigipin.includes('-')) {
          try {
            const coords = Get_LatLng_By_Digipin(cleanDigipin);
            latitude = coords.latitude;
            longitude = coords.longitude;
          } catch (error) {
            // If DIGIPIN parsing fails, try geocoding as a fallback
            const geocodeResult = await Location.geocodeAsync(searchData.searchText);
            if (!geocodeResult || geocodeResult.length === 0) {
              Alert.alert('Error', 'Invalid DIGIPIN or location not found. Please try again.');
              return;
            }
            latitude = geocodeResult[0].latitude;
            longitude = geocodeResult[0].longitude;
          }
        } else {
          // If input doesn't look like a DIGIPIN, try geocoding directly
          const geocodeResult = await Location.geocodeAsync(searchData.searchText);
          if (!geocodeResult || geocodeResult.length === 0) {
            Alert.alert('Error', 'Location not found. Please try a different search.');
            return;
          }
          latitude = geocodeResult[0].latitude;
          longitude = geocodeResult[0].longitude;
        }

        // Store the searched location
        const searchedLocationData = { latitude, longitude };
        setSearchedLocation(searchedLocationData);
        setFromLocation(null);
        setToLocation(searchedLocationData); // Set as destination marker

        // Verify the coordinates are within bounds and update DIGIPIN
        if (!updateDigipinForLocation(latitude, longitude)) {
          Alert.alert('Error', 'Location is outside the supported region. Please try a location within India.');
          return;
        }

        // Update location name
        getLocationName(latitude, longitude);

        // Update map view
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        
        setRegion(newRegion);

        // Center map on the searched location
        if (mapRef.current) {
          mapRef.current.injectJavaScript(`
            map.setView([${latitude}, ${longitude}], 15, { animate: true });
          `);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process location. Please try again.');
    }
  };

  const markers = [
    ...(fromLocation ? [{
      coordinate: {
        latitude: Number(fromLocation.latitude),
        longitude: Number(fromLocation.longitude)
      },
      title: "Start Location",
      color: "blue"
    }] : []),
    ...(toLocation ? [{
      coordinate: {
        latitude: Number(toLocation.latitude),
        longitude: Number(toLocation.longitude)
      },
      title: "Destination",
      color: "red"
    }] : [])
  ];

  const polylineData = routeCoordinates ? {
    coordinates: routeCoordinates.map(coord => ({
      latitude: Number(coord.latitude),
      longitude: Number(coord.longitude)
    })),
    color: "#007AFF",
    width: 4
  } : null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <OpenStreetMap
          ref={mapRef}
          region={region}
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={true}
          markers={markers}
          polyline={polylineData}
          mapType={mapType}
        />
        <LocationTooltip 
          digipin={isMapMoving ? '...' : digipin} 
          locationName={isMapMoving ? null : locationName}
        />
        <SearchBar onSearch={handleSearch} />
        {searchedLocation && (
          <NavigateButton 
            onPress={handleNavigatePress}
            isNavigating={isNavigating}
          />
        )}
        <FloatingButtons
          onLayersPress={handleLayersPress}
          onLocationPress={handleLocationPress}
          isLayersSatellite={mapType === 'satellite'}
        />
        {isLoadingRoute && (
          <LoadingOverlay message="Finding the best route..." />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
}); 