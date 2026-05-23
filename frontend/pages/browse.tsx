import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAppStore } from '../lib/store-web';
import { api } from '../lib/api';
import { BrowseGridSkeleton } from '../components/Skeleton';

export default function Browse() {
  const books = useAppStore((s) => s.books);
  const fetchBooks = useAppStore((s) => s.fetchBooks);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [, catsData] = await Promise.all([
          fetchBooks(),
          api.post('/books/categories/list'),
        ]);
        if (Array.isArray(catsData)) setCategories(catsData);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        await fetchBooks({
          category: selectedCategory ?? undefined,
          search: searchTerm.trim() || undefined,
        });
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchTerm, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  return (
    <>
      <Head>
        <title>Browse Books - Libreya</title>
        <meta name="description" content="Browse thousands of classic books on Libreya" />
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
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
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
            onClick={() => setSelectedCategory(cat)}
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
                onClick={() => { setSelectedCategory(cat); setGenreMenuOpen(false); }}
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
  return { props: {} };
}
