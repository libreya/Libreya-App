import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Donate() {
  return (
    <>
      <Head>
        <title>Support Libreya – Help Keep Classic Books Free</title>
        <meta
          name="description"
          content="Support Libreya with a donation and help keep over 300 classic books freely accessible to readers worldwide. Learn how your contribution is used and why it matters."
        />
        <link rel="canonical" href="https://libreya.app/donate" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Support Libreya – Help Keep Classic Books Free" />
        <meta
          property="og:description"
          content="Support Libreya with a donation and help keep over 300 classic books freely accessible to readers worldwide."
        />
        <meta property="og:url" content="https://libreya.app/donate" />
        <meta property="og:image" content="https://libreya.app/icon.png" />
        <meta name="twitter:card" content="summary" />
      </Head>

      <main className="container" style={{ maxWidth: '720px' }}>

        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Support Libreya</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05em', lineHeight: '1.7', marginBottom: '40px' }}>
          Libreya is free to use — and we intend to keep it that way. If you've found value in the
          platform and want to help ensure it stays available, a donation makes a real difference.
        </p>

        {/* How we operate */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>How Libreya Stays Free</h2>
          <p style={{ lineHeight: '1.8' }}>
            Libreya is an independently operated platform — there is no venture capital behind it,
            no corporate parent, and no subscription tier hiding the real content. We keep the lights
            on in two ways:
          </p>
          <ul style={{ marginLeft: '24px', marginTop: '16px', lineHeight: '1.9' }}>
            <li>
              <strong>Display advertising:</strong> We run a small number of Google-powered ads on the
              site. These cover a portion of our ongoing costs and allow us to offer the platform for
              free to readers worldwide. We limit ads carefully to avoid cluttering the reading experience.
            </li>
            <li style={{ marginTop: '10px' }}>
              <strong>Reader donations:</strong> Readers who want to support Libreya beyond what ads
              provide can make a voluntary donation. Every contribution — large or small — goes directly
              toward keeping the platform running and improving.
            </li>
          </ul>
        </section>

        {/* What donations fund */}
        <section style={{ marginBottom: '40px', backgroundColor: 'var(--surface)', padding: '28px', borderRadius: '10px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Where Your Donation Goes</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '20px', color: 'var(--text-secondary)' }}>
            We believe in transparency. Here is what it costs to run Libreya and what your support
            actually funds:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                backgroundColor: 'rgba(90,31,43,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
              }}>☁</div>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>Server &amp; Database Hosting</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em', lineHeight: '1.7', margin: 0 }}>
                  Hosting the application, serving over 300 full-text books, and storing user accounts
                  and reading data securely all require reliable cloud infrastructure. This is our
                  largest ongoing cost.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                backgroundColor: 'rgba(90,31,43,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
              }}>📖</div>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>Library Expansion &amp; Curation</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em', lineHeight: '1.7', margin: 0 }}>
                  Adding new books involves sourcing texts, correcting formatting errors, extracting
                  chapters, and verifying copyright status. Growing the library from 300 to 1,000+
                  books is one of our primary goals.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                backgroundColor: 'rgba(90,31,43,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
              }}>⚙</div>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>Development &amp; Maintenance</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em', lineHeight: '1.7', margin: 0 }}>
                  Ongoing development — new features, performance improvements, bug fixes, mobile
                  optimizations — requires sustained effort. Donations allow us to invest more time
                  in making Libreya better.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                backgroundColor: 'rgba(90,31,43,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
              }}>🌐</div>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>Keeping It Free Globally</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em', lineHeight: '1.7', margin: 0 }}>
                  Libreya is used by readers in countries where English-language books are expensive
                  or difficult to obtain. Every contribution helps ensure the platform stays accessible
                  to anyone with an internet connection, regardless of where they live.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to donate */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>How to Donate</h2>
          <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            We accept donations through the following methods. Even a small contribution helps cover
            monthly costs and keeps Libreya free for everyone.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '16px 20px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '1.4rem' }}>💳</span>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '2px' }}>PayPal</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em', margin: 0 }}>Send to donate@libreya.app</p>
              </div>
            </div>
            <div style={{ padding: '16px 20px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '1.4rem' }}>🏦</span>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '2px' }}>Bank Transfer</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em', margin: 0 }}>Email hello@libreya.app for banking details</p>
              </div>
            </div>
            <div style={{ padding: '16px 20px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '1.4rem' }}>₿</span>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '2px' }}>Cryptocurrency</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em', margin: 0 }}>Coming soon — email us if you'd like to donate in crypto now</p>
              </div>
            </div>
          </div>
        </section>

        {/* Other ways to support */}
        <section style={{ marginBottom: '40px', backgroundColor: 'var(--surface)', padding: '28px', borderRadius: '10px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Other Ways to Support Us</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px' }}>
            Don't want to donate? There are other meaningful ways to help:
          </p>
          <ul style={{ marginLeft: '20px', lineHeight: '1.9', color: 'var(--text-secondary)' }}>
            <li><strong>Tell a friend:</strong> Share Libreya with someone who loves books. Word of mouth is our most powerful growth channel.</li>
            <li><strong>Disable your ad blocker:</strong> Allowing ads to run on Libreya directly supports the platform at no cost to you.</li>
            <li><strong>Suggest books:</strong> Help us grow the library by recommending classic titles we haven't added yet.</li>
            <li><strong>Report bugs:</strong> Every bug report you send helps us improve the experience for thousands of other readers.</li>
          </ul>
        </section>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/browse">
            <button>Browse the Library</button>
          </Link>
          <Link href="/contact">
            <button style={{ backgroundColor: 'transparent', border: '1px solid var(--heading)', color: 'var(--heading)' }}>
              Contact Us
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
