import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, useWindowDimensions, Animated } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, LOGO_URL } from '../constants/theme';
import { useAppStore } from '../lib/store';

function AnimatedNavLink({ label, isActive, onPress, bodyFont }: { label: string; isActive: boolean; onPress: () => void; bodyFont: string }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, friction: 8 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.navLink, isActive && styles.navLinkActive]}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.navLinkText,
          { fontFamily: bodyFont },
          isActive && styles.navLinkTextActive,
        ]}>
          {label}
        </Text>
        {isActive && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

function AnimatedButton({ label, onPress, bodyFont, style }: { label: string; onPress: () => void; bodyFont: string; style?: any }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true, friction: 8 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.signInBtn, style]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.85}
      >
        <Text style={[styles.signInBtnText, { fontFamily: bodyFont }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const isMobile = width < 768;
  const isLoggedIn = !!user;

  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;

  const loggedOutLinks = [
    { label: 'Home', path: '/' },
    { label: 'Browse', path: '/browse' },
    { label: 'About', path: '/about' },
    { label: 'Donate', path: '/donate' },
  ];

  const loggedInLinks = [
    { label: 'Home', path: '/' },
    { label: 'Browse', path: '/browse' },
    { label: 'Favorites', path: '/(tabs)/favorites' },
    { label: 'Search', path: '/(tabs)/search' },
    { label: 'About', path: '/about' },
    { label: 'Profile', path: '/(tabs)/profile' },
  ];

  const links = isLoggedIn ? loggedInLinks : loggedOutLinks;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/' || pathname === '';
    return pathname.startsWith(path);
  };

  const navigate = (path: string) => {
    toggleMenu(false);
    router.push(path as any);
  };

  const toggleMenu = useCallback((open: boolean) => {
    setMenuOpen(open);
    Animated.timing(menuAnim, {
      toValue: open ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [menuAnim]);

  // Don't show header on certain screens
  const hideOnPaths = ['/welcome', '/auth'];
  if (hideOnPaths.some(p => pathname.startsWith(p))) return null;
  if (pathname.startsWith('/book/')) return null;

  const menuHeight = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, links.length * 52 + (isLoggedIn ? 16 : 68)],
  });

  const menuOpacity = menuAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {/* Logo */}
        <TouchableOpacity style={styles.logoContainer} onPress={() => navigate('/')} activeOpacity={0.8}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.logoText, { fontFamily: headingFont }]}>Libreya</Text>
        </TouchableOpacity>

        {/* Desktop Nav */}
        {!isMobile ? (
          <View style={styles.desktopNav}>
            {links.map((link) => (
              <AnimatedNavLink
                key={link.path}
                label={link.label}
                isActive={isActive(link.path)}
                onPress={() => navigate(link.path)}
                bodyFont={bodyFont}
              />
            ))}
            {!isLoggedIn && (
              <AnimatedButton label="Sign In" onPress={() => navigate('/welcome')} bodyFont={bodyFont} />
            )}
          </View>
        ) : (
          /* Mobile hamburger */
          <TouchableOpacity onPress={() => toggleMenu(!menuOpen)} style={styles.hamburger} activeOpacity={0.7}>
            <Ionicons name={menuOpen ? 'close' : 'menu'} size={28} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile menu dropdown with animation */}
      {isMobile && (
        <Animated.View style={[styles.mobileMenu, { maxHeight: menuHeight, opacity: menuOpacity, overflow: 'hidden' }]}>
          {links.map((link) => (
            <TouchableOpacity
              key={link.path}
              onPress={() => navigate(link.path)}
              style={[styles.mobileLink, isActive(link.path) && styles.mobileLinkActive]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.mobileLinkText,
                { fontFamily: bodyFont },
                isActive(link.path) && styles.mobileLinkTextActive,
              ]}>
                {link.label}
              </Text>
              {isActive(link.path) && <View style={styles.mobileLinkDot} />}
            </TouchableOpacity>
          ))}
          {!isLoggedIn && (
            <AnimatedButton
              label="Sign In"
              onPress={() => navigate('/welcome')}
              bodyFont={bodyFont}
              style={{ alignSelf: 'flex-start', marginTop: 8, marginLeft: 0 }}
            />
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    zIndex: 100,
    ...(Platform.OS === 'web' ? { position: 'sticky' as any, top: 0 } : {}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: '700',
  },
  desktopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navLink: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
  },
  navLinkActive: {
    backgroundColor: 'rgba(90, 31, 43, 0.06)',
  },
  navLinkText: {
    fontSize: 15,
    color: COLORS.text,
  },
  navLinkTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '30%',
    right: '30%',
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
  },
  signInBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  signInBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  hamburger: {
    padding: 8,
  },
  mobileMenu: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  mobileLink: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileLinkActive: {
    borderBottomColor: COLORS.primary,
  },
  mobileLinkText: {
    fontSize: 16,
    color: COLORS.text,
  },
  mobileLinkTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  mobileLinkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
});
