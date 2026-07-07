import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function VersesSkeleton() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderSkeletonVerse = (lines: number, key: number) => (
    <View key={key} style={styles.verseRow}>
      <Animated.View style={[styles.skeletonNumber, { backgroundColor: colors.border }, animatedStyle]} />
      <View style={styles.textContainer}>
        {Array.from({ length: lines }).map((_, i) => (
          <Animated.View 
            key={i} 
            style={[
              styles.skeletonLine, 
              { 
                backgroundColor: colors.border,
                width: i === lines - 1 ? '60%' : '100%' 
              }, 
              animatedStyle
            ]} 
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: 60 + insets.bottom }]}>
      {renderSkeletonVerse(3, 1)}
      {renderSkeletonVerse(2, 2)}
      {renderSkeletonVerse(4, 3)}
      {renderSkeletonVerse(2, 4)}
      {renderSkeletonVerse(3, 5)}
      {renderSkeletonVerse(2, 6)}
      {renderSkeletonVerse(4, 7)}
      {renderSkeletonVerse(2, 8)}
      {renderSkeletonVerse(3, 9)}
      {renderSkeletonVerse(2, 10)}
      {renderSkeletonVerse(4, 11)}
      {renderSkeletonVerse(2, 12)}
      {renderSkeletonVerse(3, 13)}
      {renderSkeletonVerse(2, 14)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    width: '100%',
  },
  verseRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  skeletonNumber: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    gap: 10,
    marginTop: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  }
});
