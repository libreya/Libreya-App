import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useAppStore } from '../lib/store';
import { Footer } from '../components/Footer';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;
  const italicFont = fontsLoaded ? FONTS.bodyItalic : FONTS.bodyFallback;

  const values = [
    { icon: 'heart-outline' as const, title: 'Free Forever', desc: 'We believe great literature should be accessible to everyone, regardless of economic circumstances.' },
    { icon: 'globe-outline' as const, title: 'Global Access', desc: 'Our digital library is available worldwide, 24/7, with no geographic restrictions.' },
    { icon: 'library-outline' as const, title: 'Preserving Heritage', desc: "We're dedicated to preserving and sharing humanity's literary heritage for future generations." },
    { icon: 'people-outline' as const, title: 'Community Driven', desc: 'Join thousands of readers who share our passion for classic literature and lifelong learning.' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroLabel, { fontFamily: bodyFont }]}>OUR MISSION</Text>
          <Text style={[styles.heroTitle, { fontFamily: headingFont }]}>Literature for Everyone</Text>
          <Text style={[styles.heroDesc, { fontFamily: bodyFont }]}>
            Libreya was founded with a simple yet powerful vision: to make the world's greatest literary works accessible to everyone, everywhere, at no cost.
          </Text>
        </View>

        {/* Mission Content */}
        <View style={styles.section}>
          <Text style={[styles.bodyText, { fontFamily: bodyFont }]}>
            We believe that classic literature is a shared heritage that belongs to all of humanity, not just those who can afford premium editions.{"\n\n"}Our collection features carefully curated public domain works from the authors who shaped human thought. From the timeless plays of Shakespeare and the witty social commentary of Austen to the epic tales of Homer and the profound philosophies of Plato and Marcus Aurelius, we bring these masterpieces directly to your fingertips.{"\n\n"}Inspired by initiatives like Project Gutenberg, we have crafted a modern, elegant reading experience that honors these classic works while making them easy to discover and enjoy on any device.
          </Text>
        </View>

        {/* Values */}
        <View style={[styles.section, styles.valuesSection]}>
          <Text style={[styles.sectionLabel, { fontFamily: bodyFont }]}>What drives us every day</Text>
          <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>Our Values</Text>
          <View style={styles.valuesGrid}>
            {values.map((v, i) => (
              <View key={i} style={styles.valueCard}>
                <View style={styles.valueIcon}>
                  <Ionicons name={v.icon} size={28} color={COLORS.primary} />
                </View>
                <Text style={[styles.valueTitle, { fontFamily: headingFont }]}>{v.title}</Text>
                <Text style={[styles.valueDesc, { fontFamily: bodyFont }]}>{v.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Philosophy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>The Philosophy</Text>
          <Text style={[styles.bodyText, { fontFamily: bodyFont }]}>
            At Libreya, we believe great literature should feel alive, not archived. In a world of endless scrolling and fragmented attention, classic books deserve a quieter space—one that invites focus, reflection, and depth.{"\n\n"}Libreya is not a content dump; it is a curated library.{"\n"}
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { fontFamily: italicFont }]}>• Intentional, not overwhelming.</Text>
            <Text style={[styles.bulletItem, { fontFamily: italicFont }]}>• Timeless, not loud.</Text>
          </View>
        </View>

        {/* The Reader We Serve */}
        <View style={[styles.section, styles.accentBg]}>
          <Text style={[styles.sectionTitle, { fontFamily: headingFont, color: COLORS.primary }]}>The Reader We Serve</Text>
          <Text style={[styles.bodyText, { fontFamily: bodyFont }]}>Libreya is for readers who move with intention:</Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { fontFamily: bodyFont }]}>• For those who believe great books deserve focus, not distraction.</Text>
            <Text style={[styles.bulletItem, { fontFamily: bodyFont }]}>• For students who seek clarity.</Text>
            <Text style={[styles.bulletItem, { fontFamily: bodyFont }]}>• For thinkers who return to the classics out of curiosity, not obligation.</Text>
            <Text style={[styles.bulletItem, { fontFamily: bodyFont }]}>• For modern readers who crave depth in a world designed for speed.</Text>
          </View>
          <Text style={[styles.bodyText, { fontFamily: bodyFont, marginTop: 16 }]}>Libreya readers value:</Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { fontFamily: bodyFont }]}>• Substance over noise.</Text>
            <Text style={[styles.bulletItem, { fontFamily: bodyFont }]}>• Design that respects attention.</Text>
            <Text style={[styles.bulletItem, { fontFamily: bodyFont }]}>• Literature that endures.</Text>
          </View>
        </View>

        {/* Why Libreya Exists */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>Why Libreya Exists</Text>
          <Text style={[styles.bodyText, { fontFamily: bodyFont }]}>
            Most digital reading experiences overwhelm the user with thousands of titles, cluttered interfaces, and distracting elements competing for attention.{"\n\n"}Libreya takes a different approach: We curate.{"\n\n"}Instead of offering everything, we offer what matters. Instead of noise, we create calm. Instead of distraction, we design for depth. Libreya is not built for endless scrolling; it is built for intentional reading.
          </Text>
        </View>

        {/* What Makes Us Different */}
        <View style={[styles.section, styles.accentBg]}>
          <Text style={[styles.sectionTitle, { fontFamily: headingFont, color: COLORS.primary }]}>What Makes Us Different</Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { fontFamily: bodyFont }]}>• A Curated Selection: A handpicked library of timeless classics.</Text>
            <Text style={[styles.bulletItem, { fontFamily: bodyFont }]}>• Minimalist Experience: An editorial design focused on readability.</Text>
            <Text style={[styles.bulletItem, { fontFamily: bodyFont }]}>• Personalized Tools: Highlighting and favorites to make every book your own.</Text>
            <Text style={[styles.bulletItem, { fontFamily: bodyFont }]}>• Seamless Continuity: Resume reading across all your devices.</Text>
            <Text style={[styles.bulletItem, { fontFamily: bodyFont }]}>• Focus-Driven: Designed for immersion, not stimulation.</Text>
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
  heroLabel: {
    color: COLORS.accent,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 600,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  accentBg: {
    backgroundColor: COLORS.secondary,
    maxWidth: '100%',
    paddingHorizontal: 24,
  },
  sectionLabel: {
    color: COLORS.gray,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 28,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 28,
  },
  bulletList: {
    marginTop: 12,
    gap: 8,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  bulletItem: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 26,
    paddingLeft: 8,
  },
  valuesSection: {
    maxWidth: '100%',
    alignItems: 'center',
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    maxWidth: 900,
  },
  valueCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: 260,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  valueIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(90,31,43,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  valueTitle: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 8,
  },
  valueDesc: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
});
