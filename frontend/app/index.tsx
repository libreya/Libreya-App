import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, LOGO_URL } from '../constants/theme';
import { useAppStore, Book } from '../lib/store';
import { api } from '../lib/api';
import { Footer } from '../components/Footer';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const user = useAppStore((s) => s.user);
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;
  const isMobile = width < 768;

  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState(301);
  const [totalCategories, setTotalCategories] = useState(25);

  useEffect(() => {
    loadFeaturedBooks();
    loadStats();
  }, []);

  const loadFeaturedBooks = async () => {
    try {
      const data = await api.get('/books/featured?limit=5');
      if (data && data.length > 0) {
        setFeaturedBooks(data);
      } else {
        // Fallback: get top books by read count
        const fallback = await api.get('/books?limit=5');
        setFeaturedBooks(fallback || []);
      }
    } catch (e) {
      // Silent fail - landing page still renders static content
    }
  };

  const loadStats = async () => {
    try {
      const [books, cats] = await Promise.all([
        api.get('/books?limit=1'),
        api.get('/books/categories/list'),
      ]);
      // We know we have 262+ books
      if (cats) setTotalCategories(cats.length || 25);
    } catch (e) {
      // Use defaults
    }
  };

  const stats = [
    { number: `${totalBooks}+`, label: 'Classics', icon: 'book' as const },
    { number: `${totalCategories}+`, label: 'Genres', icon: 'grid' as const },
    { number: '100%', label: 'Free', icon: 'heart' as const },
  ];

  const benefits = [
    { icon: 'sync-outline' as const, title: 'Cross-Device Sync', desc: 'Continue reading on any device without losing your place' },
    { icon: 'bookmark-outline' as const, title: 'Smart Favorites', desc: 'Build your personal library of favorite classics' },
    { icon: 'time-outline' as const, title: 'Reading History', desc: 'Track your progress across all books' },
    { icon: 'color-palette-outline' as const, title: 'Custom Themes', desc: 'Read in light, dark, sepia, or night mode' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ===== HERO SECTION ===== */}
        <View style={styles.hero}>
          <Image source={{ uri: LOGO_URL }} style={styles.heroLogo} resizeMode="contain" />
          <Text style={[styles.heroTitle, { fontFamily: headingFont }]}>
            Classic Literature,{'\n'}Reimagined
          </Text>
          <Text style={[styles.heroSubtitle, { fontFamily: bodyFont }]}>
            Discover over 300 timeless masterpieces from the world's greatest authors. Beautifully formatted, completely free, forever.
          </Text>
          <View style={styles.heroCTA}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              onPress={() => router.push('/browse' as any)}
            >
              <Text style={[styles.ctaPrimaryText, { fontFamily: bodyFont }]}>Explore Library</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
            {!user && (
              <TouchableOpacity
                style={styles.ctaSecondary}
                onPress={() => router.push('/welcome' as any)}
              >
                <Text style={[styles.ctaSecondaryText, { fontFamily: bodyFont }]}>Create Account</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ===== STATS SECTION ===== */}
        <View style={styles.statsSection}>
          <Text style={[styles.statsLabel, { fontFamily: bodyFont }]}>LIBRARY AT A GLANCE</Text>
          <View style={styles.statsRow}>
            {stats.map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <Ionicons name={stat.icon} size={28} color={COLORS.accent} />
                <Text style={[styles.statNumber, { fontFamily: headingFont }]}>{stat.number}</Text>
                <Text style={[styles.statLabel, { fontFamily: bodyFont }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ===== FEATURED BOOKS ===== */}
        <View style={styles.featuredSection}>
          <Text style={[styles.sectionLabel, { fontFamily: bodyFont }]}>HANDPICKED FOR YOU</Text>
          <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>Featured Classics</Text>
          {featuredBooks.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featuredBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.featuredCard}
                  onPress={() => router.push(`/book/${book.id}` as any)}
                  activeOpacity={0.85}
                >
                  {book.cover_image ? (
                    <Image source={{ uri: book.cover_image }} style={styles.featuredCover} resizeMode="cover" />
                  ) : (
                    <View style={[styles.featuredCover, styles.featuredCoverPlaceholder]}>
                      <Text style={[styles.featuredCoverTitle, { fontFamily: headingFont }]} numberOfLines={3}>
                        {book.title}
                      </Text>
                      <Text style={[styles.featuredCoverAuthor, { fontFamily: bodyFont }]} numberOfLines={1}>
                        {book.author}
                      </Text>
                    </View>
                  )}
                  <View style={styles.featuredInfo}>
                    <Text style={[styles.featuredTitle, { fontFamily: headingFont }]} numberOfLines={2}>
                      {book.title}
                    </Text>
                    <Text style={[styles.featuredAuthor, { fontFamily: bodyFont }]} numberOfLines={1}>
                      {book.author}
                    </Text>
                    {book.category && (
                      <View style={styles.featuredBadge}>
                        <Text style={[styles.featuredBadgeText, { fontFamily: bodyFont }]}>{book.category}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
          )}
        </View>

        {/* ===== BENEFITS SECTION ===== */}
        <View style={styles.benefitsSection}>
          <Text style={[styles.sectionLabel, { fontFamily: bodyFont, color: COLORS.accent }]}>WHY CREATE AN ACCOUNT</Text>
          <Text style={[styles.sectionTitle, { fontFamily: headingFont, color: COLORS.white }]}>
            Benefits for Readers
          </Text>
          <View style={styles.benefitsGrid}>
            {benefits.map((b, i) => (
              <View key={i} style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={b.icon} size={24} color={COLORS.primary} />
                </View>
                <Text style={[styles.benefitTitle, { fontFamily: headingFont }]}>{b.title}</Text>
                <Text style={[styles.benefitDesc, { fontFamily: bodyFont }]}>{b.desc}</Text>
              </View>
            ))}
          </View>
          {!user && (
            <TouchableOpacity
              style={styles.benefitCTA}
              onPress={() => router.push('/welcome' as any)}
            >
              <Text style={[styles.benefitCTAText, { fontFamily: bodyFont }]}>Get Started Free</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* ===== PHILOSOPHY PREVIEW ===== */}
        <View style={styles.philosophySection}>
          <Text style={[styles.philosophyQuote, { fontFamily: fontsLoaded ? FONTS.bodyItalic : FONTS.bodyFallback }]}>
            "Libreya is not built for endless scrolling; it is built for intentional reading."
          </Text>
          <View style={styles.philosophyDivider} />
          <Text style={[styles.philosophyDesc, { fontFamily: bodyFont }]}>
            We curate timeless literature with minimalist design, creating a calm reading space in a world of digital noise.
          </Text>
          <TouchableOpacity
            style={styles.learnMoreBtn}
            onPress={() => router.push('/about' as any)}
          >
            <Text style={[styles.learnMoreText, { fontFamily: bodyFont }]}>Learn Our Story</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ===== CALL TO ACTION ===== */}
        <View style={styles.finalCTA}>
          <Text style={[styles.finalCTATitle, { fontFamily: headingFont }]}>Begin Your Journey</Text>
          <Text style={[styles.finalCTADesc, { fontFamily: bodyFont }]}>
            Join thousands of readers discovering the world's greatest literature.
          </Text>
          <TouchableOpacity
            style={styles.ctaPrimary}
            onPress={() => router.push('/browse' as any)}
          >
            <Ionicons name="library-outline" size={18} color={COLORS.white} />
            <Text style={[styles.ctaPrimaryText, { fontFamily: bodyFont }]}>Browse Library</Text>
          </TouchableOpacity>
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

  // ===== HERO =====
  hero: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 64,
    alignItems: 'center',
  },
  heroLogo: {
    width: 88,
    height: 88,
    borderRadius: 20,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 40,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 50,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 560,
    marginBottom: 32,
  },
  heroCTA: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },
  ctaPrimaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  ctaSecondary: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  ctaSecondaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },

  // ===== STATS =====
  statsSection: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  statsLabel: {
    fontSize: 12,
    letterSpacing: 3,
    color: COLORS.gray,
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 36,
    color: COLORS.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 15,
    color: COLORS.gray,
    marginTop: 4,
  },

  // ===== FEATURED BOOKS =====
  featuredSection: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 3,
    color: COLORS.gray,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 30,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  featuredScroll: {
    paddingLeft: 8,
    paddingRight: 24,
    gap: 16,
  },
  featuredCard: {
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  featuredCover: {
    width: 200,
    height: 260,
  },
  featuredCoverPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  featuredCoverTitle: {
    color: COLORS.white,
    fontSize: 15,
    textAlign: 'center',
  },
  featuredCoverAuthor: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  featuredInfo: {
    padding: 14,
  },
  featuredTitle: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  featuredAuthor: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  featuredBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  featuredBadgeText: {
    fontSize: 11,
    color: COLORS.primary,
  },

  // ===== BENEFITS =====
  benefitsSection: {
    backgroundColor: COLORS.primary,
    paddingVertical: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
    maxWidth: 900,
  },
  benefitCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 24,
    width: 210,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(90,31,43,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  benefitTitle: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  benefitDesc: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  benefitCTAText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  // ===== PHILOSOPHY =====
  philosophySection: {
    paddingVertical: 56,
    paddingHorizontal: 32,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  philosophyQuote: {
    fontSize: 22,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 34,
    maxWidth: 600,
  },
  philosophyDivider: {
    width: 48,
    height: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginVertical: 24,
  },
  philosophyDesc: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 500,
  },
  learnMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  learnMoreText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '500',
  },

  // ===== FINAL CTA =====
  finalCTA: {
    paddingVertical: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  finalCTATitle: {
    fontSize: 30,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  finalCTADesc: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 400,
  },
});
