import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useAppStore } from '../lib/store';
import { TermsModal } from '../components/TermsModal';
import { Header } from '../components/Header';
import { COLORS, THEMES } from '../constants/theme';

// Keep splash screen while loading
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const initializeApp = useAppStore((s) => s.initializeApp);
  const isLoading = useAppStore((s) => s.isLoading);
  const user = useAppStore((s) => s.user);
  const acceptTerms = useAppStore((s) => s.acceptTerms);
  const theme = useAppStore((s) => s.theme);
  const setFontsLoaded = useAppStore((s) => s.setFontsLoaded);
  const colors = THEMES[theme];
  const segments = useSegments();
  const [showTerms, setShowTerms] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // Load fonts and initialize app
  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'LibreBaskerville-Regular': require('../assets/fonts/LibreBaskerville-Regular.ttf'),
          'LibreBaskerville-Bold': require('../assets/fonts/LibreBaskerville-Bold.ttf'),
          'LibreBaskerville-Italic': require('../assets/fonts/LibreBaskerville-Italic.ttf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        // Font loading failed, continue with fallback fonts
      }

      await initializeApp();
      setAppReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  // Show terms modal only when navigating to protected areas without accepted terms
  useEffect(() => {
    if (user && !user.terms_accepted && segments[0] === '(tabs)') {
      setShowTerms(true);
    } else {
      setShowTerms(false);
    }
  }, [user, segments]);

  const handleAcceptTerms = async () => {
    await acceptTerms();
    setShowTerms(false);
  };

  if (!appReady) {
    return null; // Splash screen is showing
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={theme === 'dark' || theme === 'night' ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.background },
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="book/[id]" options={{ headerShown: true, title: 'Reading' }} />
          <Stack.Screen name="admin" options={{ headerShown: true, title: 'Admin Dashboard' }} />
          <Stack.Screen name="legal/[type]" options={{ headerShown: true }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="founder" options={{ headerShown: false }} />
          <Stack.Screen name="faq" options={{ headerShown: false }} />
          <Stack.Screen name="contact" options={{ headerShown: false }} />
          <Stack.Screen name="donate" options={{ headerShown: false }} />
          <Stack.Screen name="browse" options={{ headerShown: false }} />
        </Stack>
      </View>
      <TermsModal visible={showTerms} onAccept={handleAcceptTerms} />
    </SafeAreaProvider>
  );
}
