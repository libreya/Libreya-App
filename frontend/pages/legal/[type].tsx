import React from 'react';
import Head from 'next/head';

interface LegalPageProps {
  content: string;
  title: string;
  metaDescription: string;
  canonicalType: string;
}

export default function LegalPage({ content, title, metaDescription, canonicalType }: LegalPageProps) {
  return (
    <>
      <Head>
        <title>{title} - Libreya</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://libreya.app/legal/${canonicalType}`} />
      </Head>

      <main className="container" style={{ maxWidth: '900px' }}>
        {content ? (
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            style={{
              backgroundColor: 'var(--surface)',
              padding: '30px',
              borderRadius: '8px',
              lineHeight: '1.8',
            }}
          />
        ) : (
          <p>Content not available.</p>
        )}
      </main>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { type: 'privacy' } },
      { params: { type: 'terms' } },
      { params: { type: 'legal' } },
    ],
    fallback: 'blocking',
  };
}

export async function getStaticProps(context: { params: { type: string } }) {
  const { type } = context.params;

  const defaultSettings: Record<string, string> = {
    terms_and_conditions: `<h2>Terms and Conditions</h2><p><strong>Last Updated: February 2026</strong></p><h3>1. License</h3><p>Libreya grants you a personal, non-exclusive license to use this software for reading public-domain literature.</p>`,
    privacy_notice: `<h2>Privacy Notice for Libreya</h2><p><strong>Last Updated: February 2026</strong></p><h3>1. Identity and Contact Details</h3><p>Libreya is the "Data Controller" for your information.</p>`,
    legal_notice: `<h2>Legal Notice</h2><h3>Royalty-Free Content Notice</h3><p>Works sourced via Standard Ebooks and Project Gutenberg. No copyright claimed on original texts.</p>`,
  };

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabaseServer
      .from('app_settings')
      .select('key, value');

    if (Array.isArray(data)) {
      data.forEach((s: { key: string; value: string }) => {
        if (s.key in defaultSettings) {
          defaultSettings[s.key] = s.value;
        }
      });
    }
  } catch {
    // Fall through to defaults
  }

  let content = '';
  let title = '';
  let metaDescription = '';

  if (type === 'privacy') {
    title = 'Privacy Policy';
    content = defaultSettings.privacy_notice;
    metaDescription = 'Libreya Privacy Policy — how we collect, use, and protect your personal data when you use our free classic literature reading platform.';
  } else if (type === 'terms') {
    title = 'Terms and Conditions';
    content = defaultSettings.terms_and_conditions;
    metaDescription = 'Libreya Terms and Conditions — the rules and guidelines for using the Libreya free classic literature reading platform.';
  } else if (type === 'legal') {
    title = 'Legal Notice';
    content = defaultSettings.legal_notice;
    metaDescription = 'Libreya Legal Notice — copyright and content licensing information for the Libreya platform and its public domain book collection.';
  } else {
    return { notFound: true };
  }

  return {
    props: { content, title, metaDescription, canonicalType: type },
    revalidate: 86400,
  };
}
