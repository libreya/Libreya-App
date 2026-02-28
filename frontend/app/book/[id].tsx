import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  useWindowDimensions
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { COLORS, THEMES } from '../../constants/theme';
import { useAppStore } from '../../lib/store';
import { AdBanner } from '../../components/AdBanner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { api } from '../../lib/api';
import { MenuItem } from '@/components/MenuItem';
import { AnimatedButton } from '@/components/AnimatedButton';
import WebAppBanner from '@/components/WebAdBanner';

const { width, height } = Dimensions.get('window');

interface Chapter {
  title: string;
  content: string;
}

export default function BookReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];
  const user = useAppStore((s) => s.user);
  const isOffline = useAppStore((s) => s.isOffline);
  const error = useAppStore((s) => s.error);

  const currentBook = useAppStore((s) => s.currentBook);
  const currentActivity = useAppStore((s) => s.currentActivity);
  const fetchBook = useAppStore((s) => s.fetchBook);
  const updateActivity = useAppStore((s) => s.updateActivity);
  const addHighlight = useAppStore((s) => s.addHighlight);
  const chaptersReadSinceAd = useAppStore((s) => s.chaptersReadSinceAd);
  const incrementChapterRead = useAppStore((s) => s.incrementChapterRead);
  const resetChapterCount = useAppStore((s) => s.resetChapterCount);
  const fetchFavorites = useAppStore((s) => s.fetchFavorites);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightButton, setShowHighlightButton] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 768;
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = [
    {
      label: "Home",
      icon: <Ionicons name="home-outline" size={26} color={colors.text} />,
      onPress: () => {
        setMenuVisible(false);
        router.push("/");
      },
    },
    {
      label: "Table of Contents",
      icon: <Ionicons name="list-outline" size={26} color={colors.text} />,
      onPress: () => {
        setMenuVisible(false);
        setShowTOC(true);
      }
    },
    {
      label: isFavorite ? "Remove Favorite" : "Add to Favorite",
      icon: <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={24}
        color={isFavorite ? COLORS.error : colors.text}
      />,
      loading: favoriteLoading,
      onPress: () => {
        setMenuVisible(false);
        handleToggleFavorite();
      }
    },
    {
      label: "Share",
      icon: <Ionicons name="share-outline" size={26} color={colors.text} />,
      onPress: () => {
        setMenuVisible(false);
        handleShare();
      }
    },
    {
      label: "Profile",
      icon: <Ionicons name="person-outline" size={26} color={colors.text} />,
      onPress: () => {
        setMenuVisible(false);
        router.push('/profile');
      }
    }

  ];


  useEffect(() => {
    loadBook();
  }, [id]);

  useEffect(() => {
    setIsFavorite(currentActivity?.is_favorite || false);
  }, [currentActivity]);

  useEffect(() => {
    if (Platform.OS === "web") {
      setShowHint(true);

      const timer = setTimeout(() => {
        setShowHint(false);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const loadBook = async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);

    try {
      const book = await fetchBook(parseInt(id));
      if (book?.content_body) {
        parseChapters(book.content_body);
      } else {
        setLoadError('Book content not available');
      }
    } catch (e) {
      setLoadError('Failed to load book. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const parseChapters = (content: string) => {
    const chapterRegex = /<h2>([^<]+)<\/h2>/gi;
    const matches = content.split(chapterRegex);

    const parsedChapters: Chapter[] = [];

    if (matches.length <= 1) {
      parsedChapters.push({
        title: currentBook?.title || 'Book',
        content: stripHtml(content),
      });
    } else {
      if (matches[0].trim()) {
        parsedChapters.push({
          title: 'Table of Contents',
          content: stripHtml(matches[0]),
        });
      }

      for (let i = 1; i < matches.length; i += 2) {
        const title = matches[i]?.trim() || `Chapter ${Math.ceil(i / 2)}`;
        const chapterContent = matches[i + 1] || '';
        parsedChapters.push({
          title,
          content: stripHtml(chapterContent),
        });
      }
    }

    setChapters(parsedChapters);

    if (currentActivity?.last_position) {
      const chapterIndex = Math.floor(currentActivity.last_position * parsedChapters.length);
      setCurrentChapter(Math.min(chapterIndex, parsedChapters.length - 1));
    }
  };

  const stripHtml = (html: string) => {
    return html
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  };

  const goToChapter = (index: number) => {
    if (index < 0 || index >= chapters.length) return;

    if (index > currentChapter) {
      incrementChapterRead();
      if ((chaptersReadSinceAd + 1) >= 3) {
        setShowInterstitial(true);
        resetChapterCount();
        setTimeout(() => setShowInterstitial(false), 2000);
      }
    }

    setCurrentChapter(index);
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    const progress = index / chapters.length;
    updateActivity({
      last_position: progress,
      chapter_read_count: (currentActivity?.chapter_read_count || 0) + 1
    });
  };

  const handleToggleFavorite = async () => {
    if (!user || !currentBook) return;

    setFavoriteLoading(true);
    const newFavoriteStatus = !isFavorite;

    try {
      setIsFavorite(newFavoriteStatus);

      const activity = {
        user_id: user.id,
        book_id: currentBook.id,
        last_position: currentActivity?.last_position || 0,
        is_favorite: newFavoriteStatus,
        highlights: currentActivity?.highlights || [],
        chapter_read_count: currentActivity?.chapter_read_count || 0,
      };

      await api.post('/activity', activity);
      await fetchFavorites();

      Alert.alert(
        newFavoriteStatus ? 'Added to Favorites' : 'Removed from Favorites',
        `"${currentBook.title}" has been ${newFavoriteStatus ? 'added to' : 'removed from'} your favorites.`
      );
    } catch (e) {
      setIsFavorite(!newFavoriteStatus);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    if (!currentBook) return;

    const shareData = {
      title: currentBook.title,
      text: `I'm reading "${currentBook.title}" by ${currentBook.author} on Libreya!`,
      url: Platform.OS === 'web' ? window.location.href : `https://libreya.app/book/${currentBook.id}`,
    };

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        const result = await Share.share({
          message: shareData.text + ' ' + shareData.url,
          title: shareData.title,
        });
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        if (Platform.OS === 'web') {
          try {
            await navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
            Alert.alert('Copied!', 'Share link copied to clipboard.');
          } catch {
            Alert.alert('Share', shareData.text);
          }
        }
      }
    }
  };

  const progress = chapters.length > 0 ? ((currentChapter + 1) / chapters.length) * 100 : 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading book...</Text>
      </View>
    );
  }

  if (loadError || !currentBook || chapters.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: true, title: 'Error', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
        <ErrorMessage
          message={loadError || 'Book not found'}
          onRetry={loadBook}
          type={isOffline ? 'offline' : 'error'}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: currentBook.title,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerRight: () => (
            isSmallDevice ? (
              // 🍔 Burger Menu (Small Devices)
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="menu-outline" size={26} color={colors.text} />
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.headerButtons,
                  { flexDirection: isSmallDevice ? 'column' : 'row' },
                ]}
              >
                {menuItems.map((item, index) => (
                  <AnimatedButton
                    key={index}
                    onPress={item.onPress}
                    label=""
                    color="inherit"
                    buttonStyle={ {paddingLeft: 0, paddingRight: 0}}
                    icon={item.icon}
                    loading={item.loading}
                  />
                ))}
              </View>)
          ),
        }}
      />

      {/* Menu items on small devices */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: "#fff" }]}>
            <FlatList
              data={menuItems}
              keyExtractor={(_, index) => `item-${index}`}
              renderItem={({ item, index }) => (
                <MenuItem label={item.label} onPress={(item.onPress)} />
              )}
              contentContainerStyle={styles.tocList}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: COLORS.primary }]} />
      </View>

      <View style={[styles.chapterHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.chapterTitle, { color: colors.text }]} numberOfLines={1}>
          {chapters[currentChapter]?.title}
        </Text>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {currentChapter + 1} of {chapters.length} ({Math.round(progress)}%)
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.content}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={true}
      >
        <Text
          style={[styles.bookText, { color: colors.text, fontSize, alignSelf: "center" }]}
          selectable
        >
          {chapters[currentChapter]?.content}
        </Text>

        <View style={styles.chapterEndAd}>
          {Platform.OS === "web" && <WebAppBanner/>}
        </View>

        <View style={styles.chapterNavButtons}>
          <TouchableOpacity
            onPress={() => goToChapter(currentChapter - 1)}
            disabled={currentChapter === 0}
            style={[
              styles.chapterNavBtn,
              { backgroundColor: currentChapter === 0 ? colors.border : COLORS.primary }
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={currentChapter === 0 ? colors.textSecondary : COLORS.white} />
            <Text style={{ color: currentChapter === 0 ? colors.textSecondary : COLORS.white, fontWeight: '600' }}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => goToChapter(currentChapter + 1)}
            disabled={currentChapter === chapters.length - 1}
            style={[
              styles.chapterNavBtn,
              { backgroundColor: currentChapter === chapters.length - 1 ? colors.border : COLORS.primary }
            ]}
          >
            <Text style={{ color: currentChapter === chapters.length - 1 ? colors.textSecondary : COLORS.white, fontWeight: '600' }}>
              Next
            </Text>
            <Ionicons name="chevron-forward" size={20} color={currentChapter === chapters.length - 1 ? colors.textSecondary : COLORS.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showControls && (
        <View style={[styles.controls, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.fontControls}>
            <TouchableOpacity
              onPress={() => setFontSize(Math.max(14, fontSize - 2))}
              style={styles.controlBtn}
            >
              <Ionicons name="text" size={16} color={colors.text} />
              <Text style={{ color: colors.text }}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.fontSizeText, { color: colors.text }]}>{fontSize}px</Text>
            <TouchableOpacity
              onPress={() => setFontSize(Math.min(28, fontSize + 2))}
              style={styles.controlBtn}
            >
              <Ionicons name="text" size={20} color={colors.text} />
              <Text style={{ color: colors.text }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showInterstitial && (
        <View style={styles.interstitialOverlay}>
          <View style={styles.interstitialContent}>
            <Text style={styles.interstitialText}>Advertisement</Text>
            <Text style={styles.interstitialSubtext}>Interstitial ad (every 3 chapters)</Text>
            <TouchableOpacity
              style={styles.closeAdBtn}
              onPress={() => setShowInterstitial(false)}
            >
              <Text style={styles.closeAdText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Table of Contents Modal */}
      <Modal
        visible={showTOC}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTOC(false)}
      >
        <View style={styles.tocOverlay}>
          <View style={[styles.tocModal, { backgroundColor: colors.background }]}>
            <View style={[styles.tocHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.tocTitle, { color: colors.text }]}>Table of Contents</Text>
              <TouchableOpacity onPress={() => setShowTOC(false)} style={styles.tocClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={chapters}
              keyExtractor={(_, index) => `chapter-${index}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.tocItem,
                    index === currentChapter && { backgroundColor: `${COLORS.primary}20` },
                  ]}
                  onPress={() => {
                    goToChapter(index);
                    setShowTOC(false);
                  }}
                >
                  <Text style={[styles.tocChapterNum, { color: COLORS.primary }]}>
                    {index + 1}
                  </Text>
                  <Text
                    style={[
                      styles.tocChapterTitle,
                      { color: colors.text },
                      index === currentChapter && { fontWeight: '600' },
                    ]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  {index === currentChapter && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.tocList}
            />
          </View>
        </View>
      </Modal>

      {/* Highlight button for web */}
      {Platform.OS === 'web' && showHint && (
        <View style={styles.highlightInstructions}>
          <Text style={[styles.highlightHint, { color: colors.textSecondary }]}>
            💡 Select text and right-click to copy.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  progressContainer: {
    height: 3,
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  chapterHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  progressText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  bookText: {
    lineHeight: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  chapterEndAd: {
    marginTop: 32,
    marginBottom: 16,
  },
  chapterNavButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  chapterNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  controls: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  fontControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  fontSizeText: {
    fontSize: 14,
  },
  interstitialOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interstitialContent: {
    backgroundColor: '#333',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  interstitialText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '600',
  },
  interstitialSubtext: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 8,
  },
  closeAdBtn: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  closeAdText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  // TOC Modal styles
  tocOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  tocModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  tocHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  tocTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  tocClose: {
    padding: 8,
  },
  tocList: {
    padding: 8,
  },
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  tocChapterNum: {
    fontSize: 16,
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
  },
  tocChapterTitle: {
    flex: 1,
    fontSize: 16,
  },
  // Highlight hint
  highlightInstructions: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  highlightHint: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 10,
  },
  menuContainer: {
    width: 220,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 6,
  },
});
