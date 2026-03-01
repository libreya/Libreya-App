import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useAppStore } from '../lib/store';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';

const FAQ_ITEMS = [
  {
    q: 'Are all books really free?',
    a: 'Yes! All books in our collection are in the public domain, meaning their copyrights have expired. You can read, download, and share them freely.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'An account is not necessary but if you want to be able to move from one device to another without losing your favorites, having an account is recommended. You can also just sign in as guest and simply browse our collection and start reading immediately.',
  },
  {
    q: 'How can I suggest a book?',
    a: "We're always looking to expand our collection. Reach out via our social media channels with your suggestions for classic works you'd like to see.",
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={true}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { fontFamily: headingFont }]}>Frequently Asked Questions</Text>
          <Text style={[styles.heroDesc, { fontFamily: bodyFont }]}>
            Everything you need to know about Libreya
          </Text>
        </View>

        {/* FAQ Items */}
        <View style={styles.faqSection}>
          {FAQ_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.faqItem}
              onPress={() => setOpenIndex(openIndex === i ? null : i)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { fontFamily: headingFont }]}>{item.q}</Text>
                <Ionicons
                  name={openIndex === i ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={COLORS.primary}
                />
              </View>
              {openIndex === i && (
                <Text style={[styles.faqAnswer, { fontFamily: bodyFont }]}>{item.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={[styles.ctaTitle, { fontFamily: headingFont }]}>Ready to Start Reading?</Text>
          <Text style={[styles.ctaDesc, { fontFamily: bodyFont }]}>
            Explore our collection of classic literature and discover your next favorite book.
          </Text>
          <Button
            title="Browse Library"
            onPress={() => router.push('/browse' as any)}
            style={{ marginTop: 16, alignSelf: 'center' }}
          />
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
  faqSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
    gap: 12,
  },
  faqItem: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 20,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 17,
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 24,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  ctaSection: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDesc: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    maxWidth: 500,
  },
});
