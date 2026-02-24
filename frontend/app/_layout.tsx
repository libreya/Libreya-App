import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../lib/store';
import { LoadingScreen } from '../components/LoadingScreen';
import { TermsModal } from '../components/TermsModal';
import { COLORS, THEMES } from '../constants/theme';
import { Platform } from 'react-native';
import WebAdBanner from '@/components/WebAdBanner';

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
  const [showTerms, setShowTerms] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Initialize app
  useEffect(() => {
    initializeApp();
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

  // Handle routing based on user state
  useEffect(() => {
    if (isLoading) return;
    if (!navigationState?.key) return;
    if (hasNavigated) return;

    const inWelcome = segments[0] === 'welcome';
    const inIndex = segments.length === 0 || segments[0] === 'index' || segments[0] === '';
    const inTabs = segments[0] === '(tabs)';
    const inBook = segments[0] === 'book';
    const inLegal = segments[0] === 'legal';
    const inAdmin = segments[0] === 'admin';

    // Allow public pages without login: welcome, book reader, legal
    // Only redirect to welcome from index or protected tabs
    if (!user && inIndex) {
      router.replace('/welcome');
      setHasNavigated(true);
    } else if (!user && inTabs) {
      router.replace('/welcome');
      setHasNavigated(true);
    } else if (user && user.terms_accepted && (inIndex || inWelcome)) {
      router.replace('/(tabs)');
      setHasNavigated(true);
    }
  }, [user, segments, isLoading, navigationState?.key, hasNavigated]);

  // Show terms modal only when navigating to tabs without accepted terms
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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={theme === 'dark' || theme === 'night' ? 'light' : 'dark'} />
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
      </Stack>
      <WebAdBanner/>
      <TermsModal visible={showTerms} onAccept={handleAcceptTerms} />
    </SafeAreaProvider>
  );
}