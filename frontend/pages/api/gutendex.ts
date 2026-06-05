import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing id param' });
  }

  const upstream = await fetch(`https://gutendex.com/books/${encodeURIComponent(id)}`);

  if (!upstream.ok) {
    return res.status(upstream.status).json({ error: 'Gutendex request failed' });
  }

  const data = await upstream.json();
  res.status(200).json(data);
}
