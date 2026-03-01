import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, useWindowDimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, LOGO_URL } from '../constants/theme';
import { useAppStore } from '../lib/store';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
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
    { label: 'Favorites', path: '/favorites' },
    { label: 'Search', path: '/search' },
    { label: 'About', path: '/about' },
    { label: 'Profile', path: '/profile' },
  ];

  const links = isLoggedIn ? loggedInLinks : loggedOutLinks;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/' || pathname === '';
    return pathname.startsWith(path);
  };

  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  // Don't show header on certain screens
  const hideOnPaths = ['/welcome', '/auth'];
  if (hideOnPaths.some(p => pathname.startsWith(p))) return null;
  // Also hide on book reader for immersive experience
  if (pathname.startsWith('/book/')) return null;

  return (
    <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {/* Logo */}
        <TouchableOpacity style={styles.logoContainer} onPress={() => navigate('/')}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.logoText, { fontFamily: headingFont }]}>Libreya</Text>
        </TouchableOpacity>

        {/* Desktop Nav */}
        {!isMobile ? (
          <View style={styles.desktopNav}>
            {links.map((link) => (
              <TouchableOpacity
                key={link.path}
                onPress={() => navigate(link.path)}
                style={[styles.navLink, isActive(link.path) && styles.navLinkActive]}
              >
                <Text style={[
                  styles.navLinkText,
                  { fontFamily: bodyFont },
                  isActive(link.path) && styles.navLinkTextActive,
                ]}>
                  {link.label}
                </Text>
              </TouchableOpacity>
            ))}
            {!isLoggedIn && (
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => navigate('/welcome')}
              >
                <Text style={[styles.signInBtnText, { fontFamily: bodyFont }]}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Mobile hamburger */
          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.hamburger}>
            <Ionicons name={menuOpen ? 'close' : 'menu'} size={28} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile menu dropdown */}
      {isMobile && menuOpen && (
        <View style={styles.mobileMenu}>
          {links.map((link) => (
            <TouchableOpacity
              key={link.path}
              onPress={() => navigate(link.path)}
              style={[styles.mobileLink, isActive(link.path) && styles.mobileLinkActive]}
            >
              <Text style={[
                styles.mobileLinkText,
                { fontFamily: bodyFont },
                isActive(link.path) && styles.mobileLinkTextActive,
              ]}>
                {link.label}
              </Text>
            </TouchableOpacity>
          ))}
          {!isLoggedIn && (
            <TouchableOpacity
              style={[styles.signInBtn, { alignSelf: 'flex-start', marginTop: 8 }]}
              onPress={() => navigate('/welcome')}
            >
              <Text style={[styles.signInBtnText, { fontFamily: bodyFont }]}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
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
    gap: 8,
  },
  navLink: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navLinkActive: {
    backgroundColor: 'rgba(90, 31, 43, 0.08)',
  },
  navLinkText: {
    fontSize: 15,
    color: COLORS.text,
  },
  navLinkTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
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
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  mobileLink: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
});
