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
        
        // Try to save to server but don't block on failure
        api.post('/users', guestUser).catch(() => {
          console.log('Could not save guest to server - database may not be set up');
        });
        
        await AsyncStorage.setItem('user', JSON.stringify(guestUser));
        set({ user: guestUser });
      }

      // Load settings
      await get().fetchSettings();
    } catch (error) {
      console.error('Error initializing app:', error);
      // Create a default guest user even if there's an error
      const guestUser: User = {
        id: Crypto.randomUUID(),
        auth_provider: 'guest',
        is_admin: false,
        terms_accepted: false,
      };
      await AsyncStorage.setItem('user', JSON.stringify(guestUser));
      set({ user: guestUser });
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
    // Default settings fallback
    const defaultSettings: AppSettings = {
      terms_and_conditions: `
<h2>Terms and Conditions</h2>
<p><strong>Last Updated: February 2026</strong></p>
<h3>1. License</h3>
<p>Libreya grants you a personal, non-exclusive license to use this software for reading public-domain literature.</p>
<h3>2. Content</h3>
<p>Books are sourced from Project Gutenberg and Standard Ebooks. While the texts are public domain, the Libreya app design, code, and brand are the intellectual property of Libreya.</p>
<h3>3. Prohibited Use</h3>
<p>You may not scrape, reverse-engineer, or attempt to bypass the authentication systems of Libreya.</p>
<h3>4. Ad-Supported Service</h3>
<p>You acknowledge that Libreya is supported by advertisements. Tampering with ad delivery is a violation of these terms.</p>
<h3>5. Limitation of Liability</h3>
<p>Libreya is provided "as-is." We are not liable for any data loss or inaccuracies in the literary texts provided.</p>
`,
      privacy_notice: `
<h2>Privacy Notice for Libreya</h2>
<p><strong>Last Updated: February 2026</strong></p>
<h3>1. Identity and Contact Details</h3>
<p>Libreya is the "Data Controller" for your information.</p>
<p>Company Name: libreya.app</p>
<p>Contact/DPO Email: hello@libreya.app</p>
<h3>2. Information We Collect</h3>
<p>We collect information only to provide and improve your reading experience:</p>
<ul>
<li><strong>Account Data:</strong> Email address, display name, and profile image (for registered users).</li>
<li><strong>Activity Data:</strong> Reading progress, favorite books, and highlights.</li>
<li><strong>Device Data:</strong> IP address and device identifiers (used for security and ad delivery).</li>
</ul>
<h3>3. Your Rights</h3>
<p>You can delete your account and all associated data immediately via the "Delete Account" button in Settings.</p>
`,
      legal_notice: `
<h2>Legal Notice</h2>
<h3>Royalty-Free Content Notice</h3>
<p>Works sourced via Standard Ebooks and Project Gutenberg. No copyright claimed on original texts.</p>
<h3>Contact</h3>
<p>For any legal inquiries, please contact: hello@libreya.app</p>
`,
    };

    try {
      const settingsArray = await api.get('/settings');
      const settings: AppSettings = { ...defaultSettings };
      if (Array.isArray(settingsArray)) {
        settingsArray.forEach((s: { key: string; value: string }) => {
          if (s.key in settings) {
            (settings as any)[s.key] = s.value;
          }
        });
      }
      set({ settings });
    } catch (error) {
      console.log('Using default settings');
      set({ settings: defaultSettings });
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
