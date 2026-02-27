import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useAppStore } from '../lib/store';
import { LoadingScreen } from '../components/LoadingScreen';
import { TermsModal } from '../components/TermsModal';
import WebAdBanner from '../components/WebAdBanner';
import { THEMES } from '../constants/theme';

export default function RootLayout() {
  const initializeApp = useAppStore((s) => s.initializeApp);
  const isLoading = useAppStore((s) => s.isLoading);
  const user = useAppStore((s) => s.user);
  const acceptTerms = useAppStore((s) => s.acceptTerms);
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];

  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const [mounted, setMounted] = useState(false); // ensure stack is mounted
  const [showTerms, setShowTerms] = useState(false);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Mark layout as mounted after first render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Inject AdSense script (WEB ONLY)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const existingScript = document.querySelector(
        'script[src*="adsbygoogle.js"]'
      );

      if (!existingScript) {
        const script = document.createElement('script');
        script.src =
            'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4299148862195882';
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }
    }
  }, []);

  // Handle routing based on user state, safely after layout mounts
  useEffect(() => {
    if (!mounted || isLoading || !navigationState?.key) return;

    const inWelcome = segments[0] === 'welcome';
    const inIndex = segments.length === 0 || segments[0] === 'index' || segments[0] === '';
    const inTabs = segments[0] === '(tabs)';

    // Redirect rules
    if (!user && (inIndex || inTabs)) {
      router.replace('/welcome');
    } else if (user && user.terms_accepted && (inIndex || inWelcome)) {
      router.replace('/(tabs)');
    }
  }, [mounted, isLoading, user, segments, navigationState?.key]);

  // Show terms modal if user navigates to tabs without accepting terms
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

  return (
    <SafeAreaProvider>
      <StatusBar style={theme === 'dark' || theme === 'night' ? 'light' : 'dark'} />

      {/* Stack Navigation */}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
        <Stack.Screen name="book/[id]" options={{ headerShown: true, title: 'Reading' }} />
        <Stack.Screen name="admin" options={{ headerShown: true, title: 'Admin Dashboard' }} />
        <Stack.Screen name="legal/[type]" options={{ headerShown: true }} />
      </Stack>

      {/* Mobile-only loading overlay */}
      {isLoading && Platform.OS !== 'web' && <LoadingScreen />}

      {/* Web AdSense banner */}
      {Platform.OS === 'web' && <WebAdBanner />}

      {/* Terms Modal */}
      <TermsModal visible={showTerms} onAccept={handleAcceptTerms} />
    </SafeAreaProvider>
  );
}