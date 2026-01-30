import React from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Text } from 'react-native';
import { COLORS } from '../constants/theme';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://customer-assets.emergentagent.com/job_bc7b9e4f-7678-4b25-b887-2287e22fd313/artifacts/vl9x3m91_Logo1.jpg' }}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Libreya</Text>
      <Text style={styles.subtitle}>Your Digital Library</Text>
      <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 24,
  },
  loader: {
    marginTop: 16,
  },
});
