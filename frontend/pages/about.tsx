import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function About() {
  return (
    <>
      <Head>
        <title>About Libreya</title>
        <meta name="description" content="About Libreya - Free classic books reading platform" />
      </Head>

      <main className="container" style={{ maxWidth: '800px' }}>
        <section style={{ marginBottom: '40px' }}>
          <h2>Our Mission</h2>
          <p>
            Libreya is dedicated to making classic literature accessible to everyone. We believe that great books should be
            free and available to anyone with internet access.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2>What We Offer</h2>
          <ul style={{ marginLeft: '20px' }}>
            <li>Access to thousands of classic books from authors like Jane Austen, Mark Twain, and more</li>
            <li>Multiple reading themes (light, sepia, dark, night)</li>
            <li>Personalized bookmarks and highlights</li>
            <li>A simple, distraction-free reading experience</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2>Content Sources</h2>
          <p>
            Our books are sourced from Project Gutenberg and Standard Ebooks, two major repositories of public domain
            literature. All works we offer are in the public domain or licensed under Creative Commons.
          </p>
        </section>

        <section>
          <h2>Get Started</h2>
          <p>
            Browse our collection and start reading today. No registration required to browse—create an account to save
            your progress and favorites.
          </p>
          <Link href="/browse">
            <button>Browse Books</button>
          </Link>
        </section>
      </main>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 86400, // Revalidate once a day
  };
}
