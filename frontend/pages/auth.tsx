import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppStore } from '../lib/store-web';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const signOut = useAppStore((s) => s.signOut);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-redirect to profile if authenticated
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        router.push('/profile');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMessage('Account created successfully! Redirecting to profile...');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMessage('Signed in successfully! Redirecting to profile...');

        // Trigger app initialization to sync user state
        const initializeApp = useAppStore.getState().initializeApp;
        await initializeApp();
      }
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (user) {
    return (
      <>
        <Head>
          <title>Profile - Libreya</title>
        </Head>
        <main className="container" style={{ maxWidth: '500px' }}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '8px' }}>
            <h2>Welcome, {user.display_name}!</h2>
            <p>Email: {user.email}</p>
            <p>Auth Provider: {user.auth_provider}</p>
            <button onClick={handleSignOut} style={{ marginTop: '20px', backgroundColor: '#d32f2f' }}>
              Sign Out
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Sign In - Libreya</title>
      </Head>
      <main className="container" style={{ maxWidth: '500px' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '8px' }}>
          {/* Success Message */}
          {successMessage && (
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #c3e6cb'
            }}>
              ✓ {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #f5c6cb'
            }}>
              ✗ {errorMessage}
            </div>
          )}

          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <button
              onClick={() => setMode('login')}
              style={{
                marginRight: '10px',
                backgroundColor: mode === 'login' ? '#5a1f2b' : '#ccc',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              style={{
                backgroundColor: mode === 'signup' ? '#5a1f2b' : '#ccc',
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleEmailAuth} style={{ marginBottom: '30px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
                Email:
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
                Password:
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#999' : '#5a1f2b',
              }}
            >
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-secondary)' }}>or</div>

          <button
            onClick={handleGoogleAuth}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            Sign in with Google
          </button>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9em' }}>
          <p>
            By signing up, you agree to our{' '}
            <Link href="/legal/terms" style={{ color: '#5a1f2b' }}>
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" style={{ color: '#5a1f2b' }}>
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {},
    
  };
}
