import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAppStore } from '../lib/store-web';
import { FeaturedBooksRowSkeleton } from '../components/Skeleton';
import AdBanner from '../components/AdBanner';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Libreya',
  url: 'https://libreya.app',
  description: 'Free classic literature reading platform with over 300 public domain books.',
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
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@libreya.app',
    contactType: 'customer support',
  },
};

interface AuthorInfo { nationality: string; years: string; bio: string; }

const AUTHOR_BIOS: Record<string, AuthorInfo> = {
  'Jane Austen': { nationality: 'English', years: '1775–1817', bio: 'She wrote six novels about love and life in England. Her books are known for their sharp wit and strong female characters.' },
  'Charles Dickens': { nationality: 'English', years: '1812–1870', bio: 'One of the most loved English writers of all time. His stories show the hard lives of poor people in Victorian London.' },
  'Mark Twain': { nationality: 'American', years: '1835–1910', bio: 'He was one of the most famous American writers. His book Huckleberry Finn is still read in schools around the world.' },
  'Leo Tolstoy': { nationality: 'Russian', years: '1828–1910', bio: 'He wrote War and Peace and Anna Karenina. Both are long, rich stories about life and love in Russia.' },
  'Fyodor Dostoevsky': { nationality: 'Russian', years: '1821–1881', bio: 'He wrote deep novels about crime, guilt, and faith. His stories deal with the dark side of human nature.' },
  'George Orwell': { nationality: 'British', years: '1903–1950', bio: 'He wrote Animal Farm and Nineteen Eighty-Four. Both books warn about the dangers of too much government control.' },
  'Oscar Wilde': { nationality: 'Irish', years: '1854–1900', bio: 'He was known for his quick wit and sharp humor. His plays and stories are still enjoyed all over the world.' },
  'Herman Melville': { nationality: 'American', years: '1819–1891', bio: 'He wrote Moby-Dick, a story about a sailor who hunts a great white whale. It is one of the most famous American novels ever written.' },
  'Charlotte Brontë': { nationality: 'English', years: '1816–1855', bio: 'She wrote Jane Eyre, a story about a young woman finding her place in the world. It is one of the best loved English novels.' },
  'Emily Brontë': { nationality: 'English', years: '1818–1848', bio: 'She wrote one novel, Wuthering Heights, set on the wild English moors. It is a dark and moving love story unlike any other.' },
  'Victor Hugo': { nationality: 'French', years: '1802–1885', bio: 'He wrote Les Misérables, one of the most famous French novels. It is a story about justice, love, and hope for the poor.' },
  'Gustave Flaubert': { nationality: 'French', years: '1821–1880', bio: 'He wrote Madame Bovary, a classic French novel. He was known for his careful writing and his search for the right word.' },
  'Franz Kafka': { nationality: 'Czech', years: '1883–1924', bio: 'He wrote strange stories about people trapped in odd, confusing worlds. His name is now used to describe any system that feels absurd and hard to deal with.' },
  'James Joyce': { nationality: 'Irish', years: '1882–1941', bio: 'He was one of the boldest writers of the 1900s. His most famous book, Ulysses, tells the story of one day in Dublin in great detail.' },
  'Virginia Woolf': { nationality: 'English', years: '1882–1941', bio: 'She was a key figure in modern English writing. Her books explore the inner thoughts and feelings of her characters.' },
  'F. Scott Fitzgerald': { nationality: 'American', years: '1896–1940', bio: 'He wrote The Great Gatsby, a short and famous American novel. It is a story about wealth, love, and the American Dream.' },
  'Ernest Hemingway': { nationality: 'American', years: '1899–1961', bio: 'He was known for his short, clear writing style. His stories deal with war, sport, and the search for meaning in life.' },
  'William Shakespeare': { nationality: 'English', years: '1564–1616', bio: 'He wrote 37 plays and 154 sonnets. Many people think he is the greatest writer in the English language.' },
  'Homer': { nationality: 'Greek', years: 'c. 8th century BC', bio: 'He is the poet behind the Iliad and the Odyssey. These two ancient Greek epics helped start the Western tradition of storytelling.' },
  'Dante Alighieri': { nationality: 'Italian', years: '1265–1321', bio: 'He wrote the Divine Comedy, a long poem about a journey through Hell and Heaven. It is one of the great works of world literature.' },
  'Miguel de Cervantes': { nationality: 'Spanish', years: '1547–1616', bio: 'He wrote Don Quixote, one of the first modern novels. It tells the story of a man who thinks he is a knight on a quest.' },
  'Jonathan Swift': { nationality: 'Irish', years: '1667–1745', bio: 'He wrote Gulliver\'s Travels, a story full of sharp social comment. He used humor and irony to point out the faults of his time.' },
  'Edgar Allan Poe': { nationality: 'American', years: '1809–1849', bio: 'He was one of the first great American horror writers. His dark poems and tales of terror are still widely read today.' },
  'Arthur Conan Doyle': { nationality: 'Scottish', years: '1859–1930', bio: 'He created Sherlock Holmes, the world\'s most famous fictional detective. Holmes has appeared in stories, films, and TV shows for over 100 years.' },
  'H.G. Wells': { nationality: 'English', years: '1866–1946', bio: 'He wrote some of the first great science fiction stories. The Time Machine and The War of the Worlds are among his most famous works.' },
  'Jules Verne': { nationality: 'French', years: '1828–1905', bio: 'He wrote exciting adventure stories set in the future. Books like Twenty Thousand Leagues Under the Sea were far ahead of their time.' },
  'Louisa May Alcott': { nationality: 'American', years: '1832–1888', bio: 'She wrote Little Women, a story about four sisters growing up. It is one of the most loved American novels of all time.' },
  'Thomas Hardy': { nationality: 'English', years: '1840–1928', bio: 'He wrote sad stories set in the English countryside. His novels deal with fate, love, and the limits placed on ordinary people.' },
  'Rudyard Kipling': { nationality: 'British', years: '1865–1936', bio: 'He wrote The Jungle Book and many other well known stories. He was the first English-language writer to win the Nobel Prize for Literature.' },
  'Robert Louis Stevenson': { nationality: 'Scottish', years: '1850–1894', bio: 'He wrote Treasure Island and Dr Jekyll and Mr Hyde. Both are classic stories that are still read and enjoyed today.' },
  'Jack London': { nationality: 'American', years: '1876–1916', bio: 'He wrote The Call of the Wild and other tales of survival. His stories deal with the power of nature and the will to live.' },
  'Bram Stoker': { nationality: 'Irish', years: '1847–1912', bio: 'He wrote Dracula, the most famous vampire story ever told. It set the rules for vampire fiction that writers still follow today.' },
  'Mary Shelley': { nationality: 'English', years: '1797–1851', bio: 'She wrote Frankenstein when she was just eighteen years old. It is one of the first great science fiction stories ever written.' },
};

const BENEFITS = [
  { icon: '↻', title: 'Cross-Device Sync', desc: 'Continue reading on any device without losing your place.' },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>, title: 'Smart Favorites', desc: 'Build your personal library of favourite classics.' },
  { icon: '◷', title: 'Reading History', desc: 'Track your progress across all books.' },
  { icon: '◑', title: 'Custom Themes', desc: 'Read in light, dark, sepia, or night mode.' },
];

export default function Home() {
  const featuredBooks = useAppStore((s) => s.featuredBooks);
  const fetchFeaturedBooks = useAppStore((s) => s.fetchFeaturedBooks);
  const user = useAppStore((s) => s.user);
  const [isLoading, setIsLoading] = useState(true);

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
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '24px', backgroundColor: '#fff' }}
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

        {isLoading ? (
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
  // This enables SSR for AdSense
  return {
    props: {},
  };
}
