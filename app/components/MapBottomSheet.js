import BottomSheet from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MapBottomSheet() {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['12%', '50%', '90%'], []);

  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={false}
    >
      <View style={styles.contentContainer}>
        <View style={styles.handle} />
        <Text style={styles.title}>Explore nearby</Text>
        {/* Add more content here */}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#00000040',
    borderRadius: 2,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
  },
}); 