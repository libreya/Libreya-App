import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const GENRES = [
  { name: 'Adventure', icon: '⛵', description: 'Tales of exploration and survival — Treasure Island, Moby-Dick, The Count of Monte Cristo.' },
  { name: 'Biography', icon: '✍️', description: 'Lives of great figures — scientists, rulers, artists — told by those who witnessed them.' },
  { name: "Children's Literature", icon: '🐇', description: 'Beloved classics by Carroll, Barrie, Baum, and others that enchant readers of all ages.' },
  { name: 'Fiction', icon: '📚', description: 'Novels and novellas from the Western and world literary canon — from Tolstoy to Austen.' },
  { name: 'History', icon: '🏺', description: 'Historical chronicles and first-hand accounts that document the sweep of human civilization.' },
  { name: 'Horror', icon: '🕯️', description: 'Stories of fear and the uncanny — Poe, Stoker, Shelley, and the founders of the genre.' },
  { name: 'Mystery', icon: '🔍', description: 'Foundational detective fiction — Sherlock Holmes, Agatha Christie-era classics and beyond.' },
  { name: 'Poetry', icon: '🖊', description: 'Verse collections from the most celebrated poets — Homer, Dante, Keats, Whitman, and more.' },
  { name: 'Romance', icon: '💌', description: 'Classic love stories and courtship narratives from Jane Austen to the Brontë sisters.' },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Browse the Library',
    description: 'Search by title, author, or genre. Filter by category to discover books you\'ve never heard of alongside the classics you already know.',
  },
  {
    step: '2',
    title: 'Start Reading',
    description: 'Open any book and begin reading immediately — no account required. Choose your preferred reading theme: light, sepia, dark, or night.',
  },
  {
    step: '3',
    title: 'Save Your Progress',
    description: 'Create a free account to save your reading position, build a favorites list, and sync your progress across all your devices.',
  },
];

export default function Welcome() {
  return (
    <>
      <Head>
        <title>Welcome to Libreya – Your Free Classic Literature Library</title>
        <meta
          name="description"
          content="Welcome to Libreya. Discover over 300 classic books from the world's greatest authors — free to read, beautifully formatted, with no subscriptions or sign-up required."
        />
        <link rel="canonical" href="https://libreya.app/welcome" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Welcome to Libreya – Your Free Classic Literature Library" />
        <meta
          property="og:description"
          content="Discover over 300 classic books from the world's greatest authors — free to read, beautifully formatted, no subscriptions required."
        />
        <meta property="og:url" content="https://libreya.app/welcome" />
        <meta property="og:image" content="https://libreya.app/icon.png" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <main className="container" style={{ maxWidth: '900px' }}>

        {/* Hero */}
        <section style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '16px', lineHeight: '1.3' }}>
            Your Gateway to Classic Literature
          </h1>
          <p style={{ fontSize: '1.1em', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 28px', lineHeight: '1.8' }}>
            Libreya is a free reading platform with over 300 classic books, beautifully formatted
            for modern screens. No subscription. No sign-up required. Just great literature.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/browse">
              <button>Browse the Library</button>
            </Link>
            <Link href="/auth">
              <button style={{ backgroundColor: 'transparent', border: '1px solid var(--heading)', color: 'var(--heading)' }}>
                Create Free Account
              </button>
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section style={{
          display: 'flex', justifyContent: 'center', gap: '16px',
          flexWrap: 'wrap', marginBottom: '56px',
        }}>
          {[
            { number: '300+', label: 'Classic Books' },
            { number: '9', label: 'Genres' },
            { number: '4', label: 'Reading Themes' },
            { number: '100%', label: 'Free to Read' },
          ].map((stat) => (
            <div key={stat.label} style={{
              backgroundColor: 'var(--surface)', borderRadius: '12px',
              padding: '24px 32px', textAlign: 'center',
              border: '1px solid var(--border)', minWidth: '130px',
            }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--heading)', marginBottom: '4px' }}>
                {stat.number}
              </p>
              <p style={{ fontSize: '0.88em', color: 'var(--text-secondary)', margin: 0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', textAlign: 'center' }}>How It Works</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Getting started takes less than a minute.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: 'rgba(90,31,43,1)', color: '#c6a75e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', marginBottom: '14px', fontSize: '0.95em',
                }}>
                  {step.step}
                </div>
                <h3 style={{ fontSize: '1em', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.93em', lineHeight: '1.7', margin: 0 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Genres */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', textAlign: 'center' }}>Nine Genres to Explore</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
            From ancient philosophy to Victorian mysteries — there's something for every reader.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '14px',
          }}>
            {GENRES.map((genre) => (
              <Link key={genre.name} href={`/browse?genre=${encodeURIComponent(genre.name)}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '18px 20px',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}>
                  <p style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{genre.icon}</p>
                  <p style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--heading)', fontSize: '0.97em' }}>
                    {genre.name}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85em', lineHeight: '1.6', margin: 0 }}>
                    {genre.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ marginBottom: '56px', backgroundColor: 'var(--surface)', padding: '32px', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Everything You Need to Read Well</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {[
              { title: 'Four Reading Themes', desc: 'Light, sepia, dark, and night modes for any time of day.' },
              { title: 'Chapter Navigation', desc: 'Jump directly to any chapter without scrolling the full text.' },
              { title: 'Adjustable Font Size', desc: 'Increase or decrease text size to your personal preference.' },
              { title: 'Reading Progress Sync', desc: 'Your position is saved automatically across all devices.' },
              { title: 'Favorites List', desc: 'Build your own personal reading list of books to return to.' },
              { title: 'No Account to Browse', desc: 'Explore and read without creating an account.' },
            ].map((feature) => (
              <div key={feature.title} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: '#c6a75e', fontSize: '1rem', marginTop: '2px', flexShrink: 0 }}>✓</span>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '2px', fontSize: '0.93em' }}>{feature.title}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85em', lineHeight: '1.6', margin: 0 }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{
          backgroundColor: 'rgba(90,31,43,1)',
          padding: '40px', borderRadius: '12px',
          textAlign: 'center', marginBottom: '20px',
        }}>
          <h2 style={{ color: '#fff', borderBottom: 'none', marginBottom: '12px' }}>
            Ready to Start Reading?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '24px', lineHeight: '1.7' }}>
            Join thousands of readers discovering the world's greatest literature — for free.
          </p>
          <Link href="/browse">
            <button style={{ backgroundColor: '#c6a75e', color: '#2b2b2b' }}>Browse All Books</button>
          </Link>
        </section>

      </main>
    </>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
