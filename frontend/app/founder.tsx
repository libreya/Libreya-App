import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Stack } from 'expo-router';
import { COLORS, FONTS, LOGO_URL } from '../constants/theme';
import { useAppStore } from '../lib/store';
import { Footer } from '../components/Footer';

export default function FounderScreen() {
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;
  const italicFont = fontsLoaded ? FONTS.bodyItalic : FONTS.bodyFallback;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={true}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Image source={{ uri: LOGO_URL }} style={styles.heroLogo} resizeMode="contain" />
          <Text style={[styles.heroTitle, { fontFamily: headingFont }]}>A Letter from the Founder</Text>
        </View>

        {/* Letter Content */}
        <View style={styles.letterSection}>
          <View style={styles.letterCard}>
            <Text style={[styles.bodyText, { fontFamily: bodyFont }]}>
              I grew up in the Philippines with a deep love for books. Stories were my windows into different worlds, expanding what I thought was possible and making the world feel larger.{"\n\n"}However, access was not always easy. Libraries were limited, books were expensive, and the idea of abundant, free reading was not a reality for many. Libreya was born from that memory.
            </Text>

            <Text style={[styles.bodyText, { fontFamily: bodyFont, marginTop: 20 }]}>
              We believe that classic books deserve a space that invites depth, but more importantly, they deserve to be accessible. This platform is about more than design or curation; it is about opportunity. Libreya exists so that anyone, anywhere, can access the world's most influential works without barriers.
            </Text>

            {/* Larger Mission */}
            <View style={styles.missionBlock}>
              <Text style={[styles.subheading, { fontFamily: headingFont }]}>A Larger Mission</Text>
              <Text style={[styles.bodyText, { fontFamily: bodyFont }]}>
                Libreya is also part of something bigger. It supports my passion project, Eskwela Ta—an initiative dedicated to expanding educational access in the Philippines. Through Eskwela Ta, we provide scholarships, donate classic books to schools, and supply essential learning materials to underserved communities. Libreya helps fuel that mission.
              </Text>
            </View>

            <Text style={[styles.bodyText, { fontFamily: bodyFont, marginTop: 20 }]}>
              This is deeply personal to me. The vision is simple: to create a space where everyone has an equal opportunity to read. Because reading is not just a pastime—it is power, imagination, mobility, and freedom.{"\n\n"}Libreya is my small contribution toward a larger hope: that no child grows up loving books but struggling to find them.{"\n\n"}Thank you for being part of this journey.
            </Text>

            <Text style={[styles.signature, { fontFamily: italicFont }]}>
              — Libreya Founder
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
  heroLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 32,
    textAlign: 'center',
  },
  letterSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  letterCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 32,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  bodyText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 28,
  },
  subheading: {
    fontSize: 22,
    color: COLORS.primary,
    marginBottom: 12,
  },
  missionBlock: {
    marginTop: 28,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(90,31,43,0.15)',
  },
  signature: {
    fontSize: 18,
    color: COLORS.primary,
    marginTop: 32,
    textAlign: 'right',
  },
});
