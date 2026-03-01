import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useAppStore } from '../lib/store';
import { Footer } from '../components/Footer';

export default function DonateScreen() {
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Ionicons name="heart" size={48} color={COLORS.accent} />
          <Text style={[styles.heroTitle, { fontFamily: headingFont }]}>Support Libreya</Text>
          <Text style={[styles.heroDesc, { fontFamily: bodyFont }]}>
            Help us keep classic literature free and accessible for everyone
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontFamily: headingFont }]}>Why Donate?</Text>
            <Text style={[styles.cardDesc, { fontFamily: bodyFont }]}>
              Libreya is committed to providing free access to classic literature. Your generous donations help us:{"\n\n"}• Maintain and improve the reading platform{"\n"}• Add new books to our collection{"\n"}• Support Eskwela Ta, our educational initiative in the Philippines{"\n"}• Keep the service running without paywalls
            </Text>
          </View>

          <View style={[styles.card, styles.comingSoonCard]}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={32} color={COLORS.accent} />
            </View>
            <Text style={[styles.cardTitle, { fontFamily: headingFont }]}>Coming Soon</Text>
            <Text style={[styles.cardDesc, { fontFamily: bodyFont }]}>
              Our donation system is being set up. In the meantime, you can support us by sharing Libreya with fellow book lovers and leaving positive reviews.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontFamily: headingFont }]}>Other Ways to Help</Text>
            <Text style={[styles.cardDesc, { fontFamily: bodyFont }]}>
              • Share Libreya with friends and family{"\n"}• Suggest books for our collection{"\n"}• Report bugs or provide feedback{"\n"}• Follow us on social media
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
    marginTop: 16,
    marginBottom: 12,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 500,
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
    padding: 28,
  },
  comingSoonCard: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(198,167,94,0.15)',
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
    lineHeight: 26,
    textAlign: 'left',
  },
});
