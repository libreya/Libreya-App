import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  style?: React.CSSProperties;
  className?: string;
}

export default function AdBanner({ slot = '', format = 'auto', style, className }: AdBannerProps) {
  const pushed = useRef(false);
  const insRef = useRef<HTMLModElement>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    if (!slot || pushed.current) return;
    pushed.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {
      return; // AdSense not loaded — keep placeholder
    }

    // Give AdSense time to fill; if it does, reveal the ad by hiding the placeholder
    const timer = setTimeout(() => {
      if (insRef.current && insRef.current.offsetHeight > 50) {
        setShowPlaceholder(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [slot]);

  if (!slot) return null;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        minHeight: showPlaceholder ? '90px' : undefined,
        textAlign: 'center',
        overflow: 'hidden',
        ...style,
      }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4299148862195882"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      {showPlaceholder && (
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '1.5px dashed #c6a75e',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          backgroundColor: 'var(--surface)',
          opacity: 0.8,
        }}>
          <span style={{ fontSize: '1.3em' }}>📢</span>
          <span style={{
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: '0.75em',
            color: '#c6a75e',
          }}>
            Advertisement
          </span>
          <span style={{
            fontSize: '0.75em',
            color: 'var(--text-secondary)',
            opacity: 0.8,
          }}>
            Support Libreya by disabling your ad blocker
          </span>
        </div>
      )}
    </div>
  );
}
