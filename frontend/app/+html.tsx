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
            Libreya is a free digital library that allows readers to explore and enjoy over
            300 timeless works of classic literature from some of the world's greatest authors.
            Every book is part of the public domain and has been carefully formatted to provide
            a modern and comfortable reading experience across all devices.
          </p>

          <h2>Discover the World's Greatest Books</h2>

          <p>
            From the elegant social novels of <strong>Jane Austen</strong> to the philosophical
            masterpieces of <strong>Fyodor Dostoevsky</strong>, Libreya brings together literature
            that has shaped human thought for generations. Readers can navigate through classic
            novels, plays, essays, and poetry with ease, discovering works that inspire, entertain,
            and educate.
          </p>

          <p>
            Each work is presented in a clean, distraction-free layout that makes reading long texts
            enjoyable. Libreya’s platform allows users to browse by author, genre, or title,
            making it simple to find both well-known favorites and hidden gems.
          </p>

          <h2>A Free Library for Everyone</h2>

          <p>
            Accessibility is at the heart of Libreya. All books on the platform are completely free
            to read, with no subscriptions, paywalls, or limitations. Whether you are a student,
            literature enthusiast, or casual reader, Libreya ensures that anyone can access the
            classics that have stood the test of time.
          </p>

          <p>
            By focusing on public domain works, Libreya preserves cultural heritage while giving
            readers an easy way to engage with literature in a modern digital format. This means
            your favorite classics are never more than a few clicks away.
          </p>

          <h2>Learn, Explore, and Immerse Yourself</h2>

          <p>
            Beyond simply reading, Libreya encourages exploration. Readers can connect works by
            theme, author, or historical period, discovering patterns and insights across literature.
            The platform provides a space for learning, inspiration, and deep engagement with
            the written word.
          </p>

          <p>
            For those new to classic literature, Libreya makes the experience approachable. Short
            summaries, author highlights, and curated reading suggestions guide users through the
            vast library of works, ensuring every visit is educational and enjoyable.
          </p>

          <h2>A Platform Built for Modern Readers</h2>

          <p>
            Libreya combines the timeless value of classic literature with the convenience of modern
            technology. Whether on a desktop, tablet, or smartphone, readers can immerse themselves
            in beautifully formatted texts that are easy on the eyes and simple to navigate.
          </p>

          <p>
            Start your journey into classic literature today. Discover stories, ideas, and authors
            that have influenced generations, all for free and always accessible through Libreya.
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
          }, 1000);
        });
      `,
          }}
        />

      </body>
    </html>
  );
}
