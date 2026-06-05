import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Us | Libreya</title>
        <meta
          name="description"
          content="Get in touch with the Libreya team. We welcome questions, bug reports, book suggestions, partnership inquiries, and feedback from readers."
        />
        <link rel="canonical" href="https://libreya.app/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Contact Us | Libreya" />
        <meta
          property="og:description"
          content="Get in touch with the Libreya team — questions, bug reports, book suggestions, and reader feedback are all welcome."
        />
        <meta property="og:url" content="https://libreya.app/contact" />
        <meta property="og:image" content="https://libreya.app/icon.png" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <main className="container" style={{ maxWidth: '720px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Contact Us</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05em', lineHeight: '1.7', marginBottom: '40px' }}>
          We're a small team and we read every message we receive. Whether you've found a bug, have a
          question, or just want to say hello — we'd love to hear from you.
        </p>

        {/* Email */}
        <section style={{ marginBottom: '40px', backgroundColor: 'var(--surface)', padding: '28px', borderRadius: '10px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Email Us</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '12px' }}>
            The best way to reach us is by email. We aim to respond within 2–3 business days.
          </p>
          <p style={{ fontWeight: '600' }}>
            <Link href="mailto:hello@libreya.app">hello@libreya.app</Link>
          </p>
        </section>

        {/* Types of inquiries */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>What We Can Help With</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1em', marginBottom: '8px' }}>Bug Reports &amp; Technical Issues</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0, fontSize: '0.95em' }}>
                If something isn't working — a page won't load, text is displaying incorrectly, a
                chapter is missing, or you're experiencing login problems — please let us know. Include
                the book title or page URL, a description of the issue, and the device and browser you
                are using. Screenshots are always helpful.
              </p>
            </div>

            <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1em', marginBottom: '8px' }}>Book Suggestions</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0, fontSize: '0.95em' }}>
                If there is a classic you'd like to see on Libreya that we don't currently have, send
                us the title and author. If you know of a Project Gutenberg or Standard Ebooks edition,
                include the link — it speeds things up considerably. We review all suggestions and add
                new titles regularly.
              </p>
            </div>

            <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1em', marginBottom: '8px' }}>Text Corrections</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0, fontSize: '0.95em' }}>
                Despite our best efforts, OCR errors from the source texts occasionally slip through.
                If you spot a typo, a formatting error, or a missing passage in a book, please email
                us with the book title, the chapter, and a brief description of what's wrong. We
                correct errors as quickly as possible.
              </p>
            </div>

            <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1em', marginBottom: '8px' }}>Feature Requests &amp; Feedback</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0, fontSize: '0.95em' }}>
                Have an idea that would make Libreya better? We want to hear it. Reader feedback
                directly shapes what we build. If you have a feature request — offline reading, book
                downloads, a specific reading theme, a navigation improvement — send it our way.
              </p>
            </div>

            <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1em', marginBottom: '8px' }}>Partnership &amp; Press Inquiries</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0, fontSize: '0.95em' }}>
                For partnership opportunities, educational institution inquiries, or press and media
                requests, please email us with details about your organization and the nature of your
                inquiry. We'll get back to you as promptly as we can.
              </p>
            </div>

            <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1em', marginBottom: '8px' }}>Privacy &amp; Account Questions</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0, fontSize: '0.95em' }}>
                For questions about your account, data deletion requests, or privacy-related inquiries,
                please email us from the address associated with your account. You can also review our{' '}
                <Link href="/legal/privacy">Privacy Policy</Link> for information on how we handle
                your data.
              </p>
            </div>

          </div>
        </section>

        {/* Response time */}
        <section style={{ marginBottom: '40px', backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '10px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Response Times</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', margin: 0, fontSize: '0.95em' }}>
            We are a small team, and we don't have a formal support ticketing system — just real people
            reading real email. For most inquiries, we aim to respond within 2–3 business days. Complex
            issues, feature requests, or partnership inquiries may take a little longer. We appreciate
            your patience.
          </p>
        </section>

        {/* Quick links */}
        <section>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Quick Links</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.95em', lineHeight: '1.7' }}>
            You may find what you're looking for in one of these sections:
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/faq"><button style={{ fontSize: '0.9em' }}>FAQ</button></Link>
            <Link href="/about"><button style={{ fontSize: '0.9em', backgroundColor: 'transparent', border: '1px solid var(--heading)', color: 'var(--heading)' }}>About Libreya</button></Link>
            <Link href="/legal/privacy"><button style={{ fontSize: '0.9em', backgroundColor: 'transparent', border: '1px solid var(--heading)', color: 'var(--heading)' }}>Privacy Policy</button></Link>
            <Link href="/legal/terms"><button style={{ fontSize: '0.9em', backgroundColor: 'transparent', border: '1px solid var(--heading)', color: 'var(--heading)' }}>Terms of Service</button></Link>
          </div>
        </section>

      </main>
    </>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
