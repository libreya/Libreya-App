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
        <meta name="keywords" content="classic literature, free books, public domain, reading app, ebooks, Libreya" />
        <meta property="og:title" content="Libreya - Classic Literature, Reimagined" />
        <meta property="og:description" content="Discover over 300 timeless masterpieces. Free forever." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://libreya.app" />
        <meta name="theme-color" content="#5A1F2B" />

        {/* Favicon - Libreya icon */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />

        {/*
          Google AdSense Auto Ads Script
          Client ID: ca-pub-4299148862195882
        */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4299148862195882"
          crossOrigin="anonymous"
        />

        {/*
          Combined styles:
          - Body overflow: auto (NOT hidden) for AdSense auto-ads
          - Remove default input borders/outlines for clean UI
          - Micro-animations for hover states
        */}
        <style dangerouslySetInnerHTML={{
          __html: `
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          body {
            overflow-y: auto;
            overscroll-behavior-y: none;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          #root {
            display: flex;
            flex-direction: column;
            min-height: 100%;
          }
          /* ===== Remove all default input borders ===== */
          input, textarea {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          input:focus, textarea:focus {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          /* ===== Micro-Animations ===== */
          /* Smooth transitions for all interactive elements */
          a, button, [role="button"] {
            transition: transform 0.15s ease, opacity 0.15s ease, background-color 0.2s ease;
          }
          a:hover, button:hover, [role="button"]:hover {
            opacity: 0.9;
          }
          /* Navigation link hover effects */
          [data-testid="nav-link"]:hover {
            background-color: rgba(90, 31, 43, 0.06);
          }
          /* Card hover lift effect */
          [data-testid="card"]:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          }
          /* Smooth scrollbar */
          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(90, 31, 43, 0.2);
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(90, 31, 43, 0.4);
          }
          /* AdSense container */
          .adsbygoogle {
            display: block;
            overflow: visible !important;
          }
        `}} />

        {/* Ad-Blocker Detection */}
        <script dangerouslySetInnerHTML={{
          __html: `
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
              window.dispatchEvent(new CustomEvent('adsense-status', { detail: window.__ADSENSE_STATUS }));
            }, 3000);
          });
        `}} />
      </head>
      <body>

        {/* SEO content visible to crawlers before the app loads */}
        <div
          id="seo-content"
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "40px 20px",
            fontFamily: "Georgia, serif",
            lineHeight: "1.7",
            color: "#111",
          }}
        >
          <h1>Libreya – Classic Literature, Reimagined</h1>

          <p>
            Libreya is a free online library for classic books. You can read more than
            300 famous works from great authors. Every book is in the public domain
            and free for everyone.
          </p>

          <h2>Read Famous Classic Books</h2>

          <p>
            Explore stories written by authors like Jane Austen, Charles Dickens,
            Leo Tolstoy, and Fyodor Dostoevsky. Their novels are some of the most
            important works in world literature.
          </p>

          <p>
            Libreya makes these books easy to read online. The pages are clean,
            simple, and designed for long reading sessions on any device.
          </p>

          <h2>A Free Library for Everyone</h2>

          <p>
            All books on Libreya are free. There are no subscriptions and no
            paywalls. Anyone can read the classics anytime.
          </p>

          <p>
            Students, teachers, and readers can explore timeless stories and ideas
            that have inspired people for generations.
          </p>

          <h2>Start Reading Today</h2>

          <p>
            Browse authors, discover famous novels, and enjoy classic literature
            from around the world with Libreya.
          </p>
        </div>

        {children}

        {/* Hide SEO text after React app loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
        window.addEventListener('DOMContentLoaded', function() {
          setTimeout(function() {
            var seo = document.getElementById('seo-content');
            if (seo) {
              seo.style.display = 'none';
            }

            var adp = document.getElementById('adsense-required-pages');
            if (adp) {
              adp.style.display = 'none';
            }
          }, 1000);
        });
      `,
          }}
        />

        <div
          id="adsense-required-pages"
          style={{
            textAlign: "center",
            padding: "20px",
            fontSize: "14px",
            color: "#555"
          }}
        >
          <a href="/about">About</a> |
          <a href="/privacy">Privacy Policy</a> |
          <a href="/contact">Contact</a> |
          <a href="/disclaimer">Disclaimer</a>
        </div>

      </body>
    </html>
  );
}
