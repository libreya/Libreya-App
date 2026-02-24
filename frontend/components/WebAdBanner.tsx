import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export default function WebAdBanner() {
  const adRef = useRef<HTMLModElement | null>(null);
  const [visible, setVisible] = useState(true); // show popup by default

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!adRef.current) return;

    const timeout = setTimeout(() => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  if (Platform.OS !== 'web' || !visible) return null;

  return (
    <div
      onClick={() => setVisible(false)} // click anywhere to close
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)', // dim background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking ad
        style={{
          width: '320px',
          height: '50px',
          backgroundColor: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
        }}
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '320px', height: '50px' }}
          data-ad-client="ca-pub-4299148862195882" 
          data-ad-slot="9986559126"
          data-ad-format="auto"
        />
      </div>
    </div>
  );
}