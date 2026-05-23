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

  if (hidden) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10000,
      backgroundColor: '#1a1a1a', color: '#e8e8e8',
      borderTop: '2px solid #c6a75e',
      padding: '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '12px',
    }}>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5', flex: 1, minWidth: '240px' }}>
        We use cookies for analytics and advertising to keep Libreya free.{' '}
        <Link href="/legal/privacy" style={{ color: '#c6a75e', textDecoration: 'underline' }}>
          Privacy Policy
        </Link>
      </p>
      <button
        onClick={accept}
        style={{
          backgroundColor: '#c6a75e', color: '#1a1a1a',
          border: 'none', borderRadius: '6px',
          padding: '10px 24px', fontSize: '0.875rem', fontWeight: '700',
          cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        Accept
      </button>
    </div>
  );
}
