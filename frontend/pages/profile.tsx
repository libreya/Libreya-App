import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppStore } from '../lib/store-web';
import { api } from '../lib/api';

// ── SVG icons ────────────────────────────────────────────────────────────────
const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'var(--border)' }}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const Icon = ({ d, color = 'var(--text)', size = 22 }: { d: string; color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: color }}>
    <path d={d} />
  </svg>
);

const ICONS = {
  settings:  'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  doc:       'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  shield:    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  info:      'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01',
  logout:    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  trash:     'M3 6h18 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6 M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  edit:      'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  sun:       'M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10z M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42',
};

// ── Menu item ─────────────────────────────────────────────────────────────────
function MenuItem({ iconPath, label, onClick, danger = false, href }: {
  iconPath: string; label: string; onClick?: () => void; danger?: boolean; href?: string;
}) {
  const color = danger ? '#c92a2a' : 'var(--text)';
  const inner = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 16px', borderRadius: '12px', backgroundColor: 'var(--surface)',
      marginBottom: '8px', cursor: 'pointer',
    }}>
      <Icon d={iconPath} color={color} size={22} />
      <span style={{ flex: 1, fontSize: '1rem', color }}>{label}</span>
      <ChevronRight />
    </div>
  );
  if (href) return <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>;
  return <div onClick={onClick} role="button">{inner}</div>;
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '8px 16px 0' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '10px' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const deleteAccount = useAppStore((s) => s.deleteAccount);
  const signOut = useAppStore((s) => s.signOut);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const isGuest = user?.auth_provider === 'guest';

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError('');
    try {
      await api.patch(`/users/${user.id}`, { display_name: displayName, bio });
      setUser({ ...user, display_name: displayName, bio });
      setEditing(false);
    } catch {
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (!window.confirm('Are you sure you want to sign out?')) return;
    try {
      await signOut();
      router.push('/');
    } catch {
      window.alert('Failed to sign out. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.')) return;
    try {
      await deleteAccount();
      window.alert('Your account and all data have been successfully erased.');
      router.push('/');
    } catch (err: any) {
      window.alert(`Error: ${err?.message || 'Failed to delete account. Please try again.'}`);
    }
  };

  const initial = (user?.display_name?.[0] ?? user?.email?.[0] ?? 'G').toUpperCase();

  // ── Not signed in ────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <Head><title>Profile - Libreya</title></Head>
        <div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#2b2b2b',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>?</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Not Signed In</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please sign in to view your profile.</p>
          <Link href="/auth">
            <button style={btnStyle('#2b2b2b', '#c6a75e')}>Sign In</button>
          </Link>
        </div>
      </>
    );
  }

  // ── Profile ──────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>My Profile - Libreya</title>
        <meta name="description" content="Your reading profile on Libreya" />
      </Head>

      <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '48px' }}>

        {/* ── Avatar header ── */}
        <div style={{ textAlign: 'center', padding: '32px 24px 24px' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#2b2b2b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', overflow: 'hidden',
          }}>
            {user.avatar_url
              ? <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#fff' }}>{initial}</span>
            }
          </div>

          {editing ? (
            /* ── Edit form ── */
            <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                style={inputStyle}
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
              {saveError && <p style={{ color: '#c92a2a', fontSize: '0.875rem', marginBottom: '8px' }}>{saveError}</p>}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => setEditing(false)} style={btnStyle('var(--surface)', 'var(--text)', '1px solid var(--border)')}>Cancel</button>
                <button onClick={handleSaveProfile} disabled={saving} style={btnStyle('#2b2b2b', '#c6a75e')}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px' }}>
                {user.display_name || (isGuest ? 'Guest User' : user.email)}
              </h1>
              {user.bio && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{user.bio}</p>}
              {isGuest && (
                <span style={{
                  display: 'inline-block', backgroundColor: '#c6a75e', color: '#2b2b2b',
                  fontSize: '0.75rem', fontWeight: '600', borderRadius: '12px',
                  padding: '3px 12px', marginBottom: '8px',
                }}>Guest Account</span>
              )}
              <br />
              <button
                onClick={() => setEditing(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', padding: '4px 0' }}
              >
                Edit Profile
              </button>
            </>
          )}
        </div>

        {/* ── Guest signup prompt ── */}
        {isGuest && (
          <div style={{ margin: '0 16px 8px', padding: '20px', borderRadius: '16px', backgroundColor: 'var(--surface)', textAlign: 'center' }}>
            <p style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '6px' }}>Create an Account</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Sign up to sync your reading progress, favorites, and highlights across devices.
            </p>
            <Link href="/auth">
              <button style={btnStyle('#2b2b2b', '#c6a75e')}>Sign Up</button>
            </Link>
          </div>
        )}

        {/* ── Appearance ── */}
        <Section title="APPEARANCE">
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <Icon d={ICONS.sun} color="var(--text)" size={22} />
              <span style={{ fontSize: '1rem', color: 'var(--text)' }}>Theme</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['light', 'sepia', 'dark', 'night'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    flex: 1, padding: '6px 4px', borderRadius: '8px', fontSize: '0.75rem',
                    fontWeight: theme === t ? '600' : '400', cursor: 'pointer',
                    border: `1.5px solid ${theme === t ? 'var(--heading)' : 'var(--border)'}`,
                    backgroundColor: theme === t ? 'var(--heading)' : 'var(--surface)',
                    color: theme === t ? 'var(--bg)' : 'var(--text-secondary)',
                    textTransform: 'capitalize',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Admin ── */}
        {user.is_admin && (
          <Section title="ADMIN">
            <MenuItem iconPath={ICONS.settings} label="Admin Dashboard" href="/admin" />
          </Section>
        )}

        {/* ── Legal ── */}
        <Section title="LEGAL">
          <MenuItem iconPath={ICONS.doc}    label="Terms and Conditions" href="/legal/terms" />
          <MenuItem iconPath={ICONS.shield} label="Privacy Notice"        href="/legal/privacy" />
          <MenuItem iconPath={ICONS.info}   label="Legal Notice"          href="/legal/legal" />
        </Section>

        {/* ── Account ── */}
        <Section title="ACCOUNT">
          {!isGuest && (
            <MenuItem iconPath={ICONS.logout} label="Sign Out"       onClick={handleSignOut} />
          )}
          <MenuItem iconPath={ICONS.trash}  label="Delete Account" onClick={handleDeleteAccount} danger />
        </Section>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '24px' }}>
          Libreya v1.0.0
        </p>
      </div>

      <style>{`
        @media (max-width: 480px) {
          input, textarea { font-size: 16px !important; }
        }
      `}</style>
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '12px 14px', fontSize: '1rem',
  borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)',
  marginBottom: '12px', boxSizing: 'border-box',
};

function btnStyle(bg: string, color: string, border = 'none'): React.CSSProperties {
  return {
    padding: '11px 28px', borderRadius: '10px', fontSize: '0.9375rem',
    fontWeight: '600', cursor: 'pointer', border, backgroundColor: bg, color,
  };
}

export async function getServerSideProps() {
  return { props: {} };
}
