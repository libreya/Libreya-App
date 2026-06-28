import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing id param' });
  }

  const upstream = await fetch(`https://gutendex.com/books/${encodeURIComponent(id)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/json, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://gutendex.com/',
    },
  });

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => '');
    return res.status(upstream.status).json({ error: 'Gutendex request failed', detail: body.slice(0, 200) });
  }

  const data = await upstream.json();
  res.status(200).json(data);
}
