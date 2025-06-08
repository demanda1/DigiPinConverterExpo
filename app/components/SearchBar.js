import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchBar({ onSearch }) {
  const [isDirectionsMode, setIsDirectionsMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (isDirectionsMode) {
      if (!fromLocation.trim() || !toLocation.trim()) return;
      
      setIsLoading(true);
      try {
        await onSearch({
          isDirectionsMode: true,
          from: fromLocation.trim(),
          to: toLocation.trim()
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!searchText.trim()) return;
      
      setIsLoading(true);
      try {
        await onSearch({
          isDirectionsMode: false,
          searchText: searchText.trim()
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearAll = () => {
    setSearchText('');
    setFromLocation('');
    setToLocation('');
  };

  const toggleMode = () => {
    setIsDirectionsMode(!isDirectionsMode);
    clearAll();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {isDirectionsMode ? (
          // Directions Mode UI
          <>
            <View style={styles.searchBar}>
              <TouchableOpacity 
                style={styles.modeToggleButton} 
                onPress={toggleMode}
              >
                <Ionicons name="search" size={20} color="#007AFF" />
              </TouchableOpacity>
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={20} color="#007AFF" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="From: Enter address or DIGIPIN"
                placeholderTextColor="#666"
                value={fromLocation}
                onChangeText={setFromLocation}
                returnKeyType="next"
              />
              {fromLocation ? (
                <TouchableOpacity style={styles.clearButton} onPress={() => setFromLocation('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={[styles.searchBar, { marginTop: 8 }]}>
              <View style={styles.modeTogglePlaceholder} />
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={20} color="#FF3B30" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="To: Enter address or DIGIPIN"
                placeholderTextColor="#666"
                value={toLocation}
                onChangeText={setToLocation}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {toLocation ? (
                <TouchableOpacity style={styles.clearButton} onPress={() => setToLocation('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        ) : (
          // Single Search Mode UI
          <View style={styles.searchBar}>
            <TouchableOpacity 
              style={styles.modeToggleButton} 
              onPress={toggleMode}
            >
              <Ionicons name="shuffle" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Search address or DIGIPIN"
              placeholderTextColor="#666"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {isLoading ? (
              <ActivityIndicator style={styles.loadingIndicator} color="#666" />
            ) : searchText ? (
              <TouchableOpacity style={styles.clearButton} onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Only show search button in directions mode */}
        {isDirectionsMode && (fromLocation || toLocation) && (
          <TouchableOpacity 
            style={styles.findRouteButton} 
            onPress={handleSearch}
            disabled={isLoading || !fromLocation.trim() || !toLocation.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.findRouteText}>Find route</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
  },
  modeToggleButton: {
    padding: 4,
    marginRight: 4,
  },
  modeTogglePlaceholder: {
    width: 28,
    marginRight: 4,
  },
  locationIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  findRouteButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    alignSelf: 'stretch',
  },
  findRouteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 