import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Us - Libreya</title>
        <meta name="description" content="Contact Libreya" />
      </Head>

      <main className="container" style={{ maxWidth: '600px' }}>
        <section style={{ marginBottom: '30px', backgroundColor: 'var(--surface)', padding: '25px', borderRadius: '8px' }}>
          <h2>Get in Touch</h2>
          <p>Have questions or feedback? We'd love to hear from you!</p>

          <div style={{ marginTop: '25px' }}>
            <h4>Email</h4>
            <p>
              <Link href="mailto:hello@libreya.app">
                hello@libreya.app
              </Link>
            </p>
          </div>

          <div style={{ marginTop: '25px' }}>
            <h4>Support</h4>
            <p>For technical support or bug reports, please email us with details about the issue.</p>
          </div>

          <div style={{ marginTop: '25px' }}>
            <h4>Suggestions</h4>
            <p>We love hearing your ideas for improving Libreya. Send us your suggestions anytime!</p>
          </div>
        </section>
      </main>
    </>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 86400 };
}
