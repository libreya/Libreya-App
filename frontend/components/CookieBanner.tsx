import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'libreya_cookie_consent';

export function CookieBanner() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      setHidden(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setHidden(true);
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'dismissed');
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div role="dialog" aria-label="Cookie consent" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      backgroundColor: '#1a1a1a', color: '#e8e8e8',
      borderTop: '2px solid #c6a75e',
      padding: '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '10px',
    }}>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5', flex: 1, minWidth: '200px' }}>
        We use cookies for analytics and advertising to keep Libreya free.{' '}
        <Link href="/legal/privacy" style={{ color: '#c6a75e', textDecoration: 'underline' }}>
          Privacy Policy
        </Link>
      </p>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
        <button
          onClick={accept}
          style={{
            backgroundColor: '#c6a75e', color: '#1a1a1a',
            border: 'none', borderRadius: '6px',
            padding: '9px 20px', fontSize: '0.875rem', fontWeight: '700',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          Accept
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss cookie notice"
          style={{
            backgroundColor: 'transparent', color: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px',
            padding: '9px 14px', fontSize: '0.875rem',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
