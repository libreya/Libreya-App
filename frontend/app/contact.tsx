import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useAppStore } from '../lib/store';
import { Footer } from '../components/Footer';

export default function ContactScreen() {
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;

  const handleEmail = () => {
    Linking.openURL('mailto:hello@libreya.app');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={true}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { fontFamily: headingFont }]}>Contact Us</Text>
          <Text style={[styles.heroDesc, { fontFamily: bodyFont }]}>
            We'd love to hear from you
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={[styles.cardTitle, { fontFamily: headingFont }]}>Email Us</Text>
            <Text style={[styles.cardDesc, { fontFamily: bodyFont }]}>
              For general inquiries, book suggestions, partnership opportunities, or legal matters.
            </Text>
            <TouchableOpacity style={styles.emailBtn} onPress={handleEmail}>
              <Ionicons name="mail" size={18} color={COLORS.white} />
              <Text style={[styles.emailBtnText, { fontFamily: bodyFont }]}>hello@libreya.app</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubbles-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={[styles.cardTitle, { fontFamily: headingFont }]}>Response Time</Text>
            <Text style={[styles.cardDesc, { fontFamily: bodyFont }]}>
              We aim to respond to all inquiries within 48 hours. For urgent legal matters, please include "URGENT" in your subject line.
            </Text>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  heroSection: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: 'center',
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
    gap: 24,
  },
  card: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(90,31,43,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    color: COLORS.text,
    marginBottom: 12,
  },
  cardDesc: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emailBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
