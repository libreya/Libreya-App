import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAppStore } from '../../lib/store-web';

export default function LegalPage() {
  const router = useRouter();
  const { type } = router.query;
  const settings = useAppStore((s) => s.settings);
  const fetchSettings = useAppStore((s) => s.fetchSettings);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      if (type === 'privacy') {
        setTitle('Privacy Policy');
        setContent(settings.privacy_notice);
      } else if (type === 'terms') {
        setTitle('Terms and Conditions');
        setContent(settings.terms_and_conditions);
      } else if (type === 'legal') {
        setTitle('Legal Notice');
        setContent(settings.legal_notice);
      }
    }
  }, [type, settings]);

  return (
    <>
      <Head>
        <title>{title} - Libreya</title>
        <meta name="description" content={title} />
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
          <p>Loading...</p>
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

export async function getStaticProps(context: any) {
  return {
    props: {},
    
  };
}
