import React from 'react';
import Head from 'next/head';

export default function Donate() {
  return (
    <>
      <Head>
        <title>Donate - Libreya</title>
        <meta name="description" content="Support Libreya by donating" />
      </Head>

      <main className="container" style={{ maxWidth: '800px' }}>
        <section style={{ marginBottom: '40px' }}>
          <h2>Help Us Keep Books Free</h2>
          <p>
            Libreya is powered by ads, but we also appreciate donations from our community to help keep this service
            running.
          </p>
        </section>

        <section style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '8px' }}>
          <h3>Donation Methods</h3>
          <p>Support us through these methods:</p>
          <ul style={{ marginLeft: '20px' }}>
            <li>PayPal: donate@libreya.app</li>
            <li>Bank Transfer: Contact hello@libreya.app for details</li>
            <li>Cryptocurrency: Coming soon</li>
          </ul>
        </section>
      </main>
    </>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 86400 };
}
