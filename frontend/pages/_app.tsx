import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAppStore } from '../lib/store-web';
import { Layout } from '../components/Layout';
import { CookieBanner } from '../components/CookieBanner';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const initializeApp = useAppStore((s) => s.initializeApp);
  const theme = useAppStore((s) => s.theme);
  const { pathname } = useRouter();
  const skipLayout = pathname.startsWith('/book/');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Libreya - Read classic literature online" />
        <title>Libreya - Free Books</title>
      </Head>

      {skipLayout ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}

      <CookieBanner />

    </>
  );
}
