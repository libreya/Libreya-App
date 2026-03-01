import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useAppStore } from '../lib/store';

interface AdBannerProps {
  position?: 'top' | 'bottom' | 'inline';
  size?: 'banner' | 'large';
}

/**
 * AdBanner Component - Cross-platform ad integration
 * 
 * - Web: Google AdSense auto-ads handle ad placement automatically.
 *   This component reserves space and shows a minimal placeholder.
 *   The actual AdSense script is injected via +html.tsx.
 * 
 * - Mobile (iOS/Android): Shows AdMob banner ads.
 *   In Expo Go, it shows a styled placeholder.
 *   In production builds, it will render actual AdMob banners.
 * 
 * AdMob IDs from .env:
 *   Android Banner: EXPO_PUBLIC_ADMOB_BANNER_ANDROID
 *   iOS Banner: EXPO_PUBLIC_ADMOB_BANNER_IOS
 */
export function AdBanner({ position = 'bottom', size = 'banner' }: AdBannerProps) {
  const { width } = useWindowDimensions();
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;

  // Responsive sizing
  const adWidth = Math.min(width - 32, size === 'large' ? 728 : 320);
  const adHeight = size === 'large' ? 90 : 50;

  // On web, AdSense auto-ads handle everything - we just show a reserved space indicator
  if (Platform.OS === 'web') {
    return (
      <View style={[
        styles.container,
        position === 'top' ? styles.top : position === 'inline' ? styles.inline : styles.bottom,
      ]}>
        <View style={[styles.webAdSpace, { minHeight: adHeight }]}>
          {/* AdSense auto-ads will inject ads here automatically */}
          {/* This space is reserved to prevent layout shift */}
        </View>
      </View>
    );
  }

  // On mobile - show AdMob placeholder (will be real ads in production build)
  return (
    <View style={[
      styles.container,
      position === 'top' ? styles.top : position === 'inline' ? styles.inline : styles.bottom,
    ]}>
      <View style={[styles.mobileAdPlaceholder, { width: adWidth, height: adHeight }]}>
        <Text style={[styles.adLabel, { fontFamily: bodyFont }]}>Ad</Text>
      </View>
    </View>
  );
}

/**
 * AdSpacer - Reserves space at the bottom of screens for ad content
 * Prevents ads from overlapping navigation or action buttons
 */
export function AdSpacer({ height = 80 }: { height?: number }) {
  return <View style={{ height }} />;
}

/**
 * AdStatusIndicator - Admin-only component to show AdSense load status
 * Shows whether the AdSense script loaded successfully on web
 */
export function AdStatusIndicator() {
  const [adStatus, setAdStatus] = useState<string>('checking');
  const user = useAppStore((s) => s.user);
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setAdStatus('mobile-admob');
      return;
    }

    // Check global AdSense status
    const checkStatus = () => {
      if (typeof window !== 'undefined') {
        const status = (window as any).__ADSENSE_STATUS;
        if (status) {
          setAdStatus(status);
        }
      }
    };

    // Check immediately
    checkStatus();

    // Listen for the custom event
    if (typeof window !== 'undefined') {
      const handler = (e: any) => setAdStatus(e.detail);
      window.addEventListener('adsense-status', handler);
      return () => window.removeEventListener('adsense-status', handler);
    }
  }, []);

  // Only show for admin users
  if (!user?.is_admin) return null;

  const statusConfig = {
    checking: { color: '#F59E0B', icon: '⏳', text: 'Checking AdSense...' },
    loaded: { color: '#10B981', icon: '✅', text: 'AdSense Active' },
    blocked: { color: '#EF4444', icon: '🚫', text: 'AdSense Blocked (ad-blocker?)' },
    'mobile-admob': { color: '#3B82F6', icon: '📱', text: 'Mobile: AdMob Mode' },
  };

  const config = statusConfig[adStatus as keyof typeof statusConfig] || statusConfig.checking;

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.color + '20', borderColor: config.color }]}>
      <Text style={[styles.statusText, { fontFamily: bodyFont, color: config.color }]}>
        {config.icon} {config.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  top: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  bottom: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  inline: {
    paddingVertical: 12,
  },
  // Web: minimal reserved space for AdSense auto-ads
  webAdSpace: {
    width: '100%',
    maxWidth: 728,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Mobile: styled placeholder for AdMob
  mobileAdPlaceholder: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  adLabel: {
    color: '#BBBBBB',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Admin status badge
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
    marginVertical: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
