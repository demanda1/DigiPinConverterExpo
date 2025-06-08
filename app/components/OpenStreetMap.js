import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const OpenStreetMap = ({ 
  region, 
  onRegionChange, 
  onRegionChangeComplete,
  showsUserLocation,
  markers = [],
  polyline = null,
  mapType = 'standard'
}) => {
  const webViewRef = useRef(null);

  const getMapHtml = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body { 
            margin: 0; 
            padding: 0; 
            width: 100%; 
            height: 100%; 
            overflow: hidden;
          }
          #map { 
            position: absolute;
            top: 0;
            left: 0;
            width: 100%; 
            height: 100%; 
            z-index: 1;
          }
          .leaflet-control-attribution {
            display: none;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${region.latitude}, ${region.longitude}], 15);
          
          // Standard map layer
          const standardLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          });

          // Satellite map layer (using ESRI World Imagery)
          const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: '© ESRI'
          });

          // Set initial layer based on mapType
          if ('${mapType}' === 'standard') {
            standardLayer.addTo(map);
          } else {
            satelliteLayer.addTo(map);
          }

          // Handle map move events
          map.on('move', () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'regionChange',
              region: {
                latitude: center.lat,
                longitude: center.lng,
                latitudeDelta: 0.0922 / Math.pow(2, zoom),
                longitudeDelta: 0.0421 / Math.pow(2, zoom)
              }
            }));
          });

          // Add markers
          const markers = ${JSON.stringify(markers)};
          markers.forEach(marker => {
            const icon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="width: 24px; height: 24px; border-radius: 12px; background-color: ' + 
                    (marker.color === 'blue' ? '#007AFF' : '#FF3B30') + 
                    '; border: 2px solid white;"></div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            L.marker([marker.coordinate.latitude, marker.coordinate.longitude], { icon })
              .bindPopup(marker.title)
              .addTo(map);
          });

          // Add polyline if exists
          ${polyline ? `
            const polylineCoords = ${JSON.stringify(polyline.coordinates)}.map(coord => [coord.latitude, coord.longitude]);
            L.polyline(polylineCoords, { 
              color: '${polyline.color}', 
              weight: ${polyline.width}
            }).addTo(map);
          ` : ''}

          // Handle user location
          if (${showsUserLocation}) {
            map.locate({watch: true, enableHighAccuracy: true});
            let userLocationMarker;
            let initialLocationSet = false;
            
            map.on('locationfound', (e) => {
              if (!userLocationMarker) {
                userLocationMarker = L.circleMarker(e.latlng, {
                  radius: 8,
                  fillColor: '#007AFF',
                  color: '#fff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8
                }).addTo(map);
              } else {
                userLocationMarker.setLatLng(e.latlng);
              }
              
              // Center map on user location only on first location found
              if (!initialLocationSet) {
                map.setView(e.latlng, 15);
                initialLocationSet = true;
              }
            });
          }
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'regionChange') {
      onRegionChange && onRegionChange(data.region);
      onRegionChangeComplete && onRegionChangeComplete(data.region);
    }
  };

  useEffect(() => {
    if (webViewRef.current) {
      // Update map when region changes
      webViewRef.current.injectJavaScript(`
        map.setView([${region.latitude}, ${region.longitude}], 
          Math.log2(0.0922 / ${region.latitudeDelta}) + 1);
      `);
    }
  }, [region]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: getMapHtml() }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default OpenStreetMap; 