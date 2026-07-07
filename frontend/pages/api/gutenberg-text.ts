import type { NextApiRequest, NextApiResponse } from 'next';
import { formatGutenbergText } from '../../lib/gutenbergFormat';
import { requireAdmin } from '../../lib/requireAdmin';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.gutenberg.org/',
};

function candidateUrls(id: string): string[] {
  return [
    `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
    `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
    `https://www.gutenberg.org/files/${id}/${id}.txt`,
  ];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authErrorMessage = await requireAdmin(req);
  if (authErrorMessage) {
    return res.status(authErrorMessage === 'Admin privileges required' ? 403 : 401).json({ error: authErrorMessage });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string' || !/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Missing or invalid Gutenberg id param' });
  }

  let rawText: string | null = null;
  let lastError = '';

  for (const url of candidateUrls(id)) {
    try {
      const upstream = await fetch(url, { headers: BROWSER_HEADERS });
      if (upstream.ok) {
        rawText = await upstream.text();
        break;
      }
      lastError = `${url} -> ${upstream.status}`;
    } catch (err) {
      lastError = `${url} -> ${err instanceof Error ? err.message : 'fetch failed'}`;
    }
  }

  if (!rawText) {
    return res.status(502).json({ error: 'Could not fetch book text from Project Gutenberg', detail: lastError });
  }

  const formatted = formatGutenbergText(rawText);

  return res.status(200).json({
    gutenbergId: id,
    sourceUrl: `https://www.gutenberg.org/ebooks/${id}`,
    coverImage: `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`,
    title: formatted.title,
    author: formatted.author,
    html: formatted.html,
    charCount: formatted.charCount,
  });
}
