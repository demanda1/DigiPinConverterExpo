import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LocationTooltip({ digipin, locationName }) {
  const [showCopied, setShowCopied] = useState(false);
  
  if (!digipin) return null;
  
  const handleCopy = async () => {
    await Clipboard.setStringAsync(digipin);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000); // Hide after 2 seconds
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.markerContainer}>
        <Ionicons name="location" size={32} color="#FF3B30" />
      </View>
      <View style={styles.tooltipWrapper}>
        <TouchableOpacity 
          style={styles.tooltip}
          onPress={handleCopy}
          activeOpacity={0.8}
        >
          <Text style={styles.digipinText}>DIGIPIN: {digipin}</Text>
          {locationName && (
            <Text style={styles.locationText} numberOfLines={1}>
              {locationName}
            </Text>
          )}
          {showCopied && (
            <View style={styles.copiedBadge}>
              <Text style={styles.copiedText}>DIGIPIN copied!</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  tooltipWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -45 }],
    zIndex: 2,
    paddingHorizontal: 20,
    pointerEvents: 'box-none',
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  digipinText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    color: '#CCC',
    fontSize: 12,
    marginTop: 4,
    maxWidth: 200,
  },
  markerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -32,
    zIndex: 1,
    pointerEvents: 'none',
  },
  copiedBadge: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  copiedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
}); 