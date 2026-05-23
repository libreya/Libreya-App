import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Welcome() {
  return (
    <>
      <Head>
        <title>Welcome to Libreya</title>
        <meta name="description" content="Welcome to Libreya - Free Classic Books" />
      </Head>

      <main className="container" style={{ maxWidth: '900px' }}>
        <section style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2>Your Gateway to Classic Literature</h2>
          <p style={{ fontSize: '1.1em', color: 'var(--text-secondary)', marginTop: '15px' }}>
            Read thousands of public domain books completely free, online or offline.
          </p>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            marginBottom: '40px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>📖</div>
            <h3>Explore Thousands of Books</h3>
            <p>From classics like Pride and Prejudice to Moby Dick.</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>⚡</div>
            <h3>Fast & Simple</h3>
            <p>Clean, distraction-free reading experience on any device.</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>💰</div>
            <h3>Completely Free</h3>
            <p>No subscriptions, no hidden fees, just books.</p>
          </div>
        </div>

        <section style={{ backgroundColor: '#5a1f2b', color: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <h2>Ready to Start Reading?</h2>
          <p style={{ marginTop: '15px', marginBottom: '25px' }}>Begin your literary journey today.</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/browse">
              <button style={{ backgroundColor: 'white', color: '#5a1f2b' }}>Browse Books</button>
            </Link>
            <Link href="/auth">
              <button>Sign In / Sign Up</button>
            </Link>
          </div>
        </section>

        <section style={{ marginTop: '40px', backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '8px' }}>
          <h3>Why Libreya?</h3>
          <ul style={{ marginLeft: '20px', marginTop: '15px' }}>
            <li>Public domain books sourced from Project Gutenberg and Standard Ebooks</li>
            <li>Multiple reading themes for comfortable reading</li>
            <li>No account needed to browse</li>
            <li>Responsive design works on all devices</li>
          </ul>
        </section>
      </main>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {},
    
  };
}
