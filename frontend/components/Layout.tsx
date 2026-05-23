import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppStore } from '../lib/store-web';

const NAV_LOGGED_OUT = [
  { label: 'Home',   path: '/' },
  { label: 'Browse', path: '/browse' },
  { label: 'About',  path: '/about' },
  { label: 'Donate', path: '/donate' },
];

const NAV_LOGGED_IN = [
  { label: 'Home',      path: '/' },
  { label: 'Browse',    path: '/browse' },
  { label: 'Favorites', path: '/favorites' },
  { label: 'About',     path: '/about' },
];

const FOOTER_LINKS = {
  Explore: [
    { label: 'Browse Library',   path: '/browse' },
    { label: 'About Us',         path: '/about' },
    { label: 'FAQ',              path: '/faq' },
  ],
  Legal: [
    { label: 'Privacy Policy',   path: '/legal/privacy' },
    { label: 'Terms of Service', path: '/legal/terms' },
    { label: 'Legal Notice',     path: '/legal/legal' },
  ],
  Connect: [
    { label: 'Contact Us',       path: '/contact' },
    { label: 'Donate',           path: '/donate' },
    { label: "Founder's Letter", path: '/founder' },
  ],
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouter();
  const user = useAppStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = user ? NAV_LOGGED_IN : NAV_LOGGED_OUT;
  const initial = (user?.display_name?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Sticky top nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '0 20px',
          height: '60px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="https://customer-assets.emergentagent.com/job_b554f1a4-c35c-4e60-a285-bdc61c896871/artifacts/0ouwazt9_Libreya%20Logo.png"
              alt="Libreya"
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '1.375rem', fontWeight: '700', color: 'var(--heading)', fontFamily: 'inherit' }}>
              Libreya
            </span>
          </Link>

          {/* Desktop links */}
          <div className="layout-desktop-nav">
            {links.map(({ label, path }) => (
              <Link key={path} href={path} style={{ textDecoration: 'none' }}>
                <span className="nav-link" style={{
                  display: 'block', padding: '6px 13px', borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: isActive(path) ? '600' : '400',
                  color: isActive(path) ? 'var(--heading)' : 'var(--text)',
                  backgroundColor: isActive(path) ? 'rgba(198,167,94,0.12)' : 'transparent',
                  borderBottom: `2px solid ${isActive(path) ? '#c6a75e' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}>
                  {label}
                </span>
              </Link>
            ))}

            {user ? (
              <Link href="/profile" style={{ textDecoration: 'none', marginLeft: '8px' }}>
                <div title="Profile" style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: '#2b2b2b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#c6a75e', fontWeight: '700', fontSize: '0.875rem',
                  cursor: 'pointer',
                }}>
                  {initial}
                </div>
              </Link>
            ) : (
              <Link href="/auth" style={{ textDecoration: 'none', marginLeft: '8px' }}>
                <span style={{
                  display: 'block', padding: '8px 18px', borderRadius: '8px',
                  backgroundColor: '#5a1f2b', color: 'white',
                  fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                }}>
                  Sign In
                </span>
              </Link>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="layout-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{
              background: 'none', border: 'none', padding: '6px 4px',
              cursor: 'pointer', color: 'var(--text)', lineHeight: 1,
            }}
          >
            {menuOpen
              ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg)',
            padding: '4px 20px 16px',
          }}>
            {links.map(({ label, path }) => (
              <Link key={path} href={path} onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '13px 0',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '1rem',
                  fontWeight: isActive(path) ? '600' : '400',
                  color: isActive(path) ? 'var(--heading)' : 'var(--text)',
                }}>
                  {label}
                  {isActive(path) && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#c6a75e', display: 'block' }} />
                  )}
                </div>
              </Link>
            ))}
            {user ? (
              <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '13px 0', display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '1rem', color: 'var(--text)',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: '#2b2b2b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#c6a75e', fontWeight: '700', fontSize: '0.8rem',
                  }}>
                    {initial}
                  </div>
                  Profile
                </div>
              </Link>
            ) : (
              <Link href="/auth" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{ paddingTop: '14px' }}>
                  <span style={{
                    display: 'inline-block', padding: '10px 28px', borderRadius: '8px',
                    backgroundColor: '#5a1f2b', color: 'white',
                    fontWeight: '600', fontSize: '0.9375rem',
                  }}>
                    Sign In
                  </span>
                </div>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* ── Page content ── */}
      <div style={{ flex: 1 }}>
        {children}
      </div>

      {/* ── Footer ── */}
      <footer style={{
        backgroundColor: 'rgba(90, 31, 43, 1.00)', color: 'white',
        borderTop: '3px solid #c6a75e',
        paddingTop: '40px', marginTop: 0,
        textAlign: 'left',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '0 24px 32px',
          display: 'flex', flexWrap: 'wrap', gap: '40px',
        }}>
          {/* Brand */}
          <div style={{ minWidth: '200px', flex: 1 }}>
            <div style={{ fontSize: '1.375rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
              Libreya
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', marginBottom: 0 }}>
              Classic literature, free forever.
            </p>
          </div>

          {/* Link columns */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', flex: 2 }}>
            {Object.entries(FOOTER_LINKS).map(([col, items]) => (
              <div key={col} style={{ minWidth: '130px' }}>
                <div style={{
                  fontSize: '0.75rem', fontWeight: '700', color: '#c6a75e',
                  textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px',
                }}>
                  {col}
                </div>
                {items.map(({ label, path }) => (
                  <Link key={path} href={path} style={{ textDecoration: 'none' }}>
                    <div style={{
                      fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)',
                      lineHeight: '1', marginBottom: '10px',
                      transition: 'color 0.15s',
                    }}>
                      {label}
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.12)',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: 0 }}>
            © {new Date().getFullYear()} Libreya. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="https://x.com/libreya_app" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://instagram.com/libreya_app" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="mailto:hello@libreya.app" aria-label="Email" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        .layout-desktop-nav {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .layout-hamburger {
          display: none;
        }
        .nav-link:hover {
          background-color: rgba(198,167,94,0.1) !important;
          color: var(--heading) !important;
        }
        @media (max-width: 768px) {
          .layout-desktop-nav { display: none; }
          .layout-hamburger { display: block; }
        }
      `}</style>
    </div>
  );
}
