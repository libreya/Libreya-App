import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../lib/requireAdmin';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.gutenberg.org/',
};

// The book's detail page renders its catalog "Alternate Title" field (when set)
// as <th>Alternate Title</th><td itemprop="alternativeHeadline">VALUE</td>.
const ALTERNATE_TITLE_RE = /<th>Alternate Title<\/th>\s*<td itemprop="alternativeHeadline">([\s\S]*?)<\/td>/i;

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

  const { id } = req.query;
  if (!id || typeof id !== 'string' || !/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Missing or invalid Gutenberg id param' });
  }

  const upstream = await fetch(`https://www.gutenberg.org/ebooks/${id}`, { headers: BROWSER_HEADERS });
  if (!upstream.ok) {
    return res.status(upstream.status).json({ error: 'Could not load Gutenberg book page' });
  }

  const html = await upstream.text();
  const match = html.match(ALTERNATE_TITLE_RE);

  return res.status(200).json({ alternateTitle: match ? decodeEntities(match[1]) : null });
}
