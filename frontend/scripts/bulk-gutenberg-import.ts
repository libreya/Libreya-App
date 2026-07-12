/**
 * Bulk Gutenberg import
 * Automates what the admin "Gutenberg Import" tool (pages/dev/gutenberg-import.tsx)
 * does one book at a time: for every existing book whose source_url points at a
 * Project Gutenberg ebook, re-fetch the Plain Text edition, reformat it with the
 * same lib/gutenbergFormat.ts pipeline the site uses, and update title/author/
 * content_body/cover_image in place. Books with id 1-30 are skipped.
 *
 * Bypasses the admin-only RLS write policy with the Supabase service role key
 * directly (no Supabase Auth session available outside the browser), so it
 * talks to Supabase straight instead of going through the Next.js API routes.
 *
 * Usage (run from frontend/):
 *   npx tsx scripts/bulk-gutenberg-import.ts [--dry-run] [--delay=0.5]
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in frontend/.env.local (gitignored, never
 * commit it) - get it from the Supabase dashboard -> Project Settings -> API.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { formatGutenbergText } from '../lib/gutenbergFormat';

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), '.env.local'));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
    'The books table only allows admin writes under RLS (checked via auth.uid()), and ' +
    'this script has no Supabase Auth session, so add SUPABASE_SERVICE_ROLE_KEY ' +
    '(Supabase dashboard -> Project Settings -> API) to frontend/.env.local before running.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Mirrors pages/api/gutenberg-text.ts exactly, so re-imported books end up in the
// same shape as ones imported through the admin UI.
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

async function fetchGutenbergText(id: string): Promise<string | null> {
  for (const url of candidateUrls(id)) {
    try {
      const res = await fetch(url, { headers: BROWSER_HEADERS });
      if (res.ok) return await res.text();
    } catch {
      // try next mirror
    }
  }
  return null;
}

const GUTENBERG_ID_RE = /gutenberg\.org\/ebooks\/(\d+)/i;

function extractGutenbergId(sourceUrl: string | null): string | null {
  if (!sourceUrl) return null;
  const match = sourceUrl.match(GUTENBERG_ID_RE);
  return match ? match[1] : null;
}

interface BookRow {
  id: number;
  title: string;
  author: string;
  source_url: string | null;
}

const PAGE_SIZE = 500;

// The admin tool's manual workflow re-imports one book at a time by id; this
// automates that across the whole table except ids 1-30, which are excluded
// on purpose (already curated/verified).
const EXCLUDED_MAX_ID = 30;

async function fetchTargetBooks(): Promise<BookRow[]> {
  const books: BookRow[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('books')
      .select('id, title, author, source_url')
      .gt('id', EXCLUDED_MAX_ID)
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    books.push(...(data as BookRow[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return books;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const delayArg = args.find((a) => a.startsWith('--delay='));
  const delayMs = delayArg ? Number(delayArg.split('=')[1]) * 1000 : 500;

  console.log(`Fetching books with id > ${EXCLUDED_MAX_ID} from Supabase...`);
  const books = await fetchTargetBooks();
  console.log(`Found ${books.length} books to process.\n`);

  let updated = 0;
  let skippedNoId = 0;
  let skippedNoText = 0;
  let failed = 0;

  for (const book of books) {
    const gutenbergId = extractGutenbergId(book.source_url);
    if (!gutenbergId) {
      console.log(`Skipping '${book.title}' (id ${book.id}): no Gutenberg id in source_url`);
      skippedNoId++;
      continue;
    }

    const rawText = await fetchGutenbergText(gutenbergId);
    if (!rawText) {
      console.log(`Skipping '${book.title}' (#${gutenbergId}): couldn't fetch text from Project Gutenberg`);
      skippedNoText++;
      await sleep(delayMs);
      continue;
    }

    const formatted = formatGutenbergText(rawText);
    const coverImage = `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.cover.medium.jpg`;

    if (dryRun) {
      console.log(`Would update '${book.title}' (#${gutenbergId}): ${formatted.charCount.toLocaleString()} chars`);
      updated++;
      await sleep(delayMs);
      continue;
    }

    const { error } = await supabase
      .from('books')
      .update({
        title: formatted.title || book.title,
        author: formatted.author || book.author,
        content_body: formatted.html,
        cover_image: coverImage,
      })
      .eq('id', book.id);

    if (error) {
      console.log(`  - Failed to update book ${book.id}: ${error.message}`);
      failed++;
    } else {
      console.log(`Updated '${book.title}' (#${gutenbergId}): ${formatted.charCount.toLocaleString()} chars`);
      updated++;
    }

    await sleep(delayMs);
  }

  console.log('\nDone.');
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (no Gutenberg id): ${skippedNoId}`);
  console.log(`  Skipped (text unavailable): ${skippedNoText}`);
  console.log(`  Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
