import React from 'react';

function Bone({ width, height, style }: { width?: string | number; height: string | number; style?: React.CSSProperties }) {
  return (
    <div
      className="skeleton"
      style={{ width: width ?? '100%', height, borderRadius: '6px', ...style }}
    />
  );
}

function BookCardSkeleton() {
  return (
    <div style={{
      width: '190px', flexShrink: 0,
      backgroundColor: 'var(--surface)', borderRadius: '12px',
      overflow: 'hidden', border: '1px solid var(--border)',
    }}>
      <Bone height={255} style={{ borderRadius: 0 }} />
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Bone height={13} width="80%" />
        <Bone height={11} width="55%" />
      </div>
    </div>
  );
}

function FavoriteCardSkeleton() {
  return (
    <div style={{
      backgroundColor: 'var(--surface)', borderRadius: '8px',
      overflow: 'hidden', border: '1px solid var(--border)',
    }}>
      <Bone height={280} style={{ borderRadius: 0 }} />
      <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Bone height={14} width="80%" />
        <Bone height={12} width="55%" />
        <Bone height={11} width="35%" />
      </div>
    </div>
  );
}

export function FeaturedBooksRowSkeleton() {
  return (
    <div style={{ display: 'flex', gap: '16px', overflow: 'hidden', paddingBottom: '12px' }}>
      {Array.from({ length: 5 }).map((_, i) => <BookCardSkeleton key={i} />)}
    </div>
  );
}

export function BrowseGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
      gap: '20px',
    }}>
      {Array.from({ length: count }).map((_, i) => <BookCardSkeleton key={i} />)}
    </div>
  );
}

export function FavoritesGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '30px',
      marginTop: '30px',
    }}>
      {Array.from({ length: count }).map((_, i) => <FavoriteCardSkeleton key={i} />)}
    </div>
  );
}
