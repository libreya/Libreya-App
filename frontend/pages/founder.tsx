import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Founder() {
  return (
    <>
      <Head>
        <title>A Letter from the Founder | Libreya</title>
        <meta
          name="description"
          content="A personal letter from the founder of Libreya on why classic literature matters, what inspired the platform, and what we hope to build for readers around the world."
        />
        <link rel="canonical" href="https://libreya.app/founder" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="A Letter from the Founder | Libreya" />
        <meta
          property="og:description"
          content="Read why Libreya was built: a personal letter on classic literature, digital reading, and making the world's greatest books available to everyone."
        />
        <meta property="og:url" content="https://libreya.app/founder" />
        <meta property="og:image" content="https://libreya.app/icon.png" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <main className="container" style={{ maxWidth: '720px' }}>

        <p style={{
          fontSize: '0.8em', fontWeight: '700', letterSpacing: '2px',
          textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px',
        }}>
          A Letter from the Founder
        </p>
        <h1 style={{ fontSize: '1.9rem', marginBottom: '32px', lineHeight: '1.3' }}>
          Why I Built Libreya
        </h1>

        {/* Letter content */}
        <div style={{ lineHeight: '1.9', fontSize: '1.02em' }}>

          <p>
            I've been an avid reader for as long as I can remember. And for almost as long, I've known
            that some of the best books ever written are completely free. Public domain. No copyright.
            Available to anyone who wants them.
          </p>

          <p style={{ marginTop: '20px' }}>
            The problem is, "available" and "readable" are not the same thing.
          </p>

          <p style={{ marginTop: '20px' }}>
            I spent years using Project Gutenberg. I love what they've built — it's one of the most
            important digital archives in existence. But the experience of actually reading on the site
            never felt right to me. Plain text files. Inconsistent formatting. No chapter navigation.
            No way to save my place, change the theme, or pick up where I left off on another device.
            The books were there, but reading them felt like work.
          </p>

          <p style={{ marginTop: '20px' }}>
            Meanwhile, I watched modern reading apps charge $10, $15, sometimes $20 a month for books
            that — with a bit of research — you could find for free. The value wasn't in the books.
            It was in the reading experience. The interface. The thoughtful design that made you want
            to sit down and actually read.
          </p>

          <p style={{ marginTop: '20px' }}>
            That gap bothered me. It still does.
          </p>

          <p style={{ marginTop: '20px' }}>
            Libreya is my attempt to close it. To take the vast public domain archive and present it
            the way great books deserve to be presented: cleanly, beautifully, with the kind of
            typography and reading modes that make you want to read for hours. No subscriptions. No
            paywalls. No book you have to pay for that Dostoyevsky wrote over 150 years ago.
          </p>

          {/* Pull quote */}
          <blockquote style={{
            borderLeft: '3px solid #c6a75e',
            paddingLeft: '20px',
            margin: '32px 0',
            fontStyle: 'italic',
            color: 'var(--heading)',
            fontSize: '1.08em',
            lineHeight: '1.7',
          }}>
            "The classics aren't dusty relics. They're the closest thing we have to a conversation
            across centuries — and that conversation should be open to everyone."
          </blockquote>

          <p>
            I think about the student who can't afford a Penguin Classics paperback, but has a phone.
            The person in a country where English-language books are expensive or hard to find, but
            has an internet connection. The retiree who never had time to read Tolstoy and finally
            does. Libreya is for all of them.
          </p>

          <p style={{ marginTop: '20px' }}>
            There's something I genuinely believe: if you give someone access to Crime and Punishment,
            or Jane Eyre, or The Count of Monte Cristo — and you make that access friction-free and
            beautiful — there's a real chance they'll read it. And reading it will change something
            for them. Maybe something small. Maybe something they carry for years.
          </p>

          <p style={{ marginTop: '20px' }}>
            That's what keeps me working on this. Not the traffic numbers or the revenue. The thought
            that someone, somewhere, opened Libreya looking for something to read, and found a book
            they'll never forget.
          </p>

          <p style={{ marginTop: '20px' }}>
            We're still early. The library will grow. The features will improve. There's a long list
            of things I want to add — offline reading, user reading groups, curated reading lists by
            theme or mood, author spotlights with deeper editorial context. This is a project I
            intend to keep building.
          </p>

          <p style={{ marginTop: '20px' }}>
            If you've found Libreya useful, or if a book here has meant something to you, I'd love
            to hear about it. And if you want to support what we're doing, you can{' '}
            <Link href="/donate">make a small donation</Link> — every bit genuinely helps.
          </p>

          <p style={{ marginTop: '20px' }}>
            Thank you for reading. And thank you for reading.
          </p>

          <p style={{ marginTop: '32px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            — The Libreya Team
          </p>
        </div>

        {/* What we're building */}
        <section style={{
          marginTop: '56px',
          backgroundColor: 'var(--surface)',
          padding: '28px',
          borderRadius: '10px',
        }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>What We're Building Toward</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px' }}>
            Libreya is a living project. Here's a glimpse at what's on the roadmap:
          </p>
          <ul style={{ marginLeft: '20px', lineHeight: '1.9', color: 'var(--text-secondary)' }}>
            <li>Offline reading support so you can read without a connection</li>
            <li>Curated reading lists: "If you liked X, try Y"</li>
            <li>Author spotlight pages with literary context and recommended reading orders</li>
            <li>Book download in EPUB and PDF formats</li>
            <li>Community reading groups for shared classics</li>
            <li>A growing library — we add new titles regularly</li>
          </ul>
        </section>

        <div style={{ display: 'flex', gap: '12px', marginTop: '40px', flexWrap: 'wrap' }}>
          <Link href="/browse">
            <button>Browse the Library</button>
          </Link>
          <Link href="/about">
            <button style={{ backgroundColor: 'transparent', border: '1px solid var(--heading)', color: 'var(--heading)' }}>
              About Libreya
            </button>
          </Link>
        </div>

      </main>
    </>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
