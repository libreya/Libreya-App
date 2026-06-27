import { GetServerSideProps } from 'next';

const STATIC_PAGES = [
  { path: '',              priority: '1.0', changefreq: 'daily' },
  { path: 'browse',        priority: '0.9', changefreq: 'daily' },
  { path: 'about',         priority: '0.7', changefreq: 'monthly' },
  { path: 'faq',           priority: '0.7', changefreq: 'monthly' },
  { path: 'welcome',       priority: '0.6', changefreq: 'monthly' },
  { path: 'contact',       priority: '0.6', changefreq: 'monthly' },
  { path: 'donate',        priority: '0.5', changefreq: 'monthly' },
  { path: 'founder',       priority: '0.5', changefreq: 'monthly' },
  { path: 'legal/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: 'legal/terms',   priority: '0.3', changefreq: 'yearly' },
  { path: 'legal/legal',   priority: '0.3', changefreq: 'yearly' },
];

export default function Sitemap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = 'https://libreya.app';
  const today = new Date().toISOString().split('T')[0];

  let bookUrls = '';
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: books } = await supabaseServer
      .from('books')
      .select('id')
      .order('id', { ascending: true });

    if (Array.isArray(books)) {
      bookUrls = books.map((book: { id: number }) => `
  <url>
    <loc>${baseUrl}/book/${book.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
    }
  } catch {
    // Fall through with no book URLs rather than crashing the sitemap
  }

  const staticUrls = STATIC_PAGES.map(({ path, priority, changefreq }) => `
  <url>
    <loc>${baseUrl}/${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${bookUrls}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.write(sitemap);
  res.end();

  return { props: {} };
};
