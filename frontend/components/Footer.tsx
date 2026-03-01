import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, LOGO_URL } from '../constants/theme';
import { useAppStore } from '../lib/store';

export function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;

  // Don't show footer on certain screens
  const hideOnPaths = ['/welcome', '/auth', '/book/'];
  if (hideOnPaths.some(p => pathname.startsWith(p))) return null;

  const navigate = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.footer}>
      <View style={styles.footerInner}>
        {/* Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.brandRow}>
            <Image source={{ uri: LOGO_URL }} style={styles.footerLogo} resizeMode="contain" />
            <Text style={[styles.brandName, { fontFamily: headingFont }]}>Libreya</Text>
          </View>
          <Text style={[styles.brandTagline, { fontFamily: bodyFont }]}>
            Classic literature, free forever.
          </Text>
        </View>

        {/* Links Grid */}
        <View style={styles.linksGrid}>
          <View style={styles.linkColumn}>
            <Text style={[styles.columnTitle, { fontFamily: headingFont }]}>Explore</Text>
            <TouchableOpacity onPress={() => navigate('/browse')}>
              <Text style={[styles.linkText, { fontFamily: bodyFont }]}>Browse Library</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate('/about')}>
              <Text style={[styles.linkText, { fontFamily: bodyFont }]}>About Us</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate('/faq')}>
              <Text style={[styles.linkText, { fontFamily: bodyFont }]}>FAQ</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.linkColumn}>
            <Text style={[styles.columnTitle, { fontFamily: headingFont }]}>Legal</Text>
            <TouchableOpacity onPress={() => navigate('/legal/privacy')}>
              <Text style={[styles.linkText, { fontFamily: bodyFont }]}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate('/legal/terms')}>
              <Text style={[styles.linkText, { fontFamily: bodyFont }]}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate('/legal/legal')}>
              <Text style={[styles.linkText, { fontFamily: bodyFont }]}>Legal Notice</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.linkColumn}>
            <Text style={[styles.columnTitle, { fontFamily: headingFont }]}>Connect</Text>
            <TouchableOpacity onPress={() => navigate('/contact')}>
              <Text style={[styles.linkText, { fontFamily: bodyFont }]}>Contact Us</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate('/donate')}>
              <Text style={[styles.linkText, { fontFamily: bodyFont }]}>Donate</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate('/founder')}>
              <Text style={[styles.linkText, { fontFamily: bodyFont }]}>Founder's Letter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Text style={[styles.copyright, { fontFamily: bodyFont }]}>
          © {new Date().getFullYear()} Libreya. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: COLORS.primary,
    paddingTop: 40,
  },
  footerInner: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 40,
    paddingBottom: 32,
  },
  brandSection: {
    minWidth: 200,
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  footerLogo: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  brandName: {
    fontSize: 22,
    color: COLORS.white,
    fontWeight: '700',
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    flex: 2,
  },
  linkColumn: {
    minWidth: 140,
    gap: 10,
  },
  columnTitle: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  linkText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
});
