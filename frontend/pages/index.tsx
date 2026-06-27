import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAppStore } from '../lib/store-web';
import { FeaturedBooksRowSkeleton } from '../components/Skeleton';
import AdBanner from '../components/AdBanner';
import { AUTHOR_BIOS } from '../lib/authorBios';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Libreya',
  url: 'https://libreya.app',
  description: 'Free classic literature reading platform with over 300 public domain books.',
  author: { '@type': 'Organization', name: 'Libreya', url: 'https://libreya.app' },
  datePublished: '2024-01-15',
  dateModified: '2026-06-27',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://libreya.app/browse?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Libreya',
  url: 'https://libreya.app',
  logo: 'https://libreya.app/icon.png',
  description:
    'Libreya is a free online reading platform dedicated to making classic literature accessible to everyone, with over 300 public domain books from Project Gutenberg and Standard Ebooks.',
  sameAs: ['https://libreya.app'],
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@libreya.app',
    contactType: 'customer support',
  },
};


const BENEFITS = [
  { icon: '↻', title: 'Cross-Device Sync', desc: 'Continue reading on any device without losing your place.' },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>, title: 'Smart Favorites', desc: 'Build your personal library of favourite classics.' },
  { icon: '◷', title: 'Reading History', desc: 'Track your progress across all books.' },
  { icon: '◑', title: 'Custom Themes', desc: 'Read in light, dark, sepia, or night mode.' },
];

interface HomeProps {
  initialFeaturedBooks: Array<{ id: number; title: string; author: string; category?: string; cover_image?: string; is_featured: boolean; read_count: number; description?: string }>;
}

export default function Home({ initialFeaturedBooks }: HomeProps) {
  const storeFeaturedBooks = useAppStore((s) => s.featuredBooks);
  const fetchFeaturedBooks = useAppStore((s) => s.fetchFeaturedBooks);
  const user = useAppStore((s) => s.user);
  const [isLoading, setIsLoading] = useState(true);

  const featuredBooks = storeFeaturedBooks.length > 0 ? storeFeaturedBooks : initialFeaturedBooks;

  useEffect(() => {
    fetchFeaturedBooks().then(() => setIsLoading(false));
  }, [fetchFeaturedBooks]);

  return (
    <>
      <Head>
        <title>Libreya – Free Classic Books Online | 300+ Titles</title>
        <meta
          name="description"
          content="Read over 300 classic books for free on Libreya. Works by Jane Austen, Dostoevsky, Dickens, Shakespeare, and more — beautifully formatted, no account required."
        />
        <meta name="keywords" content="free classic books, read online, public domain literature, Project Gutenberg, classic novels, free ebooks" />
        <meta name="author" content="Libreya Editorial Team" />
        <meta property="article:modified_time" content="2026-06-28T00:00:00+00:00" />
        <link rel="preload" as="image" href="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200" />
        <link rel="canonical" href="https://libreya.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Libreya – Free Classic Books Online | 300+ Titles" />
        <meta
          property="og:description"
          content="Read over 300 classic books for free. Works by Jane Austen, Dostoevsky, Dickens, Shakespeare, and more — beautifully formatted with no subscriptions required."
        />
        <meta property="og:url" content="https://libreya.app/" />
        <meta property="og:image" content="https://libreya.app/icon.png" />
        <meta property="og:site_name" content="Libreya" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Libreya – Free Classic Books Online" />
        <meta name="twitter:description" content="Read over 300 classic books for free. No account required." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </Head>

      {/* ── HERO ── */}
      <div style={{
        backgroundColor: 'rgba(90,31,43,1)',
        backgroundImage: 'linear-gradient(rgba(20,6,11,0.62), rgba(20,6,11,0.62)), url(https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '72px 24px 80px',
        textAlign: 'center',
      }}>
        <img
          src="https://customer-assets.emergentagent.com/job_b554f1a4-c35c-4e60-a285-bdc61c896871/artifacts/0ouwazt9_Libreya%20Logo.png"
          alt="Libreya"
          fetchPriority="high"
          loading="eager"
          width={100}
          height={100}
          style={{ borderRadius: '50%', objectFit: 'cover', marginBottom: '24px', backgroundColor: '#fff' }}
        />
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.25rem)', color: '#fff',
          lineHeight: '1.2', marginBottom: '20px',
        }}>
          Classic Literature,<br />Reimagined
        </h1>
        <p style={{
          fontSize: '1.1em', color: 'rgba(255,255,255,0.85)',
          maxWidth: '540px', margin: '0 auto 36px', lineHeight: '1.8',
        }}>
          Discover over 300 timeless classics from the world's greatest authors.
          Every book is beautifully formatted and completely free to read.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/browse">
            <button style={{ backgroundColor: '#c6a75e', color: '#2b2b2b' }}>
              Explore Library
            </button>
          </Link>
          {!user && (
            <Link href="/auth">
              <button style={{ backgroundColor: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.5)' }}>
                Create Account
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ backgroundColor: 'var(--surface)', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{
          fontSize: '0.72em', fontWeight: '700', letterSpacing: '3px',
          textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '28px',
        }}>
          LIBRARY AT A GLANCE
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {[
            { number: '300+', label: 'Classics' },
            { number: '9', label: 'Genres' },
            { number: '100%', label: 'Free' },
          ].map((stat) => (
            <div key={stat.label} style={{
              backgroundColor: 'var(--bg)', borderRadius: '16px',
              padding: '28px 40px', textAlign: 'center', minWidth: '140px',
              border: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--heading)', marginBottom: '4px' }}>
                {stat.number}
              </p>
              <p style={{ fontSize: '0.95em', color: 'var(--text-secondary)', marginBottom: 0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED CLASSICS ── */}
      <div className="container" style={{ paddingTop: '48px', paddingBottom: '0' }}>
        <p style={{
          fontSize: '0.72em', fontWeight: '700', letterSpacing: '3px',
          textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px',
        }}>
          HANDPICKED FOR YOU
        </p>
        <h2 style={{ marginBottom: '24px' }}>Featured Classics</h2>

        {isLoading && featuredBooks.length === 0 ? (
          <FeaturedBooksRowSkeleton />
        ) : (
          <div className="featured-books-row" style={{
            display: 'flex', gap: '16px', overflowX: 'auto',
            paddingBottom: '12px', scrollbarWidth: 'thin', scrollbarColor: '#c6a75e transparent',
          }}>
            {featuredBooks.map((book) => (
              <Link key={book.id} href={`/book/${book.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div className="featured-classic-card" style={{
                  width: '190px', backgroundColor: 'var(--surface)',
                  borderRadius: '12px', overflow: 'hidden',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}>
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title}
                      loading="lazy" width={190} height={255}
                      style={{ width: '190px', height: '255px', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{
                      width: '190px', height: '255px', backgroundColor: 'rgba(90,31,43,1)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', padding: '16px',
                    }}>
                      <p style={{ color: '#fff', fontSize: '0.95em', textAlign: 'center', marginBottom: '8px' }}>{book.title}</p>
                      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8em', textAlign: 'center', marginBottom: 0 }}>{book.author}</p>
                    </div>
                  )}
                  <div style={{ padding: '12px' }}>
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
                      }}>{book.category}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── FEATURED AUTHORS ── */}
      <div className="container" style={{ paddingTop: '56px', paddingBottom: '0' }}>
        <h2 style={{ marginBottom: '8px' }}>Featured Authors</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.05em' }}>
          Timeless voices whose works have shaped world literature.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {Object.entries(AUTHOR_BIOS).slice(0, 5).map(([author, info], i) => (
            <div key={author} style={{
              display: 'flex', gap: '24px', alignItems: 'flex-start',
              padding: '28px 0',
              borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: 'rgba(90,31,43,1)', color: '#c6a75e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', fontWeight: '700',
              }}>
                {author.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1em', marginBottom: '4px' }}>{author}</h3>
                <p style={{ fontSize: '0.78em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  {info.nationality} · {info.years}
                </p>
                <p style={{ fontSize: '0.93em', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: 0 }}>
                  {info.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BROWSE BY GENRE ── */}
      <div className="container" style={{ paddingTop: '56px', paddingBottom: '0' }}>
        <h2 style={{ marginBottom: '8px' }}>Browse by Genre</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '1.05em' }}>
          Nine curated collections spanning the full sweep of classic literature.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { name: 'Fiction',        path: '/browse?category=Fiction',        desc: 'Novels by Austen, Tolstoy, Dickens, Dostoevsky — the cornerstones of the literary tradition.' },
            { name: 'Mystery',        path: '/browse?category=Mystery',        desc: 'Detective fiction by Conan Doyle and Poe — the genre at its most inventive.' },
            { name: 'Adventure',      path: '/browse?category=Adventure',      desc: 'Stevenson, Verne, and London — tales of exploration, survival, and discovery.' },
            { name: 'Science Fiction', path: '/browse?category=Science+Fiction', desc: 'H.G. Wells and Jules Verne — the visionary works that founded the genre.' },
            { name: 'Romance',        path: '/browse?category=Romance',        desc: 'Austen and the Brontës — love stories that are also sharp portraits of society.' },
            { name: 'Philosophy',     path: '/browse?category=Philosophy',     desc: 'Plato, Marcus Aurelius, Kant — primary texts on how to live and what to think.' },
            { name: 'Drama',          path: '/browse?category=Drama',          desc: 'Shakespeare, Ibsen, Chekhov — the plays that shaped Western theatrical tradition.' },
            { name: 'Poetry',         path: '/browse?category=Poetry',         desc: 'Homer to Whitman — epic verse, lyric collections, and the Romantic odes.' },
            { name: 'History',        path: '/browse?category=History',        desc: 'Thucydides to Gibbon — history written by those who witnessed it.' },
          ].map(g => (
            <Link key={g.name} href={g.path} style={{ textDecoration: 'none' }}>
              <div className="genre-home-card" style={{
                padding: '16px 18px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                backgroundColor: 'var(--surface)',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                height: '100%',
              }}>
                <p style={{ fontWeight: '700', fontSize: '0.95em', color: '#c6a75e', marginBottom: '6px' }}>{g.name}</p>
                <p style={{ fontSize: '0.82em', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>{g.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── EDITORIAL ── */}
      <div style={{ backgroundColor: 'var(--surface)', padding: '64px 32px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Literature That Has Stood the Test of Time</h2>
          <p style={{ lineHeight: '1.9', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Every book in the Libreya library was chosen because it has endured. These are not books that were merely
            popular in their time; they are works that continue to be read, taught, translated, and argued over because
            they say something that remains true beyond the moment of their writing. Pride and Prejudice was first
            published in 1813. Crime and Punishment appeared in 1866. The Great Gatsby in 1925. And yet readers who
            encounter any of these books for the first time today find them as immediate and involving as anything
            written yesterday.
          </p>
          <p style={{ lineHeight: '1.9', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            That endurance is not accidental. The writers represented here were working at the limits of what language
            can do — pushing fiction, drama, poetry, and philosophy toward their fullest expression. They were asking
            questions that have no final answers: How should we live? What do we owe to one another? What does it mean
            to be free, to be honest, to be good? These are our questions too. That is why Dostoevsky, writing in
            19th-century St. Petersburg, can feel like a contemporary. That is why Austen's observations on social
            performance and self-deception read like something you might have thought yourself.
          </p>
          <p style={{ lineHeight: '1.9', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Libreya presents over 300 of these works in a reading experience designed for how people actually read
            today. Every book is sourced from Project Gutenberg or Standard Ebooks — the two most trusted repositories
            of public domain literature — and formatted for comfortable, consistent reading on any screen. No
            subscription. No account required. No barrier of any kind between you and the books.
          </p>
          <p style={{ lineHeight: '1.9', color: 'var(--text-secondary)', marginBottom: '28px' }}>
            Our library spans nine genres: fiction, adventure, mystery, science fiction, romance, philosophy, drama,
            poetry, and history. Whether you are reading the classics for the first time or returning to books you
            love, the Libreya library will have something worth your time. Start with a book you have always meant to
            read, or let the browse page surface something unexpected.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/browse"><button>Browse the Library</button></Link>
            <Link href="/about">
              <button style={{ backgroundColor: 'transparent', border: '1px solid var(--heading)', color: 'var(--heading)' }}>
                Our Mission
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── AD ── */}
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '0' }}>
        <AdBanner slot="9986559126" format="horizontal" />
      </div>

      {/* ── BENEFITS ── */}
      <div style={{
        backgroundColor: 'rgba(90,31,43,1)',
        padding: '56px 24px', textAlign: 'center', marginTop: '56px',
      }}>
        <p style={{
          fontSize: '0.72em', fontWeight: '700', letterSpacing: '3px',
          textTransform: 'uppercase', color: '#c6a75e', marginBottom: '8px',
        }}>
          WHY CREATE AN ACCOUNT
        </p>
        <h2 style={{ color: '#fff', borderBottom: 'none', marginBottom: '36px' }}>Benefits for Readers</h2>
        <div style={{
          display: 'flex', justifyContent: 'center',
          flexWrap: 'wrap', gap: '16px',
          maxWidth: '900px', margin: '0 auto 36px',
        }}>
          {BENEFITS.map((b) => (
            <div key={b.title} style={{
              backgroundColor: '#fff', borderRadius: '14px',
              padding: '28px 24px', width: '210px', textAlign: 'center',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                backgroundColor: 'rgba(90,31,43,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px', fontSize: '1.3rem',
              }}>
                {b.icon}
              </div>
              <p style={{ fontSize: '0.95em', fontWeight: '600', color: '#2b2b2b', marginBottom: '6px' }}>{b.title}</p>
              <p style={{ fontSize: '0.82em', color: '#666', lineHeight: '1.6', marginBottom: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
        {!user && (
          <Link href="/auth">
            <button style={{ backgroundColor: '#c6a75e', color: '#2b2b2b' }}>Get Started Free</button>
          </Link>
        )}
      </div>

      {/* ── PHILOSOPHY ── */}
      <div style={{
        backgroundColor: 'var(--surface)',
        padding: '64px 32px', textAlign: 'center',
      }}>
        <p style={{
          fontSize: '1.25em', fontStyle: 'italic', color: 'var(--heading)',
          maxWidth: '600px', margin: '0 auto', lineHeight: '1.8',
        }}>
          "Libreya is built for intentional reading, not endless scrolling."
        </p>
        <div style={{
          width: '48px', height: '3px', backgroundColor: '#c6a75e',
          borderRadius: '2px', margin: '28px auto',
        }} />
        <p style={{
          color: 'var(--text-secondary)', maxWidth: '480px',
          margin: '0 auto 24px', lineHeight: '1.8',
        }}>
          We curate timeless literature with minimalist design, creating a calm reading
          space in a world of digital noise.
        </p>
        <Link href="/about">
          <button style={{
            backgroundColor: 'transparent', color: 'var(--heading)',
            border: '1px solid var(--heading)',
          }}>
            Learn Our Story
          </button>
        </Link>
      </div>

      {/* ── FINAL CTA ── */}
      {/*    <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>Begin Your Journey</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 28px', lineHeight: '1.8' }}>
          Join thousands of readers discovering the world's greatest literature.
        </p>
        <Link href="/browse">
          <button>Browse Library</button>
        </Link>
      </div> */}

      <style>{`
        .featured-classic-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .featured-books-row {
          justify-content: center;
          flex-wrap: wrap;
        }
        .genre-home-card:hover {
          border-color: #c6a75e !important;
          box-shadow: 0 2px 12px rgba(198,167,94,0.15);
        }
        @media (max-width: 980px) {
          .container { padding-top: 32px !important; }
          .featured-books-row {
            justify-content: flex-start;
            flex-wrap: nowrap;
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
      .eq('is_featured', true)
      .order('read_count', { ascending: false })
      .limit(10);

    return { props: { initialFeaturedBooks: data || [] } };
  } catch {
    return { props: { initialFeaturedBooks: [] } };
  }
}
