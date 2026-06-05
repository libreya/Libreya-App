import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAppStore } from '../lib/store-web';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const user = useAppStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user || !user.is_admin) {
      router.push('/');
    }
  }, [user, router]);

  if (!user || !user.is_admin) {
    return (
      <>
        <Head>
          <title>Admin - Libreya</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <header>
          <h1>Admin Dashboard</h1>
          <Link href="/" style={{ color: 'white' }}>
            Back to Home
          </Link>
        </header>
        <main className="container">
          <p>Access denied. Admin privileges required.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Libreya</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <header>
        <h1>Admin Dashboard</h1>
        <Link href="/" style={{ color: 'white' }}>
          Back to Home
        </Link>
      </header>
      <main className="container" style={{ maxWidth: '1000px' }}>
        <section style={{ backgroundColor: '#f5efe6', padding: '30px', borderRadius: '8px' }}>
          <h2>Welcome, {user.display_name}</h2>
          <p>This is the admin dashboard for Libreya.</p>

          <div style={{ marginTop: '30px' }}>
            <h3>Admin Functions</h3>
            <ul style={{ marginLeft: '20px', marginTop: '15px' }}>
              <li>Manage books and content</li>
              <li>View user statistics</li>
              <li>Update settings</li>
              <li>Monitor system health</li>
            </ul>
          </div>

          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '4px' }}>
            <h4>Quick Stats</h4>
            <p>Detailed analytics coming soon...</p>
          </div>
        </section>
      </main>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 3600,
  };
}
