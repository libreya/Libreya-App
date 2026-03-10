import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Libreya – Classic Literature, Reimagined | Free Online Library</title>
        <meta name="description" content="Libreya is a free online library with 300+ classic books. Read works by Jane Austen, Charles Dickens, Leo Tolstoy, and more. Beautifully formatted, free forever." />
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
        <div
          id="seo-content"
          style={{
            maxWidth: "100%",
            margin: "0 auto",
            padding: "80px 30px",
            textAlign: "center",
            fontFamily: "Georgia, serif",
            lineHeight: 1.7,
            color: "#ffffff",
            background: "linear-gradient(180deg,#5A1F2B 0%,#7B2E3E 100%)"
          }}
        >
          <h1 style={{ fontSize: "44px", marginBottom: "25px", fontWeight: 700 }}>
            Libreya – Classic Literature, Reimagined
          </h1>

          <p style={{ fontSize: "18px", opacity: 0.9 }}>
            Libreya is a free online library with over 300 classic books.
          </p>
          <p style={{ fontSize: "18px", opacity: 0.9 }}>
            Every book is public domain and free for anyone to read.
          </p>

          <h2 style={{ fontSize: "26px", marginTop: "40px" }}>Featured Books</h2>
          <ul style={{ listStyle: "none", padding: 0, fontSize: "18px" }}>
            <li><a href="/books/pride-and-prejudice.html" style={{ color: "#fff" }}>Pride and Prejudice – Jane Austen</a></li>
            <li><a href="/books/moby-dick.html" style={{ color: "#fff" }}>Moby Dick – Herman Melville</a></li>
            <li><a href="/books/crime-and-punishment.html" style={{ color: "#fff" }}>Crime and Punishment – Fyodor Dostoevsky</a></li>
            {/* <li><a href="/books/war-and-peace.html" style={{ color: "#fff" }}>War and Peace – Leo Tolstoy</a></li>
            <li><a href="/books/jane-eyre.html" style={{ color: "#fff" }}>Jane Eyre – Charlotte Brontë</a></li> */}
          </ul>

          <h2 style={{ fontSize: "26px", marginTop: "40px" }}>Easy Reading Online</h2>
          <p style={{ fontSize: "18px", opacity: 0.9 }}>
            Libreya makes reading classic books simple. Pages are clean and easy to read.
          </p>
          <p style={{ fontSize: "18px", opacity: 0.9 }}>
            You can enjoy long reading sessions on any device.
          </p>

          <h2 style={{ fontSize: "26px", marginTop: "40px" }}>Free for Everyone</h2>
          <p style={{ fontSize: "18px", opacity: 0.9 }}>
            There are no subscriptions or paywalls. Students, teachers, and readers can explore these books anytime.
          </p>

          <h2 style={{ fontSize: "26px", marginTop: "40px" }}>Start Reading Today</h2>
          <p style={{ fontSize: "18px", opacity: 0.9 }}>
            Browse authors, find famous novels, and enjoy classic literature with Libreya.
          </p>
        </div>

        {/* Footer for AdSense-required pages */}
        <div
          id="seo-footer"
          style={{
            textAlign: "center",
            padding: "30px 20px",
            fontSize: "14px",
            color: "#f3e8ea",
            fontFamily: "Georgia, serif",
            borderTop: "1px solid rgba(255,255,255,0.15)"
          }}
        >
          <a href="/about" style={{ color: "#fff", margin: "0 10px" }}>About</a> |
          <a href="/privacy" style={{ color: "#fff", margin: "0 10px" }}>Privacy Policy</a> |
          <a href="/contact" style={{ color: "#fff", margin: "0 10px" }}>Contact</a> |
          <a href="/disclaimer" style={{ color: "#fff", margin: "0 10px" }}>Disclaimer</a>
        </div>

        {/* Hide static SEO content after SPA loads */}
        <script dangerouslySetInnerHTML={{
          __html: `
    window.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        var seo = document.getElementById('seo-content');
        if (seo) seo.style.display = 'none';
        var footer = document.getElementById('seo-footer');
        if (footer) footer.style.display = 'none';
      }, 1000);
    });
  `}} />

        {children /* Expo SPA */}
      </body>
    </html>
  );
}
