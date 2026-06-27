import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAppStore } from '../lib/store-web';
import { Book } from '../lib/store-web';
import { api } from '../lib/api';
import { BrowseGridSkeleton } from '../components/Skeleton';
import AdBanner from '../components/AdBanner';

interface BrowseProps {
  initialBooks: Book[];
}

export default function Browse({ initialBooks }: BrowseProps) {
  const storeBooks = useAppStore((s) => s.books);
  // Use store books once they load; fall back to SSR books on first render
  const books = storeBooks.length > 0 ? storeBooks : initialBooks;
  const fetchBooks = useAppStore((s) => s.fetchBooks);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInput, setHasInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [, catsData] = await Promise.all([
          fetchBooks(),
          api.get('/books/categories/list'),
        ]);
        if (Array.isArray(catsData)) setCategories(catsData);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const nowHasInput = value.length > 0;
    if (nowHasInput !== hasInput) setHasInput(nowHasInput);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearchTerm(value);
      setIsSearching(true);
      try {
        await fetchBooks({
          category: selectedCategory ?? undefined,
          search: value.trim() || undefined,
        });
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleCategoryChange = async (cat: string | null) => {
    setSelectedCategory(cat);
    setGenreMenuOpen(false);
    setIsSearching(true);
    try {
      await fetchBooks({
        category: cat ?? undefined,
        search: inputRef.current?.value.trim() || undefined,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (inputRef.current) inputRef.current.value = '';
    setHasInput(false);
    setSearchTerm('');
    setSelectedCategory(null);
    fetchBooks();
  };

  return (
    <>
      <Head>
        <title>Browse Classic Books – Free Online Library | Libreya</title>
        <meta
          name="description"
          content="Browse over 300 classic books on Libreya. Search by title, author, or genre — Fiction, Mystery, Adventure, Romance, Science Fiction, Philosophy, and more. Free to read."
        />
        <link rel="canonical" href="https://libreya.app/browse" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Browse Classic Books – Free Online Library | Libreya" />
        <meta property="og:description" content="Browse over 300 free classic books by title, author, or genre on Libreya." />
        <meta property="og:url" content="https://libreya.app/browse" />
        <meta property="og:image" content="https://libreya.app/icon.png" />
        <meta name="twitter:card" content="summary" />
      </Head>

      {/* Hero */}
      <div style={{
        backgroundColor: 'rgba(90, 31, 43, 1.00)',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '8px', fontWeight: '700' }}>
          Browse Library
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', marginBottom: '24px' }}>
          Discover timeless classics from the world&apos;s greatest authors
        </p>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: searchFocused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '12px 16px',
          maxWidth: '500px',
          margin: '0 auto',
          gap: '10px',
          border: `2px solid ${searchFocused ? '#c6a75e' : 'transparent'}`,
          transition: 'border-color 0.2s, background-color 0.2s',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={searchFocused ? '#c6a75e' : 'rgba(255,255,255,0.6)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by title or author..."
            onChange={handleInputChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '1rem',
            }}
          />
          {hasInput && (
            <button
              onClick={() => {
                if (inputRef.current) inputRef.current.value = '';
                setHasInput(false);
                if (searchTimer.current) clearTimeout(searchTimer.current);
                setSearchTerm('');
                fetchBooks({ category: selectedCategory ?? undefined });
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
              aria-label="Clear search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          )}
          {isSearching && (
            <div style={{
              width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#c6a75e', borderRadius: '50%', animation: 'spin 0.7s linear infinite',
            }} />
          )}
        </div>
      </div>

      {/* Genre — desktop chips */}
      <div className="genre-desktop" style={{
        backgroundColor: 'rgba(90, 31, 43, 1.00)',
        padding: '10px 16px',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {[null, ...categories].map((cat) => (
          <button
            key={cat ?? 'all'}
            onClick={() => handleCategoryChange(cat)}
            style={{
              padding: '6px 16px', borderRadius: '20px', whiteSpace: 'nowrap',
              border: `1px solid ${selectedCategory === cat ? '#2b2b2b' : 'rgba(255,255,255,0.25)'}`,
              backgroundColor: selectedCategory === cat ? '#2b2b2b' : 'transparent',
              color: selectedCategory === cat ? '#c6a75e' : 'rgba(255,255,255,0.75)',
              fontWeight: selectedCategory === cat ? '600' : '400',
              fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {cat ?? 'All'}
          </button>
        ))}
      </div>

      {/* Genre — mobile burger */}
      <div className="genre-mobile" style={{ backgroundColor: 'rgba(90, 31, 43, 1.00)', position: 'relative' }}>
        <button
          onClick={() => setGenreMenuOpen(!genreMenuOpen)}
          style={{
            width: '100%', padding: '12px 16px', background: 'none', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            color: 'white', fontSize: '0.9rem', cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <span>Genre{selectedCategory ? `: ${selectedCategory}` : ''}</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            style={{ transform: genreMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {genreMenuOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            backgroundColor: '#3a1018', borderTop: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}>
            {[null, ...categories].map((cat) => (
              <button
                key={cat ?? 'all'}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  width: '100%', padding: '13px 20px', background: 'none', border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  textAlign: 'left', cursor: 'pointer',
                  color: selectedCategory === cat ? '#c6a75e' : 'rgba(255,255,255,0.8)',
                  fontWeight: selectedCategory === cat ? '600' : '400',
                  fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                {cat ?? 'All'}
                {selectedCategory === cat && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c6a75e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="container">
        {/* Results count */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
          {isLoading ? 'Loading...' : (
            <>
              {books.length} book{books.length !== 1 ? 's' : ''} found
              {searchTerm ? ` for "${searchTerm}"` : ''}
              {selectedCategory ? ` in ${selectedCategory}` : ''}
            </>
          )}
        </p>

        <AdBanner slot="9986559126" format="horizontal" style={{ margin: '0 0 24px' }} />

        {isLoading ? (
          <BrowseGridSkeleton />
        ) : books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h2 style={{ fontSize: '1.375rem', color: 'var(--text)', marginBottom: '8px' }}>No Books Found</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 20px', lineHeight: '1.6' }}>
              {searchTerm
                ? `We couldn't find any books matching "${searchTerm}". Try a different search term.`
                : 'No books available in this category yet.'}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '1px solid #2b2b2b',
                  backgroundColor: 'transparent',
                  color: '#2b2b2b',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
              gap: '20px',
            }}
          >
            {books.map((book) => (
              <Link key={book.id} href={`/book/${book.id}`} style={{ textDecoration: 'none' }}>
                <div className="browse-book-card" style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      style={{ width: '100%', height: '255px', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '255px',
                      backgroundColor: 'rgba(90,31,43,1)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', padding: '16px',
                    }}>
                      <p style={{ color: '#fff', fontSize: '0.95em', textAlign: 'center', marginBottom: '8px' }}>{book.title}</p>
                      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8em', textAlign: 'center', marginBottom: 0 }}>{book.author}</p>
                    </div>
                  )}
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{
                      fontSize: '0.9em', fontWeight: '600', color: 'var(--text)',
                      marginBottom: '4px', lineHeight: '1.3',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {book.title}
                    </p>
                    <p style={{ fontSize: '0.78em', color: 'var(--text-secondary)', marginBottom: '8px' }}>{book.author}</p>
                    {book.category && (
                      <span style={{
                        fontSize: '0.7em', color: '#c6a75e',
                        backgroundColor: 'rgba(198,167,94,0.12)',
                        border: '1px solid rgba(198,167,94,0.35)',
                        borderRadius: '4px', padding: '2px 8px', fontWeight: '500',
                        alignSelf: 'flex-start', marginTop: 'auto',
                      }}>
                        {book.category}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      {/* Editorial section — always visible to search engines */}
      <div style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', marginTop: '40px', padding: '48px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Why Read Classic Literature?</h2>
          <p style={{ lineHeight: '1.9', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            The books in this library have endured for a reason. A novel written 150 years ago can illuminate a feeling
            you had this morning. The works of Austen, Tolstoy, Dickens, Dostoevsky, and their contemporaries were not
            written as historical artifacts — they were written for readers exactly like us: people trying to understand
            love, ambition, justice, and what it means to live well. That they still do this so powerfully is not
            coincidence. It is the definition of great literature.
          </p>
          <p style={{ lineHeight: '1.9', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            Libreya makes over 300 of these works freely available in a modern, comfortable reading experience. Every
            book is sourced from Project Gutenberg or Standard Ebooks — the two most trusted repositories of public
            domain literature — and carefully formatted for reading on any screen. No subscription, no account
            required. Just the books.
          </p>

          <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Explore by Genre</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {[
              { name: 'Fiction', desc: 'Novels and novellas that shaped how we understand human nature — Austen, Tolstoy, Dickens, Dostoevsky, and more.' },
              { name: 'Adventure', desc: 'Tales of exploration, survival, and discovery by Stevenson, Verne, London, and the writers who defined the genre.' },
              { name: 'Mystery', desc: 'The foundational detective fiction of Conan Doyle, Poe, and others — the genre at its freshest and most inventive.' },
              { name: 'Science Fiction', desc: 'Early visionary works by H.G. Wells and Jules Verne that laid the foundation for the entire genre.' },
              { name: 'Romance', desc: 'Classic love stories from Austen, the Brontës, and others — sharp social portraits as much as love stories.' },
              { name: 'Philosophy', desc: 'Primary texts from Plato, Marcus Aurelius, Hume, Kant, and others — essential thinking on how to live.' },
              { name: 'Drama', desc: 'Plays by Shakespeare, Ibsen, Chekhov, and the great theatrical voices of the literary tradition.' },
              { name: 'Poetry', desc: 'Verse from Homer to Whitman — epic poetry, lyric collections, and the works that defined literary traditions.' },
              { name: 'History', desc: 'Historical chronicles from Thucydides to Gibbon — events recorded by the people who witnessed them.' },
            ].map(genre => (
              <div key={genre.name} style={{
                padding: '16px 20px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                backgroundColor: 'var(--bg)',
              }}>
                <p style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--heading)' }}>{genre.name}</p>
                <p style={{ fontSize: '0.88em', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>{genre.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>About the Libreya Library</h2>
            <p style={{ lineHeight: '1.9', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              All books on Libreya are sourced from Project Gutenberg, the world's oldest digital library founded in
              1971, and Standard Ebooks, which produces carefully typeset modern editions of public domain texts.
              Every work is in the public domain — legally free to read, share, and redistribute. We do not offer
              books that are still under copyright, and we do not offer abridged or condensed versions. Every book
              is the complete, unaltered original text.
            </p>
            <p style={{ lineHeight: '1.9', color: 'var(--text-secondary)', marginBottom: 0 }}>
              Our curation focuses on works of lasting literary significance — books that have shaped culture, defined
              genres, or stood the test of time as enduring works of art. The library currently spans nine genres and
              includes fiction, drama, poetry, philosophy, adventure, mystery, science fiction, romance, and history.
              New titles are added regularly. If there is a classic you would like to see added, contact us at
              hello@libreya.app.
            </p>
          </div>

        </div>
      </div>

      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .browse-book-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .container { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }

        div[style*="overflowX"]::-webkit-scrollbar { display: none; }

        .genre-desktop { display: flex; }
        .genre-mobile { display: none; }

        @media (max-width: 768px) {
          .container { padding: 16px 12px; }
          .genre-desktop { display: none !important; }
          .genre-mobile { display: block; }
        }

        @media (max-width: 480px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabaseServer
      .from('books')
      .select('id, title, author, category, cover_image, is_featured, read_count, description')
      .order('read_count', { ascending: false })
      .limit(50);

    return { props: { initialBooks: data || [] } };
  } catch {
    return { props: { initialBooks: [] } };
  }
}
