import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const faqs = [
  {
    question: 'Is Libreya free to use?',
    answer:
      'Yes — Libreya is completely free to use. You can browse the entire library and read any book without paying anything or creating an account. We keep the platform free through display advertising and optional donations from readers who want to support the project.',
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'No account is required to browse the library or read any book. If you want to save your reading progress, build a favorites list, add highlights, or sync your place across devices, you can create a free account. Sign-up takes less than a minute and requires only an email address. You can also sign in with Google or Apple.',
  },
  {
    question: 'Where do the books on Libreya come from?',
    answer:
      'All books on Libreya are sourced from Project Gutenberg and Standard Ebooks — two trusted repositories of public domain literature. Project Gutenberg, founded in 1971, houses over 70,000 free e-books whose copyrights have expired. Standard Ebooks produces carefully typeset modern editions of public domain texts. Every book on Libreya is legally free to read and redistribute.',
  },
  {
    question: 'Are the books on Libreya complete and unabridged?',
    answer:
      'Yes. We do not offer abridged or condensed versions. Every book is the full, original text as it was published, sourced directly from Project Gutenberg or Standard Ebooks. We do perform light formatting corrections — fixing OCR errors, normalizing headings, and ensuring chapter structure is consistent — but we never alter the original text itself.',
  },
  {
    question: 'How many books does Libreya have?',
    answer:
      'Libreya currently offers over 300 classic books spanning nine genres: Fiction, Adventure, Mystery, Romance, Science Fiction, Philosophy, Drama, Poetry, and History. We regularly add new titles. If there is a specific classic you would like to see, you can suggest it by contacting us.',
  },
  {
    question: 'What genres are available?',
    answer:
      'Our library spans nine genres: Fiction (novels and novellas from the Western and world literary canon), Adventure (exploration and survival stories), Mystery (foundational detective and crime fiction), Romance (classic love stories and courtship narratives), Science Fiction (early visionary works by H.G. Wells, Jules Verne, and others), Philosophy (essential works of Western and Eastern thought), Drama (plays by Shakespeare, Ibsen, Chekhov, and others), Poetry (verse collections from major poets), and History (historical accounts and chronicles).',
  },
  {
    question: 'How do I save my reading progress?',
    answer:
      'Reading progress is saved automatically if you have a free account and are logged in. When you return to a book, Libreya will remember exactly which chapter you were on. Without an account, progress is stored in your browser only and may be lost if you clear your browser data or switch devices.',
  },
  {
    question: 'Can I read Libreya on my phone or tablet?',
    answer:
      'Yes. Libreya is fully responsive and works on phones, tablets, laptops, and desktop computers. The reading interface adapts to any screen size. You can adjust font size within the reader to suit your device and personal preference.',
  },
  {
    question: 'What reading themes does Libreya offer?',
    answer:
      'Libreya offers four reading themes you can switch between at any time: Light (white background, dark text — best in bright environments), Sepia (warm cream background — classic print-like feel), Dark (dark grey background — reduces eye strain in moderate light), and Night (pure black background — ideal for reading in the dark). Your theme preference is saved and applied across all pages.',
  },
  {
    question: 'Can I download books from Libreya?',
    answer:
      'Currently, books can only be read online through the Libreya reader. We do not offer file downloads at this time. If you want to download a book in EPUB or other formats, you can go directly to Project Gutenberg (gutenberg.org) or Standard Ebooks (standardebooks.org), which offer free downloads in multiple formats.',
  },
  {
    question: 'Can I highlight passages or make bookmarks?',
    answer:
      'Yes. Logged-in users can highlight text passages while reading. Your highlights are saved to your account and accessible whenever you return to that book. Bookmark and annotation features are part of our ongoing development roadmap.',
  },
  {
    question: 'Are there ads on Libreya?',
    answer:
      'Yes. Libreya uses display advertising to cover the costs of running the platform — server hosting, maintenance, and ongoing development. We limit ads to a small number per page and place them so they do not interrupt the reading experience. We do not use pop-up ads, auto-playing video ads, or any format designed to obstruct content.',
  },
  {
    question: 'Is my personal data safe on Libreya?',
    answer:
      'We take privacy seriously. We do not sell your personal data to third parties. If you create an account, your email address and reading activity are stored securely using Supabase, a trusted cloud database platform. For full details, please read our Privacy Policy.',
  },
  {
    question: 'Can I suggest a book to add to the library?',
    answer:
      'Absolutely. If there is a public domain classic you would like to see on Libreya, send us an email at hello@libreya.app with the book title, author, and — if you know it — a link to the Project Gutenberg or Standard Ebooks edition. We review all suggestions and add books regularly.',
  },
  {
    question: 'How do I report a problem with a book or the site?',
    answer:
      'If you notice a formatting error, a typo, a broken page, or any technical issue, please email us at hello@libreya.app. Include the book title (if applicable), a brief description of the problem, and what device and browser you were using. We appreciate every bug report — it helps us improve the experience for all readers.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Head>
        <title>FAQ – Frequently Asked Questions | Libreya</title>
        <meta
          name="description"
          content="Answers to common questions about Libreya — how it works, where the books come from, how to save progress, reading themes, account features, privacy, and more."
        />
        <meta name="author" content="Libreya Editorial Team" />
        <meta property="article:published_time" content="2024-01-15T00:00:00+00:00" />
        <meta property="article:modified_time" content="2026-06-28T00:00:00+00:00" />
        <link rel="canonical" href="https://libreya.app/faq" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="FAQ – Frequently Asked Questions | Libreya" />
        <meta
          property="og:description"
          content="Answers to common questions about Libreya — how it works, where the books come from, reading themes, account features, and more."
        />
        <meta property="og:url" content="https://libreya.app/faq" />
        <meta property="og:image" content="https://libreya.app/icon.png" />
        <meta name="twitter:card" content="summary" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>

      <main className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Frequently Asked Questions</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.05em' }}>
          Everything you need to know about reading on Libreya.
        </p>

        <div>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                style={{
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 0',
                  gap: '16px',
                }}>
                  <h2 style={{
                    fontSize: '1em',
                    fontWeight: '600',
                    color: 'var(--heading)',
                    margin: 0,
                    lineHeight: '1.5',
                    flex: 1,
                  }}>
                    {faq.question}
                  </h2>
                  <span style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    display: 'inline-block',
                  }}>
                    +
                  </span>
                </div>
                {/* Always rendered in HTML for search engines; visually hidden when closed */}
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.8',
                  margin: 0,
                  fontSize: '0.97em',
                  maxHeight: isOpen ? '600px' : '0',
                  overflow: 'hidden',
                  paddingBottom: isOpen ? '20px' : '0',
                  transition: 'max-height 0.25s ease, padding-bottom 0.25s ease',
                }}>
                  {faq.answer}
                </p>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: '48px',
          backgroundColor: 'var(--surface)',
          padding: '28px',
          borderRadius: '10px',
        }}>
          <h3 style={{ marginBottom: '8px' }}>Still have questions?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
            If your question isn't covered above, we're happy to help. Send us an email and we'll
            get back to you as soon as we can.
          </p>
          <Link href="/contact">
            <button>Contact Us</button>
          </Link>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
