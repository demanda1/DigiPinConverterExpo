import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function NavigateButton({ onPress, style, isNavigating }) {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={[
          styles.button,
          isNavigating && styles.activeButton
        ]} 
        onPress={onPress}
      >
        <Ionicons 
          name={isNavigating ? "close-circle" : "navigate"} 
          size={24} 
          color={isNavigating ? "#FF3B30" : "#007AFF"} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 340,
    zIndex: 1,
  },
  button: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: '#FFF0F0',
  },
}); 