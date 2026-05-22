import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppStore } from '../lib/store-web';

export default function FavoritesPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const favorites = useAppStore((s) => s.favorites);
  const fetchFavorites = useAppStore((s) => s.fetchFavorites);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        await fetchFavorites();
      } else {
        router.push('/auth');
      }
      setIsLoading(false);
    };
    loadFavorites();
  }, [user, fetchFavorites, router]);

  return (
    <>
      <Head>
        <title>My Favorites - Libreya</title>
        <meta name="description" content="Your favorite books on Libreya" />
      </Head>

      <main className="container">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div className="spinner" style={{ margin: '0 auto', width: '40px', height: '40px' }}></div>
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Loading your favorites...</p>
          </div>
        ) : !isLoading && favorites.length > 0 ? (
          <>
            <section style={{ marginBottom: '50px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '30px',
                marginTop: '30px'
              }}>
                {favorites.map((book) => (
                  <Link key={book.id} href={`/book/${book.id}`}>
                    <div
                      className="card"
                      style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {book.cover_image && (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          style={{
                            width: '100%',
                            height: '280px',
                            objectFit: 'cover',
                            marginBottom: '15px',
                            borderRadius: '6px',
                            border: '2px solid #c6a75e'
                          }}
                        />
                      )}
                      <h3 style={{ fontSize: '1.1em', marginBottom: '8px', flex: 1 }}>{book.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em', marginBottom: '12px' }}>{book.author}</p>
                      {book.read_count && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85em' }}>
                          {book.read_count} readers
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>No Favorites Yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.1em' }}>
              Start exploring and add books to your favorites to see them here!
            </p>
            <Link href="/browse">
              <button style={{ backgroundColor: '#c6a75e', color: '#2b2b2b', padding: '12px 24px', fontSize: '1em' }}>
                Browse Books
              </button>
            </Link>
          </div>
        )}

        <style>{`
          @media (max-width: 768px) {
            div[style*="gridTemplateColumns: 'repeat(auto-fill, minmax(220px"] {
              grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
              gap: 15px !important;
            }
          }

          @media (max-width: 480px) {
            div[style*="gridTemplateColumns: 'repeat(auto-fill, minmax(220px"] {
              grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
              gap: 10px !important;
            }

            section {
              margin-bottom: 20px !important;
            }

            h1 {
              font-size: 1.5em;
            }
          }
        `}</style>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}
