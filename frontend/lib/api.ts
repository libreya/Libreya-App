import { supabase } from './supabase';

const ADMIN_EMAIL = 'hello@libreya.app';

function qp(endpoint: string): URLSearchParams {
  return new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
}

export const api = {
  // ============= BOOKS =============
  async get(endpoint: string) {
    // Parse endpoint to determine what to fetch
    if (endpoint.startsWith('/books/featured')) {
      const limit = parseInt(qp(endpoint).get('limit') || '10');
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, category, cover_image, is_featured, read_count, description')
        .eq('is_featured', true)
        .order('read_count', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return data || [];
    }

    if (endpoint.startsWith('/books/recommended')) {
      const limit = parseInt(qp(endpoint).get('limit') || '10');
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, category, cover_image, is_featured, read_count, description')
        .order('read_count', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return data || [];
    }

    if (endpoint.startsWith('/books') && endpoint.includes('?')) {
      const params = qp(endpoint);
      const limit = parseInt(params.get('limit') || '50');
      const offset = parseInt(params.get('offset') || '0');
      const category = params.get('category');
      const search = params.get('search');
      const featured = params.get('featured');

      let query = supabase
        .from('books')
        .select('id, title, author, category, cover_image, is_featured, read_count, description')
        .order('read_count', { ascending: false })
        .range(offset, offset + limit - 1);

      if (category) {
        query = query.eq('category', category);
      }
      if (featured === 'true') {
        query = query.eq('is_featured', true);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    }

    // Single book by ID - /books/123
    const bookIdMatch = endpoint.match(/^\/books\/(\d+)$/);
    if (bookIdMatch) {
      const bookId = bookIdMatch[1];
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    // All books without params
    if (endpoint === '/books') {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, category, cover_image, is_featured, read_count, description')
        .order('read_count', { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return data || [];
    }

    // ============= USERS =============
    const userIdMatch = endpoint.match(/^\/users\/([a-f0-9-]+)$/);
    if (userIdMatch) {
      const userId = userIdMatch[1];
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ============= ACTIVITY =============
    const activityMatch = endpoint.match(/^\/activity\/([a-f0-9-]+)\/(\d+)$/);
    if (activityMatch) {
      const [, userId, bookId] = activityMatch;
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return data;
    }

    // User's favorites
    const favoritesMatch = endpoint.match(/^\/favorites\/([a-f0-9-]+)$/);
    if (favoritesMatch) {
      const userId = favoritesMatch[1];
      const { data, error } = await supabase
        .from('user_activity')
        .select('book_id, books(id, title, author, cover_image)')
        .eq('user_id', userId)
        .eq('is_favorite', true);
      if (error) throw new Error(error.message);
      return (data || []).map((item: any) => item.books).filter(Boolean);
    }

    // ============= SETTINGS =============
    if (endpoint === '/settings') {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');
      if (error) throw new Error(error.message);
      return data || [];
    }

    // ============= ADMIN BOOKS =============
    if (endpoint === '/admin/books') {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    }

    // ============= BOOK CATEGORIES =============
    if (endpoint.startsWith('/books/categories/list')) {
      const { data, error } = await supabase.rpc('get_distinct_categories');
      if (error) throw new Error(error.message);
      return (data?.map((item: { category: string }) => item.category) ?? []).sort((a: string, b: string) => a.localeCompare(b));
    }

    throw new Error(`Unknown GET endpoint: ${endpoint}`);
  },

  async post(endpoint: string, data?: any) {
    // ============= USERS =============
    if (endpoint === '/users') {
      // Check if user exists first
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.id)
        .maybeSingle();

      if (existing) return existing;

      // Check by email
      if (data.email) {
        const { data: existingByEmail } = await supabase
          .from('users')
          .select('*')
          .eq('email', data.email)
          .maybeSingle();

        if (existingByEmail) {
          return existingByEmail;
        }
      }

      // Create new user
      const userData = {
        id: data.id,
        email: data.email,
        display_name: data.display_name,
        avatar_url: data.avatar_url,
        bio: data.bio,
        auth_provider: data.auth_provider,
        is_admin: data.email === ADMIN_EMAIL,
        terms_accepted: data.terms_accepted || false,
        created_at: new Date().toISOString(),
      };

      const { data: newUser, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Duplicate - fetch and return existing
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.id)
            .single();
          return existingUser;
        }
        throw new Error(error.message);
      }
      return newUser;
    }

    // Accept terms
    if (endpoint.match(/^\/users\/([a-f0-9-]+)\/accept-terms$/)) {
      const userId = endpoint.split('/')[2];
      const { data: updated, error } = await supabase
        .from('users')
        .update({
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    }

    // Migrate guest data
    if (endpoint === '/users/migrate-guest') {
      const { guest_uuid, new_user_id } = data;
      const { error } = await supabase
        .from('user_activity')
        .update({ user_id: new_user_id })
        .eq('user_id', guest_uuid);
      if (error) throw new Error(error.message);
      return { success: true };
    }

    // ============= ACTIVITY =============
    if (endpoint === '/activity') {
      const now = new Date().toISOString();
      const { data: result, error } = await supabase
        .from('user_activity')
        .upsert(
          { ...data, updated_at: now },
          { onConflict: 'user_id,book_id' }
        )
        .select()
        .single();
      if (error) throw new Error(error.message);
      return result;
    }

    // ============= ADMIN BOOKS =============
    if (endpoint === '/admin/books') {
      const { data: newBook, error } = await supabase
        .from('books')
        .insert(data)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return newBook;
    }

    // ============= ADMIN SETTINGS =============
    if (endpoint === '/admin/settings') {
      const { key, value } = data;
      const { data: result, error } = await supabase
        .from('app_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return result;
    }

    // Increment book read count
    const match = endpoint.match(/^\/books\/(\d+)\/increment-read$/);

    if (match) {
      const bookId = Number(match[1]);
      const { error } = await supabase.rpc('increment_book_read', {
        book_id_input: bookId,
      });

      if (error) throw error;
      return { success: true };
    }

    throw new Error(`Unknown POST endpoint: ${endpoint}`);
  },

  async patch(endpoint: string, data: any) {
    // ============= USERS =============
    const userMatch = endpoint.match(/^\/users\/([a-f0-9-]+)$/);
    if (userMatch) {
      const userId = userMatch[1];
      const { data: updated, error } = await supabase
        .from('users')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    }

    // ============= ADMIN BOOKS =============
    const bookMatch = endpoint.match(/^\/admin\/books\/(\d+)$/);
    if (bookMatch) {
      const bookId = bookMatch[1];
      const { data: updated, error } = await supabase
        .from('books')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', bookId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    }

    throw new Error(`Unknown PATCH endpoint: ${endpoint}`);
  },

  async delete(endpoint: string) {
    // ============= USERS (GDPR Delete) =============
    const userMatch = endpoint.match(/^\/users\/([a-f0-9-]+)$/);
    if (userMatch) {
      const userId = userMatch[1];

      // Delete user activity
      await supabase
        .from('user_activity')
        .delete()
        .eq('user_id', userId);

      // Delete user profile
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw new Error(error.message);

      // Note: Deleting from auth.users requires service role key
      // For serverless, the user should use supabase.auth.signOut()
      // and the auth session will eventually expire
      return { success: true, message: 'User data deleted. Please sign out to complete.' };
    }

    // ============= ADMIN BOOKS =============
    const bookMatch = endpoint.match(/^\/admin\/books\/(\d+)$/);
    if (bookMatch) {
      const bookId = bookMatch[1];
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);
      if (error) throw new Error(error.message);
      return { success: true };
    }

    throw new Error(`Unknown DELETE endpoint: ${endpoint}`);
  },
};
