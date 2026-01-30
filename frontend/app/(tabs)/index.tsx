import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, THEMES } from '../../constants/theme';
import { useAppStore, Book } from '../../lib/store';
import { BookCard } from '../../components/BookCard';
import { AdBanner } from '../../components/AdBanner';

const { width } = Dimensions.get('window');

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];
  
  const books = useAppStore((s) => s.books);
  const featuredBooks = useAppStore((s) => s.featuredBooks);
  const recommendedBooks = useAppStore((s) => s.recommendedBooks);
  const fetchBooks = useAppStore((s) => s.fetchBooks);
  const fetchFeaturedBooks = useAppStore((s) => s.fetchFeaturedBooks);
  const fetchRecommendedBooks = useAppStore((s) => s.fetchRecommendedBooks);
  
  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = async () => {
    await Promise.all([
      fetchBooks(),
      fetchFeaturedBooks(),
      fetchRecommendedBooks(),
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBookPress = (book: Book) => {
    router.push(`/book/${book.id}`);
  };

  const renderHeroSection = () => (
    <View style={styles.heroContainer}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800' }}
        style={styles.heroImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(90,31,43,0.9)', COLORS.primary]}
        style={styles.heroGradient}
      >
        <Image
          source={{ uri: 'https://customer-assets.emergentagent.com/job_bc7b9e4f-7678-4b25-b887-2287e22fd313/artifacts/vl9x3m91_Logo1.jpg' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heroTitle}>Welcome to Libreya</Text>
        <Text style={styles.heroSubtitle}>Your Gateway to Classic Literature</Text>
      </LinearGradient>
    </View>
  );

  const renderSection = (title: string, data: Book[], horizontal = true) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {horizontal ? (
        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <BookCard book={item} onPress={() => handleBookPress(item)} compact />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      ) : (
        <View style={styles.gridList}>
          {data.slice(0, 6).map((item) => (
            <BookCard key={item.id} book={item} onPress={() => handleBookPress(item)} />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {renderHeroSection()}
        
        {featuredBooks.length > 0 && renderSection('Featured Books', featuredBooks)}
        
        <AdBanner />
        
        {recommendedBooks.length > 0 && renderSection('Recommended For You', recommendedBooks)}
        
        {books.length > 0 && renderSection('All Books', books, false)}
        
        {/* Bottom Ad Banner */}
        <View style={styles.bottomAdContainer}>
          <AdBanner />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  gridList: {
    paddingHorizontal: 16,
  },
  bottomAdContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
});
