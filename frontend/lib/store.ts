import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import * as Crypto from 'expo-crypto';

export interface User {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  auth_provider: 'guest' | 'email' | 'google' | 'apple';
  is_admin: boolean;
  terms_accepted: boolean;
  terms_accepted_at?: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  content_body?: string;
  category?: string;
  cover_image?: string;
  is_featured: boolean;
  read_count: number;
  description?: string;
}

export interface UserActivity {
  id?: number;
  user_id: string;
  book_id: number;
  last_position: number;
  is_favorite: boolean;
  highlights: Array<{ text: string; position: number; chapter?: number }>;
  chapter_read_count: number;
}

export interface AppSettings {
  terms_and_conditions: string;
  privacy_notice: string;
  legal_notice: string;
}

type Theme = 'light' | 'sepia' | 'dark' | 'night';

interface AppState {
  user: User | null;
  isLoading: boolean;
  theme: Theme;
  books: Book[];
  featuredBooks: Book[];
  recommendedBooks: Book[];
  currentBook: Book | null;
  currentActivity: UserActivity | null;
  favorites: Book[];
  settings: AppSettings | null;
  chaptersReadSinceAd: number;

  // Actions
  initializeApp: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTheme: (theme: Theme) => void;
  fetchBooks: (params?: { category?: string; search?: string }) => Promise<void>;
  fetchFeaturedBooks: () => Promise<void>;
  fetchRecommendedBooks: () => Promise<void>;
  fetchBook: (bookId: number) => Promise<Book | null>;
  fetchFavorites: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateActivity: (activity: Partial<UserActivity>) => Promise<void>;
  toggleFavorite: (bookId: number) => Promise<void>;
  addHighlight: (text: string, position: number, chapter?: number) => Promise<void>;
  acceptTerms: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  incrementChapterRead: () => void;
  resetChapterCount: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isLoading: true,
  theme: 'light',
  books: [],
  featuredBooks: [],
  recommendedBooks: [],
  currentBook: null,
  currentActivity: null,
  favorites: [],
  settings: null,
  chaptersReadSinceAd: 0,

  initializeApp: async () => {
    try {
      // Load saved theme
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        set({ theme: savedTheme as Theme });
      }

      // Check for existing user
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        set({ user });
      } else {
        // Create guest user
        const guestUuid = Crypto.randomUUID();
        const guestUser: User = {
          id: guestUuid,
          auth_provider: 'guest',
          is_admin: false,
          terms_accepted: false,
        };
        
        try {
          await api.post('/users', guestUser);
        } catch (e) {
          console.log('Could not save guest to server');
        }
        
        await AsyncStorage.setItem('user', JSON.stringify(guestUser));
        set({ user: guestUser });
      }

      // Load settings
      await get().fetchSettings();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => {
    set({ user });
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      AsyncStorage.removeItem('user');
    }
  },

  setTheme: async (theme) => {
    set({ theme });
    await AsyncStorage.setItem('theme', theme);
  },

  fetchBooks: async (params) => {
    try {
      let endpoint = '/books?limit=100';
      if (params?.category) endpoint += `&category=${params.category}`;
      if (params?.search) endpoint += `&search=${params.search}`;
      const books = await api.get(endpoint);
      set({ books });
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  },

  fetchFeaturedBooks: async () => {
    try {
      const featuredBooks = await api.get('/books/featured?limit=10');
      set({ featuredBooks });
    } catch (error) {
      console.error('Error fetching featured books:', error);
    }
  },

  fetchRecommendedBooks: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const recommendedBooks = await api.get(`/books/recommended/${user.id}?limit=10`);
      set({ recommendedBooks });
    } catch (error) {
      console.error('Error fetching recommended books:', error);
    }
  },

  fetchBook: async (bookId) => {
    try {
      const book = await api.get(`/books/${bookId}`);
      set({ currentBook: book });

      // Load activity
      const { user } = get();
      if (user) {
        try {
          const activity = await api.get(`/activity/${user.id}/${bookId}`);
          set({ currentActivity: activity });
        } catch {
          set({ currentActivity: null });
        }
      }

      return book;
    } catch (error) {
      console.error('Error fetching book:', error);
      return null;
    }
  },

  fetchFavorites: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const favorites = await api.get(`/favorites/${user.id}`);
      set({ favorites });
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  },

  fetchSettings: async () => {
    try {
      const settingsArray = await api.get('/settings');
      const settings: AppSettings = {
        terms_and_conditions: '',
        privacy_notice: '',
        legal_notice: '',
      };
      settingsArray.forEach((s: { key: string; value: string }) => {
        if (s.key in settings) {
          (settings as any)[s.key] = s.value;
        }
      });
      set({ settings });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  },

  updateActivity: async (activityUpdate) => {
    const { user, currentBook, currentActivity } = get();
    if (!user || !currentBook) return;

    const activity: UserActivity = {
      user_id: user.id,
      book_id: currentBook.id,
      last_position: activityUpdate.last_position ?? currentActivity?.last_position ?? 0,
      is_favorite: activityUpdate.is_favorite ?? currentActivity?.is_favorite ?? false,
      highlights: activityUpdate.highlights ?? currentActivity?.highlights ?? [],
      chapter_read_count: activityUpdate.chapter_read_count ?? currentActivity?.chapter_read_count ?? 0,
    };

    try {
      await api.post('/activity', activity);
      set({ currentActivity: activity });
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  },

  toggleFavorite: async (bookId) => {
    const { user, currentActivity } = get();
    if (!user) return;

    const newFavorite = !currentActivity?.is_favorite;
    
    await get().updateActivity({ is_favorite: newFavorite });
    await get().fetchFavorites();
  },

  addHighlight: async (text, position, chapter) => {
    const { currentActivity } = get();
    const highlights = [...(currentActivity?.highlights || []), { text, position, chapter }];
    await get().updateActivity({ highlights });
  },

  acceptTerms: async () => {
    const { user } = get();
    if (!user) return;

    try {
      await api.post('/users/accept-terms', { user_id: user.id, accepted: true });
      const updatedUser = { ...user, terms_accepted: true, terms_accepted_at: new Date().toISOString() };
      set({ user: updatedUser });
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error accepting terms:', error);
    }
  },

  deleteAccount: async () => {
    const { user } = get();
    if (!user) return;

    try {
      await api.delete(`/users/${user.id}`);
      await AsyncStorage.removeItem('user');
      set({ user: null, favorites: [], currentActivity: null });
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  incrementChapterRead: () => {
    set((state) => ({ chaptersReadSinceAd: state.chaptersReadSinceAd + 1 }));
  },

  resetChapterCount: () => {
    set({ chaptersReadSinceAd: 0 });
  },
}));
