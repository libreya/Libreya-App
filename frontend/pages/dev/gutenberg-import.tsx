import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../lib/store-web';

const CATEGORIES = [
  "Fiction", "Non-Fiction", "Poetry", "Drama", "Philosophy",
  "Science Fiction", "Adventure", "Romance", "Mystery", "Horror",
  "Biography", "History", "Children's Literature", "Classics", "Essays",
];

interface FetchResult {
  gutenbergId: string;
  sourceUrl: string;
  coverImage: string;
  title: string | null;
  author: string | null;
  html: string;
  charCount: number;
}

interface SearchResult {
  id: number;
  title: string;
  authors: string[];
}

export default function GutenbergImportPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const isLoading = useAppStore((s) => s.isLoading);

  const [searchMode, setSearchMode] = useState<'id' | 'title'>('id');
  const [gutenbergId, setGutenbergId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FetchResult | null>(null);

  const [titleQuery, setTitleQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const [title, setTitle] = useState('');
  const [alternateTitle, setAlternateTitle] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Fiction');
  const [coverImage, setCoverImage] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [html, setHtml] = useState('');

  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [pendingCreate, setPendingCreate] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !user.is_admin)) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleFetch = async (idOverride?: string) => {
    const id = (idOverride ?? gutenbergId).trim();
    if (!/^\d+$/.test(id)) {
      setError('Enter a numeric Gutenberg book id (e.g. 1342 for Pride and Prejudice).');
      return;
    }

    setGutenbergId(id);
    setLoading(true);
    setError(null);
    setResult(null);
    setSaveMessage(null);
    setAlternateTitle(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders: HeadersInit = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};

      const res = await fetch(`/api/gutenberg-text?id=${encodeURIComponent(id)}`, { headers: authHeaders });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ? `${data.error}${data.detail ? ` (${data.detail})` : ''}` : 'Fetch failed');
        return;
      }

      setResult(data);
      setTitle(data.title || '');
      setAuthor(data.author || '');
      setCoverImage(data.coverImage || '');
      setSourceUrl(data.sourceUrl || '');
      setHtml(data.html || '');

      // Best-effort - the alternate title field doesn't exist for every book.
      fetch(`/api/gutenberg-alternate-title?id=${encodeURIComponent(id)}`, { headers: authHeaders })
        .then((r) => r.json())
        .then((altData) => setAlternateTitle(altData.alternateTitle || null))
        .catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByTitle = async () => {
    const q = titleQuery.trim();
    if (!q) {
      setSearchError('Enter a title to search for.');
      return;
    }

    setSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/gutenberg-search?q=${encodeURIComponent(q)}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error ? `${data.error}${data.detail ? ` (${data.detail})` : ''}` : 'Search failed');
        return;
      }

      const results: SearchResult[] = data.results || [];
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError(`No Gutenberg books found matching "${q}".`);
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (id: number) => {
    handleFetch(String(id));
  };

  const handleSave = async () => {
    if (!title.trim() || !author.trim() || !html.trim()) {
      setSaveMessage('Title, author, and content are required before saving.');
      return;
    }

    setSaveMessage(null);
    setPendingCreate(false);

    const trimmedSourceUrl = sourceUrl.trim();
    if (!trimmedSourceUrl) {
      setPendingCreate(true);
      setSaveMessage("No source URL set, so an existing row can't be matched. Create a new book row?");
      return;
    }

    setChecking(true);
    const { data: existing, error: lookupError } = await supabase
      .from('books')
      .select('id')
      .eq('source_url', trimmedSourceUrl)
      .maybeSingle();
    setChecking(false);

    if (lookupError) {
      setSaveMessage(`Lookup failed: ${lookupError.message}`);
      return;
    }

    if (existing) {
      setSaving(true);
      const { error: updateError } = await supabase
        .from('books')
        .update({
          title: title.trim(),
          author: author.trim(),
          category,
          content_body: html,
          cover_image: coverImage || null,
        })
        .eq('id', existing.id);
      setSaving(false);

      if (updateError) {
        setSaveMessage(`Update failed: ${updateError.message}`);
        return;
      }
      setSaveMessage(`Updated existing book id ${existing.id} (title, author, category, content_body, cover_image).`);
      return;
    }

    setPendingCreate(true);
    setSaveMessage(`No existing book found for source URL "${trimmedSourceUrl}". Create a new book row?`);
  };

  const handleConfirmCreate = async () => {
    setSaving(true);
    setSaveMessage(null);

    const { data, error: insertError } = await supabase
      .from('books')
      .insert({
        title: title.trim(),
        author: author.trim(),
        content_body: html,
        category,
        cover_image: coverImage || null,
        source_url: sourceUrl.trim() || null,
        is_featured: false,
        read_count: 0,
      })
      .select('id')
      .single();

    setSaving(false);
    setPendingCreate(false);

    if (insertError) {
      setSaveMessage(`Save failed: ${insertError.message}`);
      return;
    }

    setSaveMessage(`Saved as new book id ${data.id}.`);
  };

  const handleCancelCreate = () => {
    setPendingCreate(false);
    setSaveMessage('Cancelled — no row created.');
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Gutenberg Import - Libreya</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <main className="container">
          <p>Checking access…</p>
        </main>
      </>
    );
  }

  if (!user || !user.is_admin) {
    return (
      <>
        <Head>
          <title>Gutenberg Import - Libreya</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <header>
          <h1>Gutenberg Import</h1>
          <Link href="/" style={{ color: 'white' }}>
            Back to Home
          </Link>
        </header>
        <main className="container">
          <p>Access denied. Admin privileges required.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Gutenberg Import - Libreya</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="container" style={{ maxWidth: '900px', paddingTop: '30px', paddingBottom: '80px' }}>
        <h1>Gutenberg Import</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Admin-only dev tool. Fetches the Plain Text UTF-8 edition of a Project Gutenberg book,
          strips the license boilerplate, and converts it to the <code>&lt;h2&gt;</code>/<code>&lt;p&gt;</code> HTML
          shape used by the <code>books.content_body</code> column.
        </p>

        <div style={{ display: 'flex', gap: '20px', margin: '20px 0 10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="searchMode"
              checked={searchMode === 'id'}
              onChange={() => setSearchMode('id')}
              style={{ width: 'auto', padding: 0, border: 'none', borderRadius: 0 }}
            />
            Search by ID
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="searchMode"
              checked={searchMode === 'title'}
              onChange={() => setSearchMode('title')}
              style={{ width: 'auto', padding: 0, border: 'none', borderRadius: 0 }}
            />
            Search by Title
          </label>
        </div>

        {searchMode === 'id' ? (
          <div style={{ display: 'flex', gap: '10px', margin: '10px 0 20px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Gutenberg book id, e.g. 1342"
              value={gutenbergId}
              onChange={(e) => setGutenbergId(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleFetch(); }}
              style={{ flex: '1', minWidth: '220px', padding: '10px' }}
            />
            <button onClick={() => handleFetch()} disabled={loading} style={{ padding: '10px 20px' }}>
              {loading ? 'Fetching…' : 'Fetch & Format'}
            </button>
          </div>
        ) : (
          <div style={{ margin: '10px 0 20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Book title, e.g. Pride and Prejudice"
                value={titleQuery}
                onChange={(e) => setTitleQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchByTitle(); }}
                style={{ flex: '1', minWidth: '220px', padding: '10px' }}
              />
              <button onClick={handleSearchByTitle} disabled={searching} style={{ padding: '10px 20px' }}>
                {searching ? 'Searching…' : 'Search'}
              </button>
            </div>

            {searchError && (
              <p style={{ color: '#c0392b', fontWeight: 600, marginTop: '10px' }}>{searchError}</p>
            )}

            {searchResults.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectSearchResult(r.id)}
                    disabled={loading}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                    }}
                  >
                    <strong>{r.title}</strong>
                    {r.authors.length > 0 && (
                      <span style={{ color: 'var(--text-secondary)' }}> — {r.authors.join(', ')}</span>
                    )}
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85em' }}> (id {r.id})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <p style={{ color: '#c0392b', fontWeight: 600 }}>{error}</p>
        )}

        {result && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Title
                <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '8px' }} />
                {alternateTitle && alternateTitle !== title && (
                  <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                    Alternate title on Gutenberg: <em>{alternateTitle}</em>{' '}
                    <button
                      type="button"
                      onClick={() => setTitle(alternateTitle)}
                      style={{ padding: '2px 8px', fontSize: '0.9em', minWidth: 'auto' }}
                    >
                      Use this instead
                    </button>
                  </span>
                )}
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Author
                <input value={author} onChange={(e) => setAuthor(e.target.value)} style={{ padding: '8px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Category
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '8px' }}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Cover image URL
                <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} style={{ padding: '8px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                Source URL
                <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} style={{ padding: '8px' }} />
              </label>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
              {html.length.toLocaleString()} characters formatted.
            </p>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              content_body (HTML) — editable
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                rows={12}
                style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85em' }}
              />
            </label>

            <div
              style={{
                marginTop: '16px',
                padding: '20px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                maxHeight: '300px',
                overflow: 'auto',
              }}
              dangerouslySetInnerHTML={{ __html: html.slice(0, 4000) }}
            />

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleSave} disabled={checking || saving} style={{ padding: '10px 20px' }}>
                {checking ? 'Checking…' : saving ? 'Saving…' : 'Save to Supabase'}
              </button>
              {pendingCreate && (
                <>
                  <button onClick={handleConfirmCreate} disabled={saving} style={{ padding: '10px 20px' }}>
                    {saving ? 'Creating…' : 'Create New Book Row'}
                  </button>
                  <button onClick={handleCancelCreate} disabled={saving} style={{ padding: '10px 20px' }}>
                    Cancel
                  </button>
                </>
              )}
              {saveMessage && <span>{saveMessage}</span>}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {},
  };
}
