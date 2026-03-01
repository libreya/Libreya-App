# Libreya - Production Requirements Document

## Overview
Libreya is a cross-platform reading app for classic literature, built with Expo and Supabase.

## Architecture
- **Frontend**: Expo (React Native) with expo-router
- **Backend**: FastAPI (Python) with Supabase PostgreSQL
- **Auth**: Supabase Auth (Email, Google, Apple, Guest)
- **State**: Zustand with AsyncStorage persistence
- **Fonts**: Libre Baskerville (Regular, Bold, Italic)

## Color Palette
- Primary: #5A1F2B (Deep burgundy)
- Secondary: #F5EFE6 (Warm cream)
- Accent: #C6A75E (Gold)
- Text: #2B2B2B (Near black)

## Pages (File-based routing)
| Route | Description | Status |
|-------|-------------|--------|
| `/` | Static landing page with hero, stats, featured books, benefits | ✅ Done |
| `/browse` | Browse all books with search and category filtering | ✅ Done |
| `/about` | About Us page with mission, values, philosophy | ✅ Done |
| `/founder` | Founder's Letter (dedicated page) | ✅ Done |
| `/faq` | Frequently Asked Questions | ✅ Done |
| `/contact` | Contact Us (hello@libreya.app) | ✅ Done |
| `/donate` | Donate placeholder page | ✅ Done |
| `/welcome` | Auth screen (Sign Up/In, Google, Apple, Guest) | ✅ Done |
| `/auth` | Email auth modal | ✅ Done |
| `/book/[id]` | Book reader | ✅ Done |
| `/legal/[type]` | Legal pages (privacy, terms, legal) | ✅ Done |
| `/(tabs)/*` | Tab navigation for logged-in users | ✅ Done |
| `/admin` | Admin dashboard | 🔲 Planned |

## Navigation
- **Logged Out**: Home, Browse, About, Donate, Sign In
- **Logged In**: Home, Browse, Favorites, Search, About, Profile

## Key Features Implemented
- Static root landing page (no JS redirects for guests)
- Conditional navigation header
- Footer with legal links
- Libre Baskerville typography throughout
- Libreya logo branding
- 262 books seeded from Project Gutenberg
- Featured books gallery
- Book reader with favorites
- Guest and email auth

## Upcoming
- Book Overview Pages (pre-reader with editorial content)
- Admin CMS Dashboard
- Blog engine
- sitemap.xml, ads.txt
- Multi-admin support
