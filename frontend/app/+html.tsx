import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* SEO Meta Tags */}
        <meta name="description" content="Libreya - Discover over 300 timeless classics from the world's greatest authors. Beautifully formatted, completely free, forever." />
        <meta name="keywords" content="classic literature, free books, public domain, reading app, ebooks" />
        <meta property="og:title" content="Libreya - Classic Literature, Reimagined" />
        <meta property="og:description" content="Discover over 300 timeless masterpieces. Free forever." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://libreya.app" />

        {/*
          Google AdSense Auto Ads Script
          This script enables Google's automatic ad placement.
          Client ID: ca-pub-4299148862195882
        */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4299148862195882"
          crossOrigin="anonymous"
        />

        {/*
          Using a modified ScrollViewStyleReset that does NOT set overflow:hidden on body.
          This is critical for Google AdSense auto-ads to inject ad units into the page.
          We manually set only the styles we need.
        */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Reset default browser styles for RN Web compatibility */
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          body {
            /* IMPORTANT: Do NOT use overflow:hidden here - it blocks AdSense auto-ads */
            overflow-y: auto;
            overscroll-behavior-y: none;
          }
          #root {
            display: flex;
            flex-direction: column;
            min-height: 100%;
          }
          /* Ensure ad containers are not clipped */
          .adsbygoogle {
            display: block;
            overflow: visible !important;
          }
        `}} />

        {/*
          Ad-Blocker Detection Script
          Logs to console whether AdSense loaded successfully.
          Useful for admin debugging.
        */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.__ADSENSE_STATUS = 'checking';
          window.addEventListener('load', function() {
            setTimeout(function() {
              if (typeof window.adsbygoogle !== 'undefined' && window.adsbygoogle.loaded !== false) {
                window.__ADSENSE_STATUS = 'loaded';
                console.log('[Libreya Ads] AdSense script loaded successfully.');
              } else {
                window.__ADSENSE_STATUS = 'blocked';
                console.warn('[Libreya Ads] AdSense may be blocked by an ad-blocker or failed to load.');
              }
              // Dispatch custom event for React components to listen to
              window.dispatchEvent(new CustomEvent('adsense-status', { detail: window.__ADSENSE_STATUS }));
            }, 3000);
          });
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
