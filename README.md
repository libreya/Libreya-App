# Libreya - Cross-Platform Reading App

A beautiful, cross-platform reading app for iOS, Android, and Web built with Expo and Supabase.

## 🚀 Features

- **300+ Classic Books** - Pre-seeded library from Project Gutenberg
- **Cross-Platform** - Works on iOS, Android, and Web
- **User Authentication** - Email/Password, Google, Apple Sign-In
- **Guest Mode** - Browse and read without signing up
- **Favorites & Highlights** - Save your reading progress
- **Admin Dashboard** - Full content management system
- **GDPR Compliant** - Complete account deletion
- **Dark/Light/Sepia Themes** - Customizable reading experience
- **AdMob Integration** - Monetization ready

## 📁 Project Structure

```
libreya/
├── frontend/                # Expo React Native app
│   ├── app/                 # Screens (file-based routing)
│   │   ├── (tabs)/          # Main app tabs (Library, Search, Favorites, Profile)
│   │   ├── admin.tsx        # Admin Dashboard
│   │   ├── book/[id].tsx    # Book Reader
│   │   ├── welcome.tsx      # Auth screens
│   │   └── reset-password.tsx
│   ├── components/          # Reusable UI components
│   ├── lib/                 # API, Store, Supabase client
│   ├── constants/           # Theme configuration
│   ├── .env.example         # Environment variables template
│   └── package.json
├── backend/                 # FastAPI server
│   ├── server.py            # API endpoints
│   ├── .env.example         # Environment variables template
│   ├── requirements.txt     # Python dependencies
│   ├── supabase_migration.sql # Database schema
│   └── seed_books.py        # Book seeding script
└── README.md
```

## 🛠️ Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `backend/supabase_migration.sql`
3. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (for backend only)

4. Enable Auth Providers in **Authentication → Providers**:
   - Email (enabled by default)
   - Google (requires Google Cloud Console setup)
   - Apple (requires Apple Developer account)

5. Add your domain to **Authentication → URL Configuration → Redirect URLs**

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
pip install -r requirements.txt
python server.py
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your Supabase credentials
yarn install
yarn start
```

### 4. Seed Books (Optional)

```bash
cd backend
python seed_books.py
```

## 🔐 Environment Variables

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `EXPO_PUBLIC_ADMOB_*` | Google AdMob IDs |
| `EXPO_PUBLIC_BACKEND_URL` | Backend API URL |

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Service role key (NEVER expose to frontend) |
| `ADMIN_EMAIL` | Email with admin privileges |

## 👨‍💼 Admin Dashboard

Access the admin dashboard at `/admin` when logged in as the admin user.

### Features:
- **Books Tab**: View, edit, delete, add books
  - Edit title, author, category, description
  - **HTML Content Editor**: Full book content editing
  - **Cover Image Upload**: Upload or paste URL
  - Toggle Featured status
- **Legal Settings Tab**: Edit Terms, Privacy, Legal notices
- **App Settings Tab**: Edit global app text (welcome messages, labels, etc.)

### Admin Access:
The user with the email specified in `ADMIN_EMAIL` environment variable automatically gets admin privileges.

## 📱 Deployment

### Web (Vercel/Netlify)
```bash
cd frontend
npx expo export --platform web
# Deploy the 'dist' folder
```

### iOS/Android
```bash
cd frontend
eas build --platform ios
eas build --platform android
```

## 🗄️ Database Schema

### Tables:
- `users` - User profiles
- `books` - Book catalog with content_body (HTML)
- `user_activity` - Favorites, highlights, reading progress
- `app_settings` - Global app configuration

### Key Columns:
- `books.content_body` - Full book content as HTML
- `books.cover_image` - Cover image URL
- `books.is_featured` - Show in Featured section
- `user_activity.highlights` - JSON array of highlights
- `app_settings.key/value` - Key-value configuration

## 🔒 Security Notes

1. **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend
2. Add `backend/.env` to `.gitignore`
3. Use environment variables in production, not hardcoded values
4. Enable Row Level Security (RLS) on all Supabase tables

## 📄 License

This project uses books from Project Gutenberg (public domain).
App code is proprietary - all rights reserved.

## 🆘 Support

For issues or questions, contact: hello@libreya.app
