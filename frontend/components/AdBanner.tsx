import { useEffect, useRef, useState } from 'react';
import { hasAdConsent } from '../lib/adConsent';

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
  const [adState, setAdState] = useState<'loading' | 'filled' | 'empty'>('loading');

  useEffect(() => {
    if (!slot) return;

    // Guard only the push itself (not the timer below) so React Strict Mode's
    // dev-only double-invoke (mount -> cleanup -> mount) doesn't skip
    // rescheduling the fill-check timer on the second, real mount.
    if (!pushed.current) {
      pushed.current = true;

      if (insRef.current && !hasAdConsent()) {
        // No explicit ad-consent yet — request non-personalized ads only.
        insRef.current.setAttribute('data-npa', '1');
      }

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (_) {
        setAdState('empty'); // AdSense not loaded — hide the slot entirely
        return;
      }
    }

    // Give AdSense time to fill; only count it as filled when a real visible ad
    // iframe exists — an unapproved/unfilled slot still injects an invisible iframe
    // which would otherwise trick an offsetHeight-only check.
    const timer = setTimeout(() => {
      const iframe = insRef.current?.querySelector<HTMLIFrameElement>('iframe');
      const filled = !!iframe && iframe.offsetWidth > 50 && iframe.offsetHeight > 50;
      setAdState(filled ? 'filled' : 'empty');
    }, 2500);

    return () => clearTimeout(timer);
  }, [slot]);

  if (!slot || adState === 'empty') return null;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        minHeight: adState === 'loading' ? '90px' : undefined,
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
      {adState === 'loading' && (
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
        </div>
      )}
    </div>
  );
}
