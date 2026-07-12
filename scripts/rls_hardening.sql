-- Run this once in the Supabase SQL editor against the LIVE database.
-- Replaces the wide-open `USING (true)` RLS policies (readable/writable by anyone
-- holding the public anon key) with real ownership/admin checks.
--
-- Background: public.users.id equals auth.uid() for real (email/google/apple) accounts,
-- because the app sets it from the Supabase Auth session on sign-in. Guest accounts
-- (auth_provider = 'guest') have no Supabase Auth session at all — the app generates a
-- random client-side UUID so people can read without creating an account — so they
-- can't be scoped by auth.uid(). Guest rows stay reachable by anyone who has the row's
-- random UUID (same exposure as today); authenticated accounts are now locked to
-- themselves. Book/setting writes are restricted to admins only.

-- ============= HELPER: is the caller an admin? =============
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ============= USERS =============
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;

CREATE POLICY "View own profile or guest profiles" ON public.users
    FOR SELECT USING (auth.uid() = id OR auth_provider = 'guest');

CREATE POLICY "Update own profile or guest profiles" ON public.users
    FOR UPDATE USING (auth.uid() = id OR auth_provider = 'guest');

CREATE POLICY "Create own profile or guest profile" ON public.users
    FOR INSERT WITH CHECK (
        (auth.uid() = id AND is_admin = false)
        OR (auth_provider = 'guest' AND is_admin = false)
    );

CREATE POLICY "Delete own profile or guest profiles" ON public.users
    FOR DELETE USING (auth.uid() = id OR auth_provider = 'guest');

-- Block is_admin escalation via UPDATE, independent of the policies above.
CREATE OR REPLACE FUNCTION public.lock_is_admin()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_admin := OLD.is_admin;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_lock_is_admin ON public.users;
CREATE TRIGGER trg_lock_is_admin
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.lock_is_admin();

-- ============= BOOKS =============
DROP POLICY IF EXISTS "Admin can insert books" ON public.books;
DROP POLICY IF EXISTS "Admin can update books" ON public.books;
DROP POLICY IF EXISTS "Admin can delete books" ON public.books;
-- "Anyone can read books" (SELECT) is unchanged and stays public.

CREATE POLICY "Admin can insert books" ON public.books
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update books" ON public.books
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin can delete books" ON public.books
    FOR DELETE USING (public.is_admin());

-- Public visitors still need to bump read_count on every read; SECURITY DEFINER lets
-- this one function do that despite books now being admin-write-only.
CREATE OR REPLACE FUNCTION public.increment_book_read(book_id_input INT)
RETURNS void AS $$
    UPDATE public.books
    SET read_count = COALESCE(read_count, 0) + 1
    WHERE id = book_id_input;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- ============= USER ACTIVITY =============
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can insert their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can update their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can delete their own activity" ON public.user_activity;

CREATE POLICY "Access own or guest activity" ON public.user_activity
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = user_activity.user_id
            AND (u.id = auth.uid() OR u.auth_provider = 'guest')
        )
    );

-- ============= APP SETTINGS =============
DROP POLICY IF EXISTS "Admin can manage settings" ON public.app_settings;
-- "Anyone can read settings" (SELECT) is unchanged and stays public — the privacy/
-- terms pages and site-wide settings need to be publicly readable.

CREATE POLICY "Admin can manage settings" ON public.app_settings
    FOR ALL USING (public.is_admin());

-- ============= EXISTING FUNCTION HARDENING =============
-- Pin search_path on the pre-existing SECURITY DEFINER function too.
CREATE OR REPLACE FUNCTION public.migrate_guest_data(guest_uuid UUID, new_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.user_activity
    SET user_id = new_user_id, updated_at = NOW()
    WHERE user_id = guest_uuid;

    DELETE FROM public.users WHERE id = guest_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
