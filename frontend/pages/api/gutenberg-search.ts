import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../lib/requireAdmin';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.gutenberg.org/',
};

// gutenberg.org's own site search matches both the official title and any
// "Alternate Title" catalog field (Gutendex's API only matches the official
// title, so it can't find a book by an alternate title alone). Each result is
// a <li class="booklink"> block with the ebook id, title, and author.
const BOOKLINK_RE = /<li class="booklink">[\s\S]*?href="\/ebooks\/(\d+)"[\s\S]*?<span class="title">([\s\S]*?)<\/span>(?:\s*<span class="subtitle">([\s\S]*?)<\/span>)?/g;

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authErrorMessage = await requireAdmin(req);
  if (authErrorMessage) {
    return res.status(authErrorMessage === 'Admin privileges required' ? 403 : 401).json({ error: authErrorMessage });
  }

  const { q } = req.query;
  if (!q || typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({ error: 'Missing q (search) param' });
  }

  const upstream = await fetch(`https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(q.trim())}`, {
    headers: BROWSER_HEADERS,
  });

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => '');
    return res.status(upstream.status).json({ error: 'Gutenberg search failed', detail: body.slice(0, 200) });
  }

  const html = await upstream.text();
  const results: { id: number; title: string; authors: string[] }[] = [];

  for (const match of html.matchAll(BOOKLINK_RE)) {
    const [, idStr, rawTitle, rawAuthor] = match;
    results.push({
      id: parseInt(idStr, 10),
      title: decodeEntities(rawTitle),
      authors: rawAuthor ? [decodeEntities(rawAuthor)] : [],
    });
    if (results.length >= 20) break;
  }

  return res.status(200).json({ results });
}
