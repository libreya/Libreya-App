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
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, THEMES } from '../constants/theme';
import { useAppStore, Book } from '../lib/store';
import { api } from '../lib/api';
import { Footer } from '../components/Footer';

type AdminTab = 'books' | 'cms' | 'users' | 'legal';

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];
  const user = useAppStore((s) => s.user);
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const fetchSettings = useAppStore((s) => s.fetchSettings);
  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;
  const isMobile = width < 768;

  const [activeTab, setActiveTab] = useState<AdminTab>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Book form state
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    content_body: '',
    cover_image: '',
    source_url: '',
    is_featured: false,
  });

  // Editorial content for book (stored in app_settings)
  const [bookEditorial, setBookEditorial] = useState({
    expert_review: '',
    summary: '',
    commentary: '',
  });

  // CMS fields
  const [cmsFields, setCmsFields] = useState({
    landing_hero_title: 'Classic Literature,\nReimagined',
    landing_hero_subtitle: "Discover over 300 timeless masterpieces from the world's greatest authors. Beautifully formatted, completely free, forever.",
    landing_philosophy_quote: '"Libreya is not built for endless scrolling; it is built for intentional reading."',
    landing_philosophy_desc: 'We curate timeless literature with minimalist design, creating a calm reading space in a world of digital noise.',
    landing_cta_title: 'Begin Your Journey',
    landing_cta_desc: "Join thousands of readers discovering the world's greatest literature.",
    site_logo_url: '',
  });

  // Legal settings
  const [legalEditing, setLegalEditing] = useState<string | null>(null);
  const [legalContent, setLegalContent] = useState('');

  useEffect(() => {
    if (user && !user.is_admin) {
      if (Platform.OS === 'web') {
        alert('Access Denied: You do not have admin privileges');
      } else {
        Alert.alert('Access Denied', 'You do not have admin privileges');
      }
      router.back();
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
      loadUsers();
      loadCmsSettings();
    }, [])
  );

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await api.get('/books?limit=300');
      if (Array.isArray(data)) setBooks(data);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.get('/admin/users');
      if (Array.isArray(data)) setUsers(data);
    } catch (e) {
      // silent
    }
  };

  const loadCmsSettings = async () => {
    try {
      const settings = await api.get('/settings');
      if (Array.isArray(settings)) {
        const mapped: Record<string, string> = {};
        settings.forEach((s: any) => { if (s.key && s.value) mapped[s.key] = s.value; });
        setCmsFields(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.keys(prev).filter(k => mapped[k]).map(k => [k, mapped[k]])
          ),
        }));
      }
    } catch (e) {
      // Use defaults
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ===== BOOK HANDLERS =====
  const openAddBook = () => {
    setEditingBook(null);
    setBookForm({ title: '', author: '', category: '', description: '', content_body: '', cover_image: '', source_url: '', is_featured: false });
    setBookEditorial({ expert_review: '', summary: '', commentary: '' });
    setShowBookModal(true);
  };

  const openEditBook = async (book: Book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      category: book.category || '',
      description: book.description || '',
      content_body: '',
      cover_image: book.cover_image || '',
      source_url: book.source_url || '',
      is_featured: book.is_featured,
    });
    // Load editorial content from settings
    try {
      const [review, summary, commentary] = await Promise.all([
        api.get(`/settings/book_${book.id}_expert_review`).catch(() => null),
        api.get(`/settings/book_${book.id}_summary`).catch(() => null),
        api.get(`/settings/book_${book.id}_commentary`).catch(() => null),
      ]);
      setBookEditorial({
        expert_review: review?.value || '',
        summary: summary?.value || '',
        commentary: commentary?.value || '',
      });
    } catch (e) {
      setBookEditorial({ expert_review: '', summary: '', commentary: '' });
    }
    setShowBookModal(true);
  };

  const saveBook = async () => {
    if (!bookForm.title || !bookForm.author) {
      Alert.alert('Error', 'Title and Author are required');
      return;
    }
    setSaving(true);
    try {
      let bookId = editingBook?.id;
      const payload: any = { ...bookForm };
      if (!payload.content_body) delete payload.content_body;

      if (editingBook) {
        await api.patch(`/admin/books/${editingBook.id}`, payload);
      } else {
        const result = await api.post('/admin/books', payload);
        bookId = result?.id;
      }

      // Save editorial content
      if (bookId) {
        const editorialSettings = [];
        if (bookEditorial.expert_review) editorialSettings.push({ key: `book_${bookId}_expert_review`, value: bookEditorial.expert_review });
        if (bookEditorial.summary) editorialSettings.push({ key: `book_${bookId}_summary`, value: bookEditorial.summary });
        if (bookEditorial.commentary) editorialSettings.push({ key: `book_${bookId}_commentary`, value: bookEditorial.commentary });
        if (editorialSettings.length > 0) {
          await api.post('/admin/settings/batch', editorialSettings);
        }
      }

      setShowBookModal(false);
      showSuccess(editingBook ? 'Book updated!' : 'Book created!');
      loadBooks();
    } catch (e) {
      Alert.alert('Error', 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  const deleteBook = (book: Book) => {
    const doDelete = async () => {
      try {
        await api.delete(`/admin/books/${book.id}`);
        showSuccess('Book deleted');
        loadBooks();
      } catch (e) {
        Alert.alert('Error', 'Failed to delete');
      }
    };
    if (Platform.OS === 'web') {
      if (confirm(`Delete "${book.title}"?`)) doDelete();
    } else {
      Alert.alert('Delete Book', `Delete "${book.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const toggleFeatured = async (book: Book) => {
    try {
      await api.patch(`/admin/books/${book.id}`, { is_featured: !book.is_featured });
      loadBooks();
    } catch (e) { /* silent */ }
  };

  // ===== CMS HANDLERS =====
  const saveCmsFields = async () => {
    setSaving(true);
    try {
      const settings = Object.entries(cmsFields)
        .filter(([, v]) => v)
        .map(([key, value]) => ({ key, value }));
      await api.post('/admin/settings/batch', settings);
      showSuccess('Landing page content saved!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save CMS content');
    } finally {
      setSaving(false);
    }
  };

  // ===== USER HANDLERS =====
  const toggleAdmin = async (userId: string, email: string) => {
    const doToggle = async () => {
      try {
        await api.patch(`/admin/users/${userId}/toggle-admin`, {});
        showSuccess(`Admin status toggled for ${email}`);
        loadUsers();
      } catch (e) {
        Alert.alert('Error', 'Failed to update admin status');
      }
    };
    if (Platform.OS === 'web') {
      if (confirm(`Toggle admin for ${email}?`)) doToggle();
    } else {
      Alert.alert('Toggle Admin', `Toggle admin for ${email}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: doToggle },
      ]);
    }
  };

  // ===== LEGAL HANDLERS =====
  const openLegalEditor = async (key: string) => {
    setLegalEditing(key);
    try {
      const setting = await api.get(`/settings/${key}`);
      setLegalContent(setting?.value || '');
    } catch (e) {
      setLegalContent('');
    }
  };

  const saveLegal = async () => {
    if (!legalEditing) return;
    setSaving(true);
    try {
      await api.post('/admin/settings', { key: legalEditing, value: legalContent });
      showSuccess('Legal document saved!');
      setLegalEditing(null);
      fetchSettings();
    } catch (e) {
      Alert.alert('Error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!user?.is_admin) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="lock-closed" size={48} color={COLORS.gray} />
        <Text style={[styles.accessDenied, { fontFamily: headingFont }]}>Access Denied</Text>
        <Text style={[styles.accessDeniedSub, { fontFamily: bodyFont }]}>Admin privileges required</Text>
      </View>
    );
  }

  const filteredBooks = searchQuery
    ? books.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : books;

  const tabs: { key: AdminTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'books', label: 'Books', icon: 'library-outline' },
    { key: 'cms', label: 'Site CMS', icon: 'create-outline' },
    { key: 'users', label: 'Users', icon: 'people-outline' },
    { key: 'legal', label: 'Legal', icon: 'document-text-outline' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Success Toast */}
      {successMsg ? (
        <View style={styles.successToast}>
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={[styles.successText, { fontFamily: bodyFont }]}>{successMsg}</Text>
        </View>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.adminHeader}>
          <Text style={[styles.adminTitle, { fontFamily: headingFont }]}>Admin Dashboard</Text>
          <Text style={[styles.adminSubtitle, { fontFamily: bodyFont }]}>Manage your Libreya platform</Text>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.key ? COLORS.white : COLORS.text} />
              <Text style={[styles.tabLabel, { fontFamily: bodyFont }, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <View style={styles.content}>

          {/* ===== BOOKS TAB ===== */}
          {activeTab === 'books' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>Books ({books.length})</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openAddBook} activeOpacity={0.8}>
                  <Ionicons name="add" size={18} color={COLORS.white} />
                  <Text style={[styles.addBtnText, { fontFamily: bodyFont }]}>Add Book</Text>
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={COLORS.gray} />
                <TextInput
                  style={[styles.searchInput, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                  placeholder="Filter books..."
                  placeholderTextColor={COLORS.gray}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
              ) : (
                filteredBooks.map(book => (
                  <View key={book.id} style={styles.bookRow}>
                    <View style={styles.bookRowInfo}>
                      <Text style={[styles.bookRowTitle, { fontFamily: headingFont }]} numberOfLines={1}>{book.title}</Text>
                      <Text style={[styles.bookRowAuthor, { fontFamily: bodyFont }]} numberOfLines={1}>{book.author}</Text>
                      <View style={styles.bookRowMeta}>
                        {book.is_featured && <View style={styles.featuredBadge}><Text style={styles.featuredBadgeText}>Featured</Text></View>}
                        {book.category && <Text style={[styles.bookRowCategory, { fontFamily: bodyFont }]}>{book.category}</Text>}
                        <Text style={[styles.bookRowReads, { fontFamily: bodyFont }]}>{book.read_count} reads</Text>
                      </View>
                    </View>
                    <View style={styles.bookRowActions}>
                      <TouchableOpacity onPress={() => toggleFeatured(book)} style={styles.actionBtn}>
                        <Ionicons name={book.is_featured ? 'star' : 'star-outline'} size={20} color={book.is_featured ? COLORS.accent : COLORS.gray} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openEditBook(book)} style={styles.actionBtn}>
                        <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteBook(book)} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* ===== CMS TAB ===== */}
          {activeTab === 'cms' && (
            <>
              <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>Landing Page CMS</Text>
              <Text style={[styles.sectionSubtitle, { fontFamily: bodyFont }]}>Edit all text displayed on the home page</Text>

              {/* Logo URL */}
              <View style={styles.cmsField}>
                <Text style={[styles.cmsLabel, { fontFamily: bodyFont }]}>Site Logo URL</Text>
                <TextInput
                  style={[styles.cmsInput, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                  value={cmsFields.site_logo_url}
                  onChangeText={v => setCmsFields(p => ({ ...p, site_logo_url: v }))}
                  placeholder="https://... (paste image URL)"
                  placeholderTextColor={COLORS.gray}
                />
                <Text style={[styles.cmsHint, { fontFamily: bodyFont }]}>Leave empty to use the default Libreya logo</Text>
              </View>

              {/* Hero Section */}
              <Text style={[styles.cmsGroupTitle, { fontFamily: headingFont }]}>Hero Section</Text>
              <View style={styles.cmsField}>
                <Text style={[styles.cmsLabel, { fontFamily: bodyFont }]}>Hero Title</Text>
                <TextInput
                  style={[styles.cmsInput, styles.cmsMultiline, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                  value={cmsFields.landing_hero_title}
                  onChangeText={v => setCmsFields(p => ({ ...p, landing_hero_title: v }))}
                  multiline
                />
              </View>
              <View style={styles.cmsField}>
                <Text style={[styles.cmsLabel, { fontFamily: bodyFont }]}>Hero Subtitle</Text>
                <TextInput
                  style={[styles.cmsInput, styles.cmsMultiline, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                  value={cmsFields.landing_hero_subtitle}
                  onChangeText={v => setCmsFields(p => ({ ...p, landing_hero_subtitle: v }))}
                  multiline
                />
              </View>

              {/* Philosophy Section */}
              <Text style={[styles.cmsGroupTitle, { fontFamily: headingFont }]}>Philosophy Section</Text>
              <View style={styles.cmsField}>
                <Text style={[styles.cmsLabel, { fontFamily: bodyFont }]}>Philosophy Quote</Text>
                <TextInput
                  style={[styles.cmsInput, styles.cmsMultiline, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                  value={cmsFields.landing_philosophy_quote}
                  onChangeText={v => setCmsFields(p => ({ ...p, landing_philosophy_quote: v }))}
                  multiline
                />
              </View>
              <View style={styles.cmsField}>
                <Text style={[styles.cmsLabel, { fontFamily: bodyFont }]}>Philosophy Description</Text>
                <TextInput
                  style={[styles.cmsInput, styles.cmsMultiline, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                  value={cmsFields.landing_philosophy_desc}
                  onChangeText={v => setCmsFields(p => ({ ...p, landing_philosophy_desc: v }))}
                  multiline
                />
              </View>

              {/* CTA Section */}
              <Text style={[styles.cmsGroupTitle, { fontFamily: headingFont }]}>Call to Action</Text>
              <View style={styles.cmsField}>
                <Text style={[styles.cmsLabel, { fontFamily: bodyFont }]}>CTA Title</Text>
                <TextInput
                  style={[styles.cmsInput, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                  value={cmsFields.landing_cta_title}
                  onChangeText={v => setCmsFields(p => ({ ...p, landing_cta_title: v }))}
                />
              </View>
              <View style={styles.cmsField}>
                <Text style={[styles.cmsLabel, { fontFamily: bodyFont }]}>CTA Description</Text>
                <TextInput
                  style={[styles.cmsInput, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                  value={cmsFields.landing_cta_desc}
                  onChangeText={v => setCmsFields(p => ({ ...p, landing_cta_desc: v }))}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={saveCmsFields} activeOpacity={0.8} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color={COLORS.white} /> : (
                  <>
                    <Ionicons name="save-outline" size={18} color={COLORS.white} />
                    <Text style={[styles.saveBtnText, { fontFamily: bodyFont }]}>Save All CMS Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* ===== USERS TAB ===== */}
          {activeTab === 'users' && (
            <>
              <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>User Management</Text>
              <Text style={[styles.sectionSubtitle, { fontFamily: bodyFont }]}>Grant or revoke admin access</Text>

              {users.length === 0 ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
              ) : (
                users.map(u => (
                  <View key={u.id} style={styles.userRow}>
                    <View style={styles.userInfo}>
                      <View style={[styles.userAvatar, u.is_admin && styles.userAvatarAdmin]}>
                        <Text style={styles.userAvatarText}>{(u.email || u.display_name || '?')[0].toUpperCase()}</Text>
                      </View>
                      <View style={styles.userDetails}>
                        <Text style={[styles.userEmail, { fontFamily: headingFont }]}>{u.email || u.display_name || 'Guest User'}</Text>
                        <View style={styles.userMeta}>
                          <Text style={[styles.userProvider, { fontFamily: bodyFont }]}>{u.auth_provider}</Text>
                          {u.is_admin && <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>}
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleAdminBtn, u.is_admin && styles.toggleAdminBtnActive]}
                      onPress={() => toggleAdmin(u.id, u.email || 'this user')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={u.is_admin ? 'shield' : 'shield-outline'} size={16} color={u.is_admin ? COLORS.white : COLORS.primary} />
                      <Text style={[styles.toggleAdminText, { fontFamily: bodyFont }, u.is_admin && styles.toggleAdminTextActive]}>
                        {u.is_admin ? 'Revoke' : 'Make Admin'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          )}

          {/* ===== LEGAL TAB ===== */}
          {activeTab === 'legal' && (
            <>
              <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>Legal Documents</Text>
              <Text style={[styles.sectionSubtitle, { fontFamily: bodyFont }]}>Edit legal pages displayed to users</Text>

              {legalEditing ? (
                <View>
                  <View style={styles.legalEditHeader}>
                    <Text style={[styles.legalEditTitle, { fontFamily: headingFont }]}>
                      Editing: {legalEditing === 'terms_and_conditions' ? 'Terms & Conditions' : legalEditing === 'privacy_notice' ? 'Privacy Notice' : 'Legal Notice'}
                    </Text>
                    <TouchableOpacity onPress={() => setLegalEditing(null)}>
                      <Ionicons name="close" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.legalTextarea, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                    multiline
                    value={legalContent}
                    onChangeText={setLegalContent}
                    placeholder="Enter HTML content..."
                    placeholderTextColor={COLORS.gray}
                  />
                  <View style={styles.legalEditBtns}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setLegalEditing(null)} activeOpacity={0.7}>
                      <Text style={[styles.cancelBtnText, { fontFamily: bodyFont }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={saveLegal} activeOpacity={0.8} disabled={saving}>
                      {saving ? <ActivityIndicator size="small" color={COLORS.white} /> : (
                        <Text style={[styles.saveBtnText, { fontFamily: bodyFont }]}>Save Document</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.legalCards}>
                  {[
                    { key: 'terms_and_conditions', label: 'Terms & Conditions', icon: 'document-text-outline' },
                    { key: 'privacy_notice', label: 'Privacy Notice', icon: 'shield-checkmark-outline' },
                    { key: 'legal_notice', label: 'Legal Notice', icon: 'information-circle-outline' },
                  ].map(item => (
                    <TouchableOpacity
                      key={item.key}
                      style={styles.legalCard}
                      onPress={() => openLegalEditor(item.key)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={item.icon as any} size={28} color={COLORS.primary} />
                      <Text style={[styles.legalCardLabel, { fontFamily: headingFont }]}>{item.label}</Text>
                      <Ionicons name="create-outline" size={20} color={COLORS.accent} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <Footer />
      </ScrollView>

      {/* ===== BOOK EDIT MODAL ===== */}
      <Modal visible={showBookModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontFamily: headingFont }]}>
                {editingBook ? `Edit: ${editingBook.title}` : 'Add New Book'}
              </Text>
              <TouchableOpacity onPress={() => setShowBookModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Basic Info */}
              <Text style={[styles.modalGroupTitle, { fontFamily: headingFont }]}>Basic Information</Text>

              <Text style={[styles.fieldLabel, { fontFamily: bodyFont }]}>Title *</Text>
              <TextInput
                style={[styles.fieldInput, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={bookForm.title}
                onChangeText={v => setBookForm(p => ({ ...p, title: v }))}
                placeholder="Book title"
                placeholderTextColor={COLORS.gray}
              />

              <Text style={[styles.fieldLabel, { fontFamily: bodyFont }]}>Author *</Text>
              <TextInput
                style={[styles.fieldInput, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={bookForm.author}
                onChangeText={v => setBookForm(p => ({ ...p, author: v }))}
                placeholder="Author name"
                placeholderTextColor={COLORS.gray}
              />

              <Text style={[styles.fieldLabel, { fontFamily: bodyFont }]}>Category</Text>
              <TextInput
                style={[styles.fieldInput, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={bookForm.category}
                onChangeText={v => setBookForm(p => ({ ...p, category: v }))}
                placeholder="e.g. Fiction, Philosophy"
                placeholderTextColor={COLORS.gray}
              />

              <Text style={[styles.fieldLabel, { fontFamily: bodyFont }]}>Cover Image URL</Text>
              <TextInput
                style={[styles.fieldInput, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={bookForm.cover_image}
                onChangeText={v => setBookForm(p => ({ ...p, cover_image: v }))}
                placeholder="https://..."
                placeholderTextColor={COLORS.gray}
              />

              <Text style={[styles.fieldLabel, { fontFamily: bodyFont }]}>Description</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldMultiline, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={bookForm.description}
                onChangeText={v => setBookForm(p => ({ ...p, description: v }))}
                placeholder="Brief description"
                placeholderTextColor={COLORS.gray}
                multiline
              />

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setBookForm(p => ({ ...p, is_featured: !p.is_featured }))}
              >
                <Ionicons name={bookForm.is_featured ? 'checkbox' : 'square-outline'} size={24} color={COLORS.primary} />
                <Text style={[styles.checkboxLabel, { fontFamily: bodyFont }]}>Featured Book</Text>
              </TouchableOpacity>

              {/* Editorial Content */}
              <Text style={[styles.modalGroupTitle, { fontFamily: headingFont, marginTop: 24 }]}>Editorial Content</Text>
              <Text style={[styles.modalGroupHint, { fontFamily: bodyFont }]}>These appear on the book's overview page</Text>

              <Text style={[styles.fieldLabel, { fontFamily: bodyFont }]}>Expert Review</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldLargeMultiline, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={bookEditorial.expert_review}
                onChangeText={v => setBookEditorial(p => ({ ...p, expert_review: v }))}
                placeholder="Write an expert review of this book..."
                placeholderTextColor={COLORS.gray}
                multiline
              />

              <Text style={[styles.fieldLabel, { fontFamily: bodyFont }]}>Comprehensive Summary</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldLargeMultiline, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={bookEditorial.summary}
                onChangeText={v => setBookEditorial(p => ({ ...p, summary: v }))}
                placeholder="Write a comprehensive summary..."
                placeholderTextColor={COLORS.gray}
                multiline
              />

              <Text style={[styles.fieldLabel, { fontFamily: bodyFont }]}>Analytical Commentary</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldLargeMultiline, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                value={bookEditorial.commentary}
                onChangeText={v => setBookEditorial(p => ({ ...p, commentary: v }))}
                placeholder="Write analytical commentary..."
                placeholderTextColor={COLORS.gray}
                multiline
              />

              {/* Content Body */}
              {!editingBook && (
                <>
                  <Text style={[styles.fieldLabel, { fontFamily: bodyFont }]}>Book Content (HTML)</Text>
                  <TextInput
                    style={[styles.fieldInput, styles.fieldLargeMultiline, { fontFamily: bodyFont }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                    value={bookForm.content_body}
                    onChangeText={v => setBookForm(p => ({ ...p, content_body: v }))}
                    placeholder="Paste HTML book content..."
                    placeholderTextColor={COLORS.gray}
                    multiline
                  />
                </>
              )}

              <View style={{ height: 32 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowBookModal(false)} activeOpacity={0.7}>
                <Text style={[styles.cancelBtnText, { fontFamily: bodyFont }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveBook} activeOpacity={0.8} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color={COLORS.white} /> : (
                  <>
                    <Ionicons name="save-outline" size={16} color={COLORS.white} />
                    <Text style={[styles.saveBtnText, { fontFamily: bodyFont }]}>
                      {editingBook ? 'Save Changes' : 'Create Book'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  centered: { justifyContent: 'center', alignItems: 'center' },
  accessDenied: { fontSize: 24, color: COLORS.text, marginTop: 16 },
  accessDeniedSub: { fontSize: 15, color: COLORS.gray, marginTop: 4 },

  // Success Toast
  successToast: { position: 'absolute', top: 60, left: 20, right: 20, backgroundColor: COLORS.success, borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 999 },
  successText: { color: '#fff', fontSize: 14, fontWeight: '500' },

  // Header
  adminHeader: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 32, paddingTop: 48 },
  adminTitle: { fontSize: 28, color: COLORS.white },
  adminSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  // Tabs
  tabBar: { maxHeight: 56, backgroundColor: COLORS.secondary },
  tabBarContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.primary },
  tabLabel: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  tabLabelActive: { color: COLORS.white },

  // Content
  content: { padding: 20, maxWidth: 900, alignSelf: 'center', width: '100%' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 22, color: COLORS.text },
  sectionSubtitle: { fontSize: 14, color: COLORS.gray, marginTop: 4, marginBottom: 20 },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, gap: 10, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text, borderWidth: 0, padding: 0, margin: 0 },

  // Add Button
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  addBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },

  // Book Row
  bookRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, borderRadius: 12, padding: 16, marginBottom: 10 },
  bookRowInfo: { flex: 1 },
  bookRowTitle: { fontSize: 15, color: COLORS.text },
  bookRowAuthor: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  bookRowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  bookRowCategory: { fontSize: 12, color: COLORS.gray },
  bookRowReads: { fontSize: 12, color: COLORS.gray },
  featuredBadge: { backgroundColor: COLORS.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  featuredBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '600' },
  bookRowActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.04)' },

  // CMS Fields
  cmsField: { marginBottom: 20 },
  cmsLabel: { fontSize: 14, color: COLORS.text, fontWeight: '600', marginBottom: 8 },
  cmsInput: { backgroundColor: COLORS.secondary, borderRadius: 10, padding: 14, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.lightGray },
  cmsMultiline: { minHeight: 80, textAlignVertical: 'top' },
  cmsHint: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  cmsGroupTitle: { fontSize: 18, color: COLORS.primary, marginTop: 24, marginBottom: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.lightGray },

  // User Row
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.secondary, borderRadius: 12, padding: 16, marginBottom: 10 },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gray, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userAvatarAdmin: { backgroundColor: COLORS.primary },
  userAvatarText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  userDetails: { flex: 1 },
  userEmail: { fontSize: 14, color: COLORS.text },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  userProvider: { fontSize: 12, color: COLORS.gray },
  adminBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  adminBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '600' },
  toggleAdminBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary },
  toggleAdminBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  toggleAdminText: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },
  toggleAdminTextActive: { color: COLORS.white },

  // Legal
  legalCards: { gap: 12 },
  legalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, borderRadius: 12, padding: 20, gap: 16 },
  legalCardLabel: { flex: 1, fontSize: 16, color: COLORS.text },
  legalEditHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  legalEditTitle: { fontSize: 18, color: COLORS.primary },
  legalTextarea: { backgroundColor: COLORS.secondary, borderRadius: 12, padding: 16, minHeight: 300, fontSize: 14, color: COLORS.text, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.lightGray },
  legalEditBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },

  // Save / Cancel Buttons
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginTop: 20, alignSelf: 'flex-end' },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gray },
  cancelBtnText: { color: COLORS.text, fontSize: 15 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modal: { backgroundColor: COLORS.white, borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  modalTitle: { fontSize: 20, color: COLORS.text, flex: 1, marginRight: 12 },
  modalBody: { padding: 20, maxHeight: 500 },
  modalGroupTitle: { fontSize: 17, color: COLORS.primary, marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  modalGroupHint: { fontSize: 13, color: COLORS.gray, marginBottom: 16 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: COLORS.lightGray },

  // Field Inputs
  fieldLabel: { fontSize: 14, color: COLORS.text, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  fieldInput: { backgroundColor: COLORS.secondary, borderRadius: 10, padding: 14, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.lightGray },
  fieldMultiline: { minHeight: 80, textAlignVertical: 'top' },
  fieldLargeMultiline: { minHeight: 120, textAlignVertical: 'top' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  checkboxLabel: { fontSize: 15, color: COLORS.text },
});
