import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Libreya',
  url: 'https://libreya.app',
  logo: 'https://libreya.app/icon.png',
  description:
    'Libreya is a free online reading platform dedicated to making classic literature accessible to everyone, featuring over 300 public domain books from Project Gutenberg and Standard Ebooks.',
  sameAs: ['https://libreya.app'],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@libreya.app',
    contactType: 'customer support',
  },
};

export default function About() {
  return (
    <>
      <Head>
        <title>About Libreya – Free Classic Literature for Everyone</title>
        <meta
          name="description"
          content="Learn about Libreya's mission to make classic literature freely accessible. Discover how we source, curate, and present over 300 timeless books from Project Gutenberg and Standard Ebooks."
        />
        <meta name="author" content="Libreya Editorial Team" />
        <meta property="article:published_time" content="2024-01-15T00:00:00+00:00" />
        <meta property="article:modified_time" content="2026-06-28T00:00:00+00:00" />
        <link rel="canonical" href="https://libreya.app/about" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About Libreya – Free Classic Literature for Everyone" />
        <meta
          property="og:description"
          content="Libreya is a free online reading platform with over 300 classic books, beautifully formatted for modern screens. No subscriptions, no barriers — just great literature."
        />
        <meta property="og:url" content="https://libreya.app/about" />
        <meta property="og:image" content="https://libreya.app/icon.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="About Libreya – Free Classic Literature for Everyone" />
        <meta
          name="twitter:description"
          content="Libreya is a free online reading platform with over 300 classic books, beautifully formatted for modern screens."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </Head>

      <main className="container" style={{ maxWidth: '800px' }}>

        {/* Mission */}
        <section style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>About Libreya</h1>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Our Mission</h2>
          <p>
            Libreya exists to make the world's greatest literature freely accessible to everyone.
            We believe a great novel should be available to any curious reader — whether they are a
            student on a limited budget, a lifelong book lover, or someone discovering the classics
            for the very first time. Financial barriers should never stand between a person and a
            great story.
          </p>
          <p style={{ marginTop: '12px' }}>
            Classic literature shaped philosophy, science, culture, and language. Works by Jane Austen,
            Fyodor Dostoevsky, Mark Twain, and hundreds of other authors remain as relevant today as
            when they were first published. Libreya is our answer to the question: what would it look
            like if reading these books was as effortless and enjoyable as any modern digital experience?
          </p>
        </section>

        {/* Our Story */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Our Story</h2>
          <p>
            Libreya began as a personal frustration. Public domain books were technically free, but the
            reading experience was rarely pleasant — inconsistent formatting, outdated interfaces, cluttered
            layouts, and no way to track your progress or pick up where you left off. The content was great;
            the presentation was not.
          </p>
          <p style={{ marginTop: '12px' }}>
            We set out to fix that. The goal was simple: take the vast archive of public domain literature
            and present it with the same care and attention to detail you would expect from a modern reading
            app. Beautiful typography, multiple reading themes, chapter navigation, reading history, and a
            clean interface that gets out of the way of the reading itself.
          </p>
          <p style={{ marginTop: '12px' }}>
            Today, Libreya offers over 300 carefully formatted classic books, spanning nine genres and dozens
            of authors from around the world. Every book has been processed, cleaned, and formatted for
            comfortable reading on any screen.
          </p>
        </section>

        {/* Content Sources */}
        <section style={{ marginBottom: '48px', backgroundColor: 'var(--surface)', padding: '28px', borderRadius: '10px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Where Our Books Come From</h2>
          <p>
            All books on Libreya are sourced from two trusted repositories of public domain literature:
          </p>
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>Project Gutenberg</h3>
            <p>
              Founded in 1971 by Michael Hart, Project Gutenberg is the world's oldest digital library
              and one of its most respected. It houses over 70,000 freely available e-books, all in the
              public domain. Every text on Project Gutenberg has been verified to be free of copyright
              restrictions in the United States. We draw from this archive for the breadth of its
              collection and the reliability of its copyright verification.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>Standard Ebooks</h3>
            <p>
              Standard Ebooks takes public domain texts and produces carefully typeset, modern e-book
              editions. Their volunteer team corrects scanning errors, applies consistent formatting,
              and ensures each edition meets high typographic standards. Where Standard Ebooks editions
              are available, we prefer them for their superior formatting and readability.
            </p>
          </div>
          <p style={{ marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.9em' }}>
            All works offered on Libreya are in the public domain or licensed under Creative Commons terms
            that permit free redistribution. We do not offer books that are still under copyright.
          </p>
        </section>

        {/* Curation */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>How We Curate Our Library</h2>
          <p>
            Not every public domain text makes it onto Libreya. We focus on works of lasting literary
            significance — books that have influenced culture, shaped genres, or stood the test of time
            as enduring works of art. Our selection spans:
          </p>
          <ul style={{ marginLeft: '24px', marginTop: '12px', lineHeight: '1.9' }}>
            <li><strong>Fiction:</strong> Novels, novellas, and short story collections from the Western and world literary canon</li>
            <li><strong>Adventure:</strong> Tales of exploration, survival, and discovery that defined the adventure genre</li>
            <li><strong>Mystery:</strong> The foundational detective and crime fiction that launched an entire genre</li>
            <li><strong>Romance:</strong> Classic stories of love, courtship, and society from multiple literary traditions</li>
            <li><strong>Science Fiction:</strong> Early visionary works that imagined technology, space, and the future</li>
            <li><strong>Philosophy:</strong> Essential works of thought that shaped Western and Eastern intellectual history</li>
            <li><strong>Drama:</strong> Plays from Shakespeare, Ibsen, Chekhov, and other major theatrical voices</li>
            <li><strong>Poetry:</strong> Verse collections from the most celebrated poets in literary history</li>
            <li><strong>History:</strong> Historical accounts and chronicles that document the human past</li>
          </ul>
          <p style={{ marginTop: '16px' }}>
            Each book is reviewed for text quality before being added to the library. We correct common
            OCR errors, normalize headings and chapter structure, and ensure the reading experience is
            clean and consistent.
          </p>
        </section>

        {/* Features */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Reading Features</h2>
          <p>
            Libreya is designed around one priority: making reading as comfortable and enjoyable as
            possible. Features include:
          </p>
          <ul style={{ marginLeft: '24px', marginTop: '12px', lineHeight: '1.9' }}>
            <li><strong>Four reading themes:</strong> Light, sepia, dark, and night modes to suit any environment and time of day</li>
            <li><strong>Chapter navigation:</strong> Jump directly to any chapter in a book without scrolling through the entire text</li>
            <li><strong>Adjustable font size:</strong> Increase or decrease text size to your preference</li>
            <li><strong>Cross-device sync:</strong> Start reading on your phone and continue on your laptop — your position is saved automatically</li>
            <li><strong>Reading history:</strong> Track which books you've read and how far you've progressed in each one</li>
            <li><strong>Favorites:</strong> Build a personal reading list of books you want to return to</li>
            <li><strong>Highlights:</strong> Mark passages that resonate with you (account required)</li>
            <li><strong>No account required to browse:</strong> Explore the full library and read any book without signing up</li>
          </ul>
        </section>

        {/* Commitment */}
        <section style={{ marginBottom: '48px', backgroundColor: 'var(--surface)', padding: '28px', borderRadius: '10px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Our Commitment to Readers</h2>
          <p>
            Libreya will always be free to read. We are supported by display advertising, which allows
            us to cover server costs and ongoing development without charging users. We are committed to
            keeping the reading experience clean: ads are limited and placed so they do not interrupt the
            act of reading itself.
          </p>
          <p style={{ marginTop: '12px' }}>
            We do not sell user data. We do not require registration to access content. We do not lock
            books behind paywalls or subscription tiers. Our goal is a reading experience with no
            unnecessary friction — just you and the book.
          </p>
          <p style={{ marginTop: '12px' }}>
            If you would like to support Libreya beyond simply reading, you can{' '}
            <Link href="/donate">make a donation</Link>. Every contribution helps keep the platform
            available to readers around the world.
          </p>
        </section>

        {/* CTA */}
        <section style={{ textAlign: 'center', padding: '32px 0' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Ready to Start Reading?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Browse our full library of over 300 classic books — completely free.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/browse">
              <button>Browse the Library</button>
            </Link>
            <Link href="/faq">
              <button style={{ backgroundColor: 'transparent', border: '1px solid var(--heading)', color: 'var(--heading)' }}>
                Read the FAQ
              </button>
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
