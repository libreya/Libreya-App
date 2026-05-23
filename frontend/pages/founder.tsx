import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Founder() {
  return (
    <>
      <Head>
        <title>About the Founder - Libreya</title>
        <meta name="description" content="Learn about the founder of Libreya" />
      </Head>

      <main className="container" style={{ maxWidth: '800px' }}>
        <section style={{ marginBottom: '40px' }}>
          <h2>Our Story</h2>
          <p>
            Libreya was founded on the belief that literature should be accessible to everyone, regardless of their
            financial circumstances. Great books have shaped our world, and they should be available to anyone with an
            internet connection.
          </p>
        </section>

        <section style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '8px' }}>
          <h3>Mission</h3>
          <p>
            We're committed to preserving and sharing humanity's literary heritage. By making classic books free and
            accessible, we aim to foster a love of reading and learning in our global community.
          </p>
        </section>

        <section style={{ marginTop: '40px' }}>
          <h3>Get Involved</h3>
          <p>
            Want to support our mission? You can{' '}
            <Link href="/donate">donate</Link>
            {', '}
            <Link href="/contact">contact us</Link>
            , or help us in other ways.
          </p>
        </section>
      </main>
    </>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
