import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function FloatingButtons({ onLayersPress, onLocationPress, isLayersSatellite }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onLayersPress}>
        <Ionicons 
          name={isLayersSatellite ? "map" : "map-outline"} 
          size={24} 
          color={isLayersSatellite ? "#007AFF" : "#666"} 
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onLocationPress}>
        <Ionicons name="locate" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    zIndex: 1,
  },
  button: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 