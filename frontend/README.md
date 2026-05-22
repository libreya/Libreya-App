# Libreya — Web App

Free classic literature for everyone. Built with Next.js 15, Supabase, and Zustand.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (Pages Router) |
| UI | React 19 |
| State | Zustand |
| Backend | Supabase (auth + database) |
| Styling | CSS custom properties (4 themes) |
| Hosting | Vercel |

---

## Local Development

### 1. Install dependencies

```bash
cd frontend
yarn install
```

### 2. Set environment variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://bruzgztsltjtzwkkehif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

> The app has hardcoded fallbacks so it runs without this file, but using `.env.local` is preferred and keeps credentials out of source code.

### 3. Start the dev server

```bash
yarn dev
```

App runs at `http://localhost:3000`.

---

## Vercel Deployment

### First-time setup

**Step 1 — Import the repository**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. On the configuration screen, set **Root Directory** to `frontend`
   - Without this Vercel builds from the repo root and fails

**Step 2 — Add environment variables**

In Vercel → Project → Settings → Environment Variables, add:

| Name | Value | Environments |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bruzgztsltjtzwkkehif.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(your anon key)* | Production, Preview, Development |

**Step 3 — Deploy**

Click **Deploy**. Vercel runs `yarn build` automatically.

Build settings are auto-detected — no `vercel.json` needed.

---

### Production deployment

Every push to `main` triggers an automatic production deployment.

```bash
git checkout main
git merge feature/my-feature
git push origin main
```

Vercel builds and promotes to production within ~60 seconds.

---

### Feature branch deployment (Preview URLs)

Every push to **any branch** (or pull request) automatically gets its own preview URL:

```
https://libreya-git-feature-my-feature-yourteam.vercel.app
```

**Workflow:**

```bash
# 1. Create and switch to a feature branch
git checkout -b feature/my-feature

# 2. Make changes, then push
git push origin feature/my-feature
```

Vercel detects the push and builds a preview deployment. The URL appears in:
- Vercel dashboard → Deployments
- GitHub PR — Vercel posts a comment with the preview link automatically

**To promote a preview to production:**

Option A — merge to main (recommended):
```bash
git checkout main
git merge feature/my-feature
git push origin main
```

Option B — promote directly in Vercel dashboard:
1. Deployments → find the preview build
2. Click the three-dot menu → **Promote to Production**

---

### Rolling back production

1. Vercel dashboard → Deployments
2. Find any previous deployment
3. Three-dot menu → **Promote to Production**

Rollback is instant — no rebuild required.

---

## Google OAuth (Supabase)

When testing OAuth on preview URLs, add the preview domain to Supabase's allow-list.

**Supabase dashboard → Authentication → URL Configuration:**

- **Site URL:** `https://yourdomain.com` (production)
- **Redirect URLs:** add each environment you need:
  ```
  https://yourdomain.com/**
  https://libreya-*.vercel.app/**
  http://localhost:3000/**
  ```

The wildcard `libreya-*.vercel.app` covers all preview branch URLs automatically.

---

## Build & Scripts

```bash
yarn dev      # local dev server (port 3000)
yarn build    # production build
yarn start    # serve the production build locally
yarn lint     # ESLint
```

---

## Project Structure

```
frontend/
├── pages/          # Next.js pages (file-based routing)
│   ├── _app.tsx    # global layout, theme, auth init
│   ├── _document.tsx # HTML shell, fonts, AdSense
│   ├── index.tsx   # homepage
│   ├── browse.tsx  # book catalogue + filters
│   ├── book/[id].tsx # reader (no layout wrapper)
│   ├── profile.tsx
│   ├── favorites.tsx
│   └── legal/[type].tsx
├── components/
│   ├── Layout.tsx  # shared nav + footer
│   └── AdBanner.tsx
├── lib/
│   ├── store-web.ts # Zustand store
│   ├── supabase.ts
│   └── api.ts
└── styles/
    └── globals.css  # CSS variables for 4 themes
```
