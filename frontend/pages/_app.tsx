import React, { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAppStore } from '../lib/store-web';
import { Layout } from '../components/Layout';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const initializeApp = useAppStore((s) => s.initializeApp);
  const isLoading = useAppStore((s) => s.isLoading);
  const theme = useAppStore((s) => s.theme);
  const [appReady, setAppReady] = useState(false);
  const { pathname } = useRouter();
  const skipLayout = pathname.startsWith('/book/');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const initialize = async () => {
      await initializeApp();
      setAppReady(true);
    };
    initialize();
  }, [initializeApp]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Libreya - Read classic literature online" />
        <title>Libreya - Free Books</title>
      </Head>

      {/* Splash overlay — covers page until app is ready, invisible to crawlers */}
      {!appReady && (
        <div className="splash-screen" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <div className="spinner"></div>
        </div>
      )}

      {skipLayout ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </>
  );
}
