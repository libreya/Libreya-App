import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, LOGO_URL } from '../constants/theme';
import { useAppStore, Book } from '../lib/store';
import { api } from '../lib/api';
import { Footer } from '../components/Footer';

// ===== DEFAULT (HARDCODED) CONTENT =====
const DEFAULTS = {
  hero_title: 'Classic Literature,\nReimagined',
  hero_subtitle: "Discover over 300 timeless masterpieces from the world's greatest authors. Beautifully formatted, completely free, forever.",
  philosophy_quote: '"Libreya is not built for endless scrolling; it is built for intentional reading."',
  philosophy_desc: 'We curate timeless literature with minimalist design, creating a calm reading space in a world of digital noise.',
  cta_title: 'Begin Your Journey',
  cta_desc: "Join thousands of readers discovering the world's greatest literature.",
};

function AnimatedCard({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
}

function PressableCard({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: any }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, friction: 8 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
        style={{ flex: 1 }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const user = useAppStore((s) => s.user);
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;

  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState(301);
  const [totalCategories, setTotalCategories] = useState(25);

  // CMS content with defaults
  const [cmsContent, setCmsContent] = useState(DEFAULTS);

  useEffect(() => {
    loadFeaturedBooks();
    loadStats();
    loadCmsContent();
  }, []);

  const loadCmsContent = async () => {
    try {
      const settings = await api.get('/settings');
      if (Array.isArray(settings) && settings.length > 0) {
        const mapped: Record<string, string> = {};
        settings.forEach((s: any) => { if (s.key && s.value) mapped[s.key] = s.value; });

        setCmsContent({
          hero_title: mapped.landing_hero_title || DEFAULTS.hero_title,
          hero_subtitle: mapped.landing_hero_subtitle || DEFAULTS.hero_subtitle,
          philosophy_quote: mapped.landing_philosophy_quote || DEFAULTS.philosophy_quote,
          philosophy_desc: mapped.landing_philosophy_desc || DEFAULTS.philosophy_desc,
          cta_title: mapped.landing_cta_title || DEFAULTS.cta_title,
          cta_desc: mapped.landing_cta_desc || DEFAULTS.cta_desc,
        });
      }
    } catch (e) {
      // Keep defaults - user never sees a blank screen
    }
  };

  const loadFeaturedBooks = async () => {
    try {
      const data = await api.get('/books/featured?limit=5');
      if (data && data.length > 0) {
        setFeaturedBooks(data);
      } else {
        const fallback = await api.get('/books?limit=5');
        setFeaturedBooks(fallback || []);
      }
    } catch (e) {
      // Silent
    }
  };

  const loadStats = async () => {
    try {
      const cats = await api.get('/books/categories/list');
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
        {/* ===== HERO ===== */}
        <View style={styles.hero}>
          <Image source={{ uri: LOGO_URL }} style={styles.heroLogo} resizeMode="contain" />
          <Text style={[styles.heroTitle, { fontFamily: headingFont }]}>
            {cmsContent.hero_title}
          </Text>
          <Text style={[styles.heroSubtitle, { fontFamily: bodyFont }]}>
            {cmsContent.hero_subtitle}
          </Text>
          <View style={styles.heroCTA}>
            <PressableCard onPress={() => router.push('/browse' as any)} style={styles.ctaPrimary}>
              <View style={styles.ctaInner}>
                <Text style={[styles.ctaPrimaryText, { fontFamily: bodyFont }]}>Explore Library</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
              </View>
            </PressableCard>
            {!user && (
              <PressableCard onPress={() => router.push('/welcome' as any)} style={styles.ctaSecondary}>
                <Text style={[styles.ctaSecondaryText, { fontFamily: bodyFont }]}>Create Account</Text>
              </PressableCard>
            )}
          </View>
        </View>

        {/* ===== STATS ===== */}
        <View style={styles.statsSection}>
          <Text style={[styles.statsLabel, { fontFamily: bodyFont }]}>LIBRARY AT A GLANCE</Text>
          <View style={styles.statsRow}>
            {stats.map((stat, i) => (
              <AnimatedCard key={i} delay={i * 100} style={styles.statCard}>
                <Ionicons name={stat.icon} size={28} color={COLORS.accent} />
                <Text style={[styles.statNumber, { fontFamily: headingFont }]}>{stat.number}</Text>
                <Text style={[styles.statLabel, { fontFamily: bodyFont }]}>{stat.label}</Text>
              </AnimatedCard>
            ))}
          </View>
        </View>

        {/* ===== FEATURED BOOKS ===== */}
        <View style={styles.featuredSection}>
          <Text style={[styles.sectionLabel, { fontFamily: bodyFont }]}>HANDPICKED FOR YOU</Text>
          <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>Featured Classics</Text>
          {featuredBooks.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
              {featuredBooks.map((book, i) => (
                <AnimatedCard key={book.id} delay={i * 80}>
                  <PressableCard
                    onPress={() => router.push(`/book/${book.id}` as any)}
                    style={styles.featuredCard}
                  >
                    <View>
                      {book.cover_image ? (
                        <Image source={{ uri: book.cover_image }} style={styles.featuredCover} resizeMode="cover" />
                      ) : (
                        <View style={[styles.featuredCover, styles.featuredCoverPlaceholder]}>
                          <Text style={[styles.featuredCoverTitle, { fontFamily: headingFont }]} numberOfLines={3}>{book.title}</Text>
                          <Text style={[styles.featuredCoverAuthor, { fontFamily: bodyFont }]} numberOfLines={1}>{book.author}</Text>
                        </View>
                      )}
                      <View style={styles.featuredInfo}>
                        <Text style={[styles.featuredTitle, { fontFamily: headingFont }]} numberOfLines={2}>{book.title}</Text>
                        <Text style={[styles.featuredAuthor, { fontFamily: bodyFont }]} numberOfLines={1}>{book.author}</Text>
                        {book.category && (
                          <View style={styles.featuredBadge}>
                            <Text style={[styles.featuredBadgeText, { fontFamily: bodyFont }]}>{book.category}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </PressableCard>
                </AnimatedCard>
              ))}
            </ScrollView>
          ) : (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
          )}
        </View>

        {/* ===== BENEFITS ===== */}
        <View style={styles.benefitsSection}>
          <Text style={[styles.sectionLabel, { fontFamily: bodyFont, color: COLORS.accent }]}>WHY CREATE AN ACCOUNT</Text>
          <Text style={[styles.sectionTitle, { fontFamily: headingFont, color: COLORS.white }]}>Benefits for Readers</Text>
          <View style={styles.benefitsGrid}>
            {benefits.map((b, i) => (
              <AnimatedCard key={i} delay={i * 100} style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={b.icon} size={24} color={COLORS.primary} />
                </View>
                <Text style={[styles.benefitTitle, { fontFamily: headingFont }]}>{b.title}</Text>
                <Text style={[styles.benefitDesc, { fontFamily: bodyFont }]}>{b.desc}</Text>
              </AnimatedCard>
            ))}
          </View>
          {!user && (
            <PressableCard onPress={() => router.push('/welcome' as any)} style={styles.benefitCTA}>
              <View style={styles.ctaInner}>
                <Text style={[styles.benefitCTAText, { fontFamily: bodyFont }]}>Get Started Free</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
              </View>
            </PressableCard>
          )}
        </View>

        {/* ===== PHILOSOPHY ===== */}
        <View style={styles.philosophySection}>
          <Text style={[styles.philosophyQuote, { fontFamily: fontsLoaded ? FONTS.bodyItalic : FONTS.bodyFallback }]}>
            {cmsContent.philosophy_quote}
          </Text>
          <View style={styles.philosophyDivider} />
          <Text style={[styles.philosophyDesc, { fontFamily: bodyFont }]}>
            {cmsContent.philosophy_desc}
          </Text>
          <PressableCard onPress={() => router.push('/about' as any)} style={styles.learnMoreBtn}>
            <View style={styles.ctaInner}>
              <Text style={[styles.learnMoreText, { fontFamily: bodyFont }]}>Learn Our Story</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </View>
          </PressableCard>
        </View>

        {/* ===== FINAL CTA ===== */}
        <View style={styles.finalCTA}>
          <Text style={[styles.finalCTATitle, { fontFamily: headingFont }]}>{cmsContent.cta_title}</Text>
          <Text style={[styles.finalCTADesc, { fontFamily: bodyFont }]}>{cmsContent.cta_desc}</Text>
          <PressableCard onPress={() => router.push('/browse' as any)} style={styles.ctaPrimary}>
            <View style={styles.ctaInner}>
              <Ionicons name="library-outline" size={18} color={COLORS.white} />
              <Text style={[styles.ctaPrimaryText, { fontFamily: bodyFont }]}>Browse Library</Text>
            </View>
          </PressableCard>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  hero: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 64, alignItems: 'center' },
  heroLogo: { width: 100, height: 100, borderRadius: 50, marginBottom: 24, backgroundColor: 'rgba(0,0,0,0.3)' },
  heroTitle: { fontSize: 40, color: COLORS.white, textAlign: 'center', lineHeight: 50, marginBottom: 16 },
  heroSubtitle: { fontSize: 17, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 28, maxWidth: 560, marginBottom: 32 },
  heroCTA: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  ctaPrimary: { backgroundColor: COLORS.accent, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10 },
  ctaInner: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  ctaPrimaryText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  ctaSecondary: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  ctaSecondaryText: { color: COLORS.white, fontSize: 16, fontWeight: '500', textAlign: 'center' },
  statsSection: { paddingVertical: 48, paddingHorizontal: 24, alignItems: 'center', backgroundColor: COLORS.secondary },
  statsLabel: { fontSize: 12, letterSpacing: 3, color: COLORS.gray, marginBottom: 24, textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 24 },
  statCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 28, alignItems: 'center', minWidth: 150 },
  statNumber: { fontSize: 36, color: COLORS.primary, marginTop: 8 },
  statLabel: { fontSize: 15, color: COLORS.gray, marginTop: 4 },
  featuredSection: { paddingVertical: 48, paddingHorizontal: 24, alignItems: 'center' },
  sectionLabel: { fontSize: 12, letterSpacing: 3, color: COLORS.gray, marginBottom: 8, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 30, color: COLORS.text, textAlign: 'center', marginBottom: 24 },
  featuredScroll: { paddingLeft: 8, paddingRight: 24, gap: 16 },
  featuredCard: { width: 200, backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' },
  featuredCover: { width: 200, height: 260 },
  featuredCoverPlaceholder: { backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', padding: 16 },
  featuredCoverTitle: { color: COLORS.white, fontSize: 15, textAlign: 'center' },
  featuredCoverAuthor: { color: COLORS.secondary, fontSize: 12, marginTop: 8, textAlign: 'center' },
  featuredInfo: { padding: 14 },
  featuredTitle: { fontSize: 14, color: COLORS.text, marginBottom: 4 },
  featuredAuthor: { fontSize: 12, color: COLORS.gray, marginBottom: 8 },
  featuredBadge: { backgroundColor: COLORS.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  featuredBadgeText: { fontSize: 11, color: COLORS.primary },
  benefitsSection: { backgroundColor: COLORS.primary, paddingVertical: 56, paddingHorizontal: 24, alignItems: 'center' },
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 8, maxWidth: 900 },
  benefitCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 24, width: 210, alignItems: 'center' },
  benefitIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(90,31,43,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  benefitTitle: { fontSize: 15, color: COLORS.text, marginBottom: 6, textAlign: 'center' },
  benefitDesc: { fontSize: 13, color: COLORS.gray, textAlign: 'center', lineHeight: 20 },
  benefitCTA: { marginTop: 28, backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  benefitCTAText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  philosophySection: { paddingVertical: 56, paddingHorizontal: 32, alignItems: 'center', backgroundColor: COLORS.secondary },
  philosophyQuote: { fontSize: 22, color: COLORS.primary, textAlign: 'center', lineHeight: 34, maxWidth: 600 },
  philosophyDivider: { width: 48, height: 3, backgroundColor: COLORS.accent, borderRadius: 2, marginVertical: 24 },
  philosophyDesc: { fontSize: 16, color: COLORS.gray, textAlign: 'center', lineHeight: 26, maxWidth: 500 },
  learnMoreBtn: { marginTop: 20, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary },
  learnMoreText: { color: COLORS.primary, fontSize: 15, fontWeight: '500' },
  finalCTA: { paddingVertical: 56, paddingHorizontal: 24, alignItems: 'center' },
  finalCTATitle: { fontSize: 30, color: COLORS.text, textAlign: 'center', marginBottom: 12 },
  finalCTADesc: { fontSize: 16, color: COLORS.gray, textAlign: 'center', marginBottom: 24, maxWidth: 400 },
});
