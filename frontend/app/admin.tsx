import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEMES } from '../constants/theme';
import { useAppStore, Book } from '../lib/store';
import { api } from '../lib/api';
import { Button } from '../components/Button';

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];
  const user = useAppStore((s) => s.user);
  const settings = useAppStore((s) => s.settings);
  const fetchSettings = useAppStore((s) => s.fetchSettings);

  const [activeTab, setActiveTab] = useState<'books' | 'settings'>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);

  // Settings state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [settingsContent, setSettingsContent] = useState('');

  // Book form state
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    is_featured: false,
  });

  // Check if user is admin
  useEffect(() => {
    if (user && !user.is_admin) {
      Alert.alert('Access Denied', 'You do not have admin privileges');
      router.back();
    }
  }, [user]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await api.get('/books?limit=200');
      setBooks(data);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
      fetchSettings();
    }, [])
  );

  const handleToggleFeatured = async (book: Book) => {
    try {
      await api.patch(`/admin/books/${book.id}`, { is_featured: !book.is_featured });
      loadBooks();
    } catch (error) {
      Alert.alert('Error', 'Failed to update book');
    }
  };

  const handleDeleteBook = (book: Book) => {
    Alert.alert('Delete Book', `Are you sure you want to delete "${book.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/books/${book.id}`);
            loadBooks();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete book');
          }
        },
      },
    ]);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      category: book.category || '',
      description: book.description || '',
      is_featured: book.is_featured,
    });
    setShowBookModal(true);
  };

  const handleSaveBook = async () => {
    if (!bookForm.title || !bookForm.author) {
      Alert.alert('Error', 'Title and author are required');
      return;
    }

    try {
      if (editingBook) {
        await api.patch(`/admin/books/${editingBook.id}`, bookForm);
      } else {
        await api.post('/admin/books', bookForm);
      }
      setShowBookModal(false);
      setEditingBook(null);
      setBookForm({ title: '', author: '', category: '', description: '', is_featured: false });
      loadBooks();
    } catch (error) {
      Alert.alert('Error', 'Failed to save book');
    }
  };

  const handleEditSetting = (key: string) => {
    setEditingKey(key);
    switch (key) {
      case 'terms':
        setSettingsContent(settings?.terms_and_conditions || '');
        break;
      case 'privacy':
        setSettingsContent(settings?.privacy_notice || '');
        break;
      case 'legal':
        setSettingsContent(settings?.legal_notice || '');
        break;
    }
  };

  const handleSaveSetting = async () => {
    if (!editingKey) return;
    try {
      const keyMap: Record<string, string> = {
        terms: 'terms_and_conditions',
        privacy: 'privacy_notice',
        legal: 'legal_notice',
      };
      await api.post('/admin/settings', {
        key: keyMap[editingKey],
        value: settingsContent,
      });
      fetchSettings();
      setEditingKey(null);
      Alert.alert('Success', 'Settings saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  if (!user?.is_admin) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Access Denied</Text>
      </View>
    );
  }

  const renderBookItem = ({ item }: { item: Book }) => (
    <View style={[styles.bookItem, { backgroundColor: colors.surface }]}>
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.author}
        </Text>
        <View style={styles.bookMeta}>
          {item.is_featured && (
            <View style={[styles.badge, { backgroundColor: COLORS.accent }]}>
              <Text style={styles.badgeText}>Featured</Text>
            </View>
          )}
          {item.category && (
            <Text style={[styles.category, { color: colors.textSecondary }]}>{item.category}</Text>
          )}
        </View>
      </View>
      <View style={styles.bookActions}>
        <TouchableOpacity onPress={() => handleToggleFeatured(item)}>
          <Ionicons
            name={item.is_featured ? 'star' : 'star-outline'}
            size={24}
            color={item.is_featured ? COLORS.accent : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditBook(item)}>
          <Ionicons name="pencil-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteBook(item)}>
          <Ionicons name="trash-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Admin Dashboard',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'books' && styles.activeTab]}
          onPress={() => setActiveTab('books')}
        >
          <Ionicons
            name="book-outline"
            size={20}
            color={activeTab === 'books' ? COLORS.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'books' ? COLORS.primary : colors.textSecondary },
            ]}
          >
            Books
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color={activeTab === 'settings' ? COLORS.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'settings' ? COLORS.primary : colors.textSecondary },
            ]}
          >
            Legal Settings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'books' ? (
        <>
          <View style={styles.header}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Books ({books.length})
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: COLORS.primary }]}
              onPress={() => {
                setEditingBook(null);
                setBookForm({ title: '', author: '', category: '', description: '', is_featured: false });
                setShowBookModal(true);
              }}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Book</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={books}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBookItem}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={loadBooks}
          />
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.settingsContent}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal Documents</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Edit the legal texts displayed to users
          </Text>

          {editingKey ? (
            <View style={styles.editingContainer}>
              <Text style={[styles.editingTitle, { color: colors.text }]}>
                Editing: {editingKey === 'terms' ? 'Terms & Conditions' : editingKey === 'privacy' ? 'Privacy Notice' : 'Legal Notice'}
              </Text>
              <TextInput
                style={[
                  styles.textarea,
                  { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                ]}
                multiline
                value={settingsContent}
                onChangeText={setSettingsContent}
                placeholder="Enter HTML content..."
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.editButtons}>
                <Button title="Cancel" variant="outline" onPress={() => setEditingKey(null)} />
                <Button title="Save" onPress={handleSaveSetting} />
              </View>
            </View>
          ) : (
            <View style={styles.settingsCards}>
              <TouchableOpacity
                style={[styles.settingCard, { backgroundColor: colors.surface }]}
                onPress={() => handleEditSetting('terms')}
              >
                <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
                <Text style={[styles.settingCardTitle, { color: colors.text }]}>Terms & Conditions</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingCard, { backgroundColor: colors.surface }]}
                onPress={() => handleEditSetting('privacy')}
              >
                <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.primary} />
                <Text style={[styles.settingCardTitle, { color: colors.text }]}>Privacy Notice</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingCard, { backgroundColor: colors.surface }]}
                onPress={() => handleEditSetting('legal')}
              >
                <Ionicons name="information-circle-outline" size={32} color={COLORS.primary} />
                <Text style={[styles.settingCardTitle, { color: colors.text }]}>Legal Notice</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Book Edit Modal */}
      <Modal visible={showBookModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingBook ? 'Edit Book' : 'Add Book'}
              </Text>
              <TouchableOpacity onPress={() => setShowBookModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={bookForm.title}
                onChangeText={(text) => setBookForm({ ...bookForm, title: text })}
                placeholder="Book title"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Author *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={bookForm.author}
                onChangeText={(text) => setBookForm({ ...bookForm, author: text })}
                placeholder="Author name"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Category</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={bookForm.category}
                onChangeText={(text) => setBookForm({ ...bookForm, category: text })}
                placeholder="Category"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.descInput,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={bookForm.description}
                onChangeText={(text) => setBookForm({ ...bookForm, description: text })}
                placeholder="Book description"
                placeholderTextColor={colors.textSecondary}
                multiline
              />

              <TouchableOpacity
                style={styles.featuredToggle}
                onPress={() => setBookForm({ ...bookForm, is_featured: !bookForm.is_featured })}
              >
                <Ionicons
                  name={bookForm.is_featured ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={[styles.featuredText, { color: colors.text }]}>Featured Book</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title="Cancel" variant="outline" onPress={() => setShowBookModal(false)} />
              <Button title="Save" onPress={handleSaveBook} />
            </View>
          </View>
        </View>
      </Modal>
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
  tabs: {
    flexDirection: 'row',
    padding: 8,
    margin: 16,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(90,31,43,0.1)',
  },
  tabText: {
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  bookItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bookAuthor: {
    fontSize: 14,
    marginTop: 2,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  category: {
    fontSize: 12,
  },
  bookActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsContent: {
    padding: 16,
  },
  settingsCards: {
    gap: 12,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  settingCardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  editingContainer: {
    flex: 1,
  },
  editingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 300,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  descInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  featuredToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  featuredText: {
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});
