import React from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { COLORS } from '../constants/theme';

interface AdBannerProps {
  position?: 'top' | 'bottom';
}

export function AdBanner({ position = 'bottom' }: AdBannerProps) {
  const { width } = useWindowDimensions();
  
  // Responsive ad width - max 320px, min padding on small screens
  const adWidth = Math.min(width - 32, 320);
  const adHeight = 50;

  return (
    <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
      <View style={[styles.adPlaceholder, { width: adWidth, height: adHeight }]}>
        <Text style={styles.adText}>Advertisement</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  top: {
    marginBottom: 8,
  },
  bottom: {
    marginTop: 8,
  },
  adPlaceholder: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  adText: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '500',
  },
});
