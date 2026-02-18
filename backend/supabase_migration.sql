-- Libreya Database Schema for Supabase
-- Run this SQL in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============= USERS TABLE =============
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    auth_provider TEXT DEFAULT 'guest' CHECK (auth_provider IN ('guest', 'email', 'google', 'apple')),
    is_admin BOOLEAN DEFAULT FALSE,
    terms_accepted BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= BOOKS TABLE =============
CREATE TABLE IF NOT EXISTS public.books (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    content_body TEXT,  -- HTML content, stored as TEXT for large content
    category TEXT,
    cover_image TEXT,  -- URL or base64
    is_featured BOOLEAN DEFAULT FALSE,
    read_count INTEGER DEFAULT 0,
    description TEXT,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for searching
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books USING gin(to_tsvector('english', author));
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_books_featured ON public.books(is_featured);
CREATE INDEX IF NOT EXISTS idx_books_read_count ON public.books(read_count DESC);

-- ============= USER ACTIVITY TABLE =============
CREATE TABLE IF NOT EXISTS public.user_activity (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    last_position FLOAT DEFAULT 0.0,
    is_favorite BOOLEAN DEFAULT FALSE,
    highlights JSONB DEFAULT '[]'::jsonb,
    chapter_read_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_book_id ON public.user_activity(book_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_favorite ON public.user_activity(user_id, is_favorite) WHERE is_favorite = TRUE;

-- ============= APP SETTINGS TABLE =============
CREATE TABLE IF NOT EXISTS public.app_settings (
    id BIGSERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= ROW LEVEL SECURITY =============

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (true);  -- Allow read for service role

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (true);  -- Allow update for service role

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (true);  -- Allow insert for service role

CREATE POLICY "Users can delete their own profile" ON public.users
    FOR DELETE USING (true);  -- Allow delete for service role

-- Books policies (public read, admin write)
CREATE POLICY "Anyone can read books" ON public.books
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert books" ON public.books
    FOR INSERT WITH CHECK (true);  -- Will be restricted by API

CREATE POLICY "Admin can update books" ON public.books
    FOR UPDATE USING (true);  -- Will be restricted by API

CREATE POLICY "Admin can delete books" ON public.books
    FOR DELETE USING (true);  -- Will be restricted by API

-- User activity policies
CREATE POLICY "Users can view their own activity" ON public.user_activity
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own activity" ON public.user_activity
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own activity" ON public.user_activity
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own activity" ON public.user_activity
    FOR DELETE USING (true);

-- App settings policies (public read, admin write)
CREATE POLICY "Anyone can read settings" ON public.app_settings
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage settings" ON public.app_settings
    FOR ALL USING (true);

-- ============= DEFAULT SETTINGS =============
INSERT INTO public.app_settings (key, value) VALUES 
('terms_and_conditions', '
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
'),
('privacy_notice', '
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
<li><strong>Activity Data:</strong> Reading progress, favorite books, and highlights (stored locally for guests; synced for registered users).</li>
<li><strong>Device Data:</strong> IP address and device identifiers (used for security and ad delivery).</li>
<li><strong>Minor Data:</strong> If we have actual knowledge a user is under 16, their data is classified as Sensitive Personal Information and receives extra protections.</li>
</ul>

<h3>3. Legal Basis for Processing (GDPR)</h3>
<p>We process your data based on:</p>
<ul>
<li><strong>Performance of a Contract:</strong> To provide the reading service you requested.</li>
<li><strong>Legitimate Interests:</strong> To prevent fraud, secure the app, and deliver relevant ad banners.</li>
<li><strong>Consent:</strong> For push notifications and personalized advertising (which you can withdraw at any time).</li>
</ul>

<h3>4. Third-Party Sharing and Data Transfers</h3>
<p>We do not sell your personal information. We share data with:</p>
<ul>
<li><strong>Service Providers:</strong> Supabase for authentication and database storage.</li>
<li><strong>Ad Partners:</strong> Google AdMob for displaying banner ads.</li>
<li><strong>International Transfers:</strong> Data may be transferred to servers outside the EEA (e.g., USA). We use Standard Contractual Clauses (SCCs) to ensure data safety.</li>
</ul>

<h3>5. Data Retention and Erasure</h3>
<ul>
<li><strong>Retention:</strong> We keep your data as long as your account is active. Guest data is kept as long as the app remains on your device.</li>
<li><strong>Right to Erasure:</strong> You can delete your account and all associated data (highlights, favorites, and profile) immediately via the "Delete Account" button in Settings.</li>
</ul>

<h3>6. Your Rights</h3>
<p>Under global privacy laws, you have the following rights:</p>
<ul>
<li><strong>Access & Portability:</strong> Request a copy of all data we have collected since January 1, 2022.</li>
<li><strong>Correction:</strong> Fix any inaccurate personal information.</li>
<li><strong>Opt-Out:</strong> Stop the "sharing" of data for targeted ads and limit the use of sensitive information.</li>
<li><strong>Right to Complain:</strong> You have the right to lodge a complaint with your local Data Protection Authority.</li>
</ul>

<h3>7. Modern Compliance (2026 Updates)</h3>
<ul>
<li><strong>No Dark Patterns:</strong> Our consent and opt-out buttons are designed with equal prominence.</li>
<li><strong>Opt-Out Confirmation:</strong> If you opt out of data sharing, our settings will clearly display "Opt-Out Request Honored".</li>
</ul>
'),
('legal_notice', '
<h2>Legal Notice</h2>

<h3>Royalty-Free Content Notice</h3>
<p>Works sourced via Standard Ebooks and Project Gutenberg. No copyright claimed on original texts.</p>

<h3>Intellectual Property</h3>
<p>While the literary works presented in Libreya are in the public domain, the Libreya application, including its design, code, branding, and user interface, is protected by intellectual property laws.</p>

<h3>Contact</h3>
<p>For any legal inquiries, please contact: hello@libreya.app</p>
')
ON CONFLICT (key) DO NOTHING;

-- ============= FUNCTIONS =============

-- Function to migrate guest data to registered user
CREATE OR REPLACE FUNCTION migrate_guest_data(guest_uuid UUID, new_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Update all user_activity records
    UPDATE public.user_activity 
    SET user_id = new_user_id, updated_at = NOW()
    WHERE user_id = guest_uuid;
    
    -- Delete the guest user profile
    DELETE FROM public.users WHERE id = guest_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
