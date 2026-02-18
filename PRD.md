# Libreya - Cross-Platform Reading App

## Project Overview
Libreya is a cross-platform reading app for iOS, Android, and Web that allows users to read public domain literature from Standard Ebooks and Project Gutenberg.

## Tech Stack
- **Frontend**: Expo React Native with TypeScript
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email, Google, Apple placeholder)
- **Ads**: Google AdMob

## Setup Instructions

### 1. Supabase Database Setup
**CRITICAL: You must run the SQL migration to create the database tables.**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/bruzgztsltjtzwkkehif
2. Navigate to SQL Editor
3. Copy and paste the contents of `/app/backend/supabase_migration.sql`
4. Run the SQL to create all tables

### 2. Book Seeding
After setting up the database, run the book seeding script to populate with 250+ public domain books:

```bash
cd /app/backend
python seed_books.py
```

This will fetch books from Project Gutenberg and store them as editable HTML in your Supabase database.

## Features Implemented

### Core Features
- ✅ Guest user auto-generation with UUID
- ✅ Terms and Conditions acceptance (mandatory)
- ✅ Email/password authentication via Supabase
- ✅ Google Sign-In button (requires native configuration)
- ✅ Apple Sign-In placeholder
- ✅ Guest data migration when signing up
- ✅ Light/Sepia/Dark/Night theme modes

### Reading Engine
- ✅ Horizontal chapter navigation
- ✅ Progress tracking (% completion)
- ✅ Font size adjustment
- ✅ Chapter detection and navigation
- ✅ Text selection and copying
- ✅ Highlights saving
- ✅ Favorites system

### Library
- ✅ Featured books section (highest read count)
- ✅ Recommended books (based on reading history)
- ✅ Category filtering
- ✅ Search functionality
- ✅ Beautiful library-themed hero image

### Admin Dashboard
- ✅ Protected /admin route (admin-only access)
- ✅ CRUD interface for books
- ✅ Toggle featured status
- ✅ Edit legal documents (Terms, Privacy, Legal Notice)

### User Profile
- ✅ Edit display name and bio
- ✅ Account deletion (GDPR compliant)
- ✅ Theme preference
- ✅ Legal documents access

### Ads Integration
- ✅ Banner ad placeholders in library
- ✅ Interstitial ad logic (every 3 chapters)
- ✅ AdMob configuration ready for native builds

## Configuration

### Environment Variables

**Frontend (.env)**:
```
EXPO_PUBLIC_SUPABASE_URL=https://bruzgztsltjtzwkkehif.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-4299148862195882~6726996697
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-4299148862195882~9783377200
EXPO_PUBLIC_ADMOB_BANNER_ANDROID=ca-app-pub-4299148862195882/4996563697
EXPO_PUBLIC_ADMOB_BANNER_IOS=ca-app-pub-4299148862195882/1928937912
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID=ca-app-pub-4299148862195882/1493229112
EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS=ca-app-pub-4299148862195882/5592256224
```

**Backend (.env)**:
```
SUPABASE_URL=https://bruzgztsltjtzwkkehif.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
ADMIN_EMAIL=hello@libreya.app
```

### Admin Access
The email `hello@libreya.app` is automatically granted admin privileges.

## Color Palette
- Primary: #5A1F2B (Deep burgundy)
- Secondary: #F5EFE6 (Cream)
- Accent: #C6A75E (Gold)
- Text: #2B2B2B (Dark gray)

## File Structure
```
/app
├── backend/
│   ├── server.py          # FastAPI backend
│   ├── seed_books.py      # Book seeding script
│   └── supabase_migration.sql  # Database schema
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx    # Root layout
│   │   ├── (tabs)/        # Tab navigation screens
│   │   ├── auth.tsx       # Authentication screen
│   │   ├── admin.tsx      # Admin dashboard
│   │   ├── book/[id].tsx  # Book reader
│   │   └── legal/[type].tsx  # Legal pages
│   ├── components/        # Reusable components
│   ├── constants/         # Theme and colors
│   └── lib/
│       ├── api.ts         # API client
│       ├── store.ts       # Zustand state management
│       └── supabase.ts    # Supabase client
```

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/users` - Create/update user
- `GET /api/users/{id}` - Get user profile
- `DELETE /api/users/{id}` - Delete user (GDPR)
- `GET /api/books` - List books
- `GET /api/books/{id}` - Get book with content
- `GET /api/books/featured` - Get featured books
- `GET /api/books/recommended/{user_id}` - Get recommendations
- `GET /api/activity/{user_id}` - Get reading activity
- `POST /api/activity` - Update reading activity
- `GET /api/favorites/{user_id}` - Get favorites
- `GET /api/settings` - Get app settings
- Admin endpoints under `/api/admin/*`

## Next Steps
1. Run the SQL migration in Supabase
2. Run the book seeding script
3. Test the complete flow
4. Configure Google OAuth in Supabase for production
5. Set up Apple Sign-In when credentials are ready
6. Build and deploy to app stores
