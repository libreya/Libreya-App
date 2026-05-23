import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function FAQ() {
  const faqs = [
    {
      question: 'Is Libreya free?',
      answer: 'Yes! Libreya is completely free to use. We support ourselves through ads and donations.',
    },
    {
      question: 'Do I need to create an account?',
      answer: 'No account is required to browse and read books. However, creating an account lets you save your progress and favorites.',
    },
    {
      question: 'Where do you get your books?',
      answer: 'Our books are sourced from Project Gutenberg and Standard Ebooks, both repositories of public domain literature.',
    },
    {
      question: 'Can I download books?',
      answer: 'Currently, books can only be read online on Libreya. Download functionality may be added in the future.',
    },
  ];

  return (
    <>
      <Head>
        <title>FAQ - Libreya</title>
        <meta name="description" content="Frequently asked questions about Libreya" />
      </Head>

      <main className="container" style={{ maxWidth: '800px' }}>
        {faqs.map((faq, index) => (
          <div key={index} style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--heading)', marginBottom: '10px' }}>{faq.question}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{faq.answer}</p>
          </div>
        ))}

        <div style={{ marginTop: '30px', backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '8px' }}>
          <h4>Still have questions?</h4>
          <p>
            Contact us at <Link href="mailto:hello@libreya.app">hello@libreya.app</Link>
          </p>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
