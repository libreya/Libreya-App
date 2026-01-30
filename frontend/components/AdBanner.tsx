import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

// AdMob is not available in web, so we show a placeholder
// For native builds, you would use react-native-google-mobile-ads

interface AdBannerProps {
  position?: 'top' | 'bottom';
}

export function AdBanner({ position = 'bottom' }: AdBannerProps) {
  // On web, show the Google AdSense script placeholder
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
        <View style={styles.adPlaceholder}>
          <Text style={styles.adText}>Advertisement</Text>
        </View>
      </View>
    );
  }

  // For native, this would use react-native-google-mobile-ads
  // Currently showing placeholder as AdMob requires native configuration
  return (
    <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
      <View style={styles.adPlaceholder}>
        <Text style={styles.adText}>Ad Space</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
  },
  top: {
    // top positioning handled by parent
  },
  bottom: {
    // bottom positioning handled by parent
  },
  adPlaceholder: {
    width: 320,
    height: 50,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adText: {
    color: COLORS.gray,
    fontSize: 12,
  },
});
