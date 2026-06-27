import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAppStore } from '../../lib/store-web';
import { supabase } from '../../lib/supabase';
import AdBanner from '../../components/AdBanner';
import { AUTHOR_BIOS } from '../../lib/authorBios';

interface Chapter {
  id: number;
  title: string;
  content: string;
  startPos: number;
}

interface InitialBook {
  id: number;
  title: string;
  author: string;
  category?: string;
  cover_image?: string;
  description?: string;
  source_url?: string;
  read_count?: number;
}

interface RelatedBook {
  id: number;
  title: string;
  author: string;
  cover_image?: string;
  category?: string;
}

interface BookPageProps {
  initialBook: InitialBook | null;
  relatedBooks: RelatedBook[];
}

export default function BookPage({ initialBook, relatedBooks }: BookPageProps) {
  const router = useRouter();
  const { id } = router.query;
  const fetchBook = useAppStore((s) => s.fetchBook);
  const currentBook = useAppStore((s) => s.currentBook);
  const user = useAppStore((s) => s.user);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const updateActivity = useAppStore((s) => s.updateActivity);
  const currentActivity = useAppStore((s) => s.currentActivity);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [fontSize, setFontSize] = useState(1.15);
  const [chaptersLoaded, setChaptersLoaded] = useState(false);
  const [lastSavedChapter, setLastSavedChapter] = useState<number | null>(null);
  const [gutendexSummary, setGutendexSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const bookId = parseInt(id);
      fetchBook(bookId);
    }
  }, [id, fetchBook]);

  useEffect(() => {
    if (!currentBook) return;
    if (currentBook.description) return;

    const gutenbergId = currentBook.source_url?.split('/').pop();
    if (!gutenbergId) return;

    const controller = new AbortController();
    setGutendexSummary(null);
    setSummaryLoading(true);

    fetch(`/api/gutendex?id=${gutenbergId}`, { signal: controller.signal })
      .then(r => r.json())
      .then(async data => {
        const summary: string | undefined = data.summaries?.[0];
        if (!summary) return;
        setGutendexSummary(summary);
        await supabase.from('books').update({ description: summary }).eq('id', currentBook.id);
      })
      .catch(err => { if (err.name !== 'AbortError') console.error(err); })
      .finally(() => setSummaryLoading(false));

    return () => controller.abort();
  }, [currentBook?.id]);

  useEffect(() => {
    setIsFavorite(currentActivity?.is_favorite || false);
  }, [currentActivity]);

  // Extract chapters from content
  useEffect(() => {
    if (currentBook?.content_body) {
      const extractedChapters: Chapter[] = [];
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = currentBook.content_body;

      const h2s = Array.from(tempDiv.querySelectorAll('h2'));

      if (h2s.length === 0) {
        // No chapter headings found, treat entire content as one chapter
        extractedChapters.push({
          id: 0,
          title: currentBook.title,
          content: currentBook.content_body,
          startPos: 0
        });
      } else {
        // Process each h2 and collect all content until the next h2
        h2s.forEach((h2, index) => {
          const chapterTitle = h2.textContent || 'Chapter ' + (index + 1);
          let chapterContent = h2.outerHTML;

          // Collect all content (elements and text) after this h2 until the next h2
          let currentNode = h2.nextSibling;
          while (currentNode) {
            // Stop if we hit the next h2
            if (currentNode.nodeType === Node.ELEMENT_NODE && (currentNode as Element).tagName === 'H2') {
              break;
            }

            if (currentNode.nodeType === Node.ELEMENT_NODE) {
              chapterContent += (currentNode as Element).outerHTML;
            } else if (currentNode.nodeType === Node.TEXT_NODE) {
              const text = currentNode.textContent || '';
              if (text.trim()) {
                chapterContent += text;
              }
            }

            currentNode = currentNode.nextSibling;
          }

          extractedChapters.push({
            id: index,
            title: chapterTitle,
            content: chapterContent,
            startPos: index
          });
        });
      }

      setChapters(extractedChapters);
      // Restore to the last visited chapter (if available)
      const lastVisitedChapter = currentActivity?.last_position || 0;
      const validChapter = Math.min(Math.max(lastVisitedChapter, 0), extractedChapters.length - 1);
      setCurrentChapter(validChapter);
      setLastSavedChapter(validChapter);
      setChaptersLoaded(true);
    }
  }, [currentBook?.content_body]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Please sign in to save favorites');
      return;
    }
    if (currentBook) {
      await toggleFavorite(currentBook.id);
      setIsFavorite(!isFavorite);
    }
  };

  useEffect(() => {
    if (isReading) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentChapter, isReading]);

  const handleChapterChange = (chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
    setShowChapterMenu(false);
  };

  const goToNextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 0.1, 2));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 0.1, 0.8));
  };

  // Save chapter position to database when it changes (with debouncing)
  useEffect(() => {
    if (!user || !currentBook || !chaptersLoaded) return;

    // Only save if chapter actually changed from the last saved position
    if (lastSavedChapter === currentChapter) return;

    // Use a timeout to debounce saves (wait 1 second after last change before saving)
    const saveTimer = setTimeout(() => {
      updateActivity({ last_position: currentChapter });
      setLastSavedChapter(currentChapter);
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [currentChapter, user, currentBook, updateActivity, chaptersLoaded, lastSavedChapter]);

  // Use server-fetched data for meta/schema; fall back as content loads
  const displayBook = currentBook || initialBook;

  const description = gutendexSummary || currentBook?.description || initialBook?.description || '';
  const metaDescription = description
    ? description.substring(0, 155)
    : `Read ${displayBook?.title || ''} by ${displayBook?.author || ''} for free on Libreya. Classic literature, beautifully formatted with chapter navigation and multiple reading themes.`;

  const canonicalUrl = displayBook ? `https://libreya.app/book/${displayBook.id}` : 'https://libreya.app';
  const ogImage = displayBook?.cover_image || 'https://libreya.app/icon.png';

  const bookSchema = displayBook ? {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: displayBook.title,
    author: { '@type': 'Person', name: displayBook.author },
    description: metaDescription,
    ...(displayBook.category ? { genre: displayBook.category } : {}),
    inLanguage: 'en',
    url: canonicalUrl,
    ...(displayBook.cover_image ? { image: displayBook.cover_image } : {}),
    isAccessibleForFree: true,
    provider: { '@type': 'Organization', name: 'Libreya', url: 'https://libreya.app' },
  } : null;

  const authorInfo = displayBook ? AUTHOR_BIOS[displayBook.author] : null;

  if (!displayBook) {
    return (
      <>
        <Head>
          <title>Loading - Libreya</title>
        </Head>
        <header>
          <h1>Loading...</h1>
          <Link href="/browse" style={{ color: 'white' }}>
            Back to Browse
          </Link>
        </header>
        <main className="container">
          <p>Loading book details...</p>
        </main>
      </>
    );
  }

  if (isReading && chapters.length > 0) {
    const chapter = chapters[currentChapter];
    const progressPercent = ((currentChapter + 1) / chapters.length) * 100;

    return (
      <>
        <Head>
          <title>Reading {displayBook.title} - Libreya</title>
          <meta name="description" content={metaDescription} />
          {bookSchema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
            />
          )}
        </Head>

        {/* Top Navigation Menu */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          backgroundColor: '#5a1f2b',
          borderBottom: '2px solid #c6a75e',
          position: 'sticky',
          top: 0,
          zIndex: 101
        }}>
          <Link href="/" style={{ color: 'white', fontWeight: '600', textDecoration: 'none' }}>
            📚 Home
          </Link>
          <button
            onClick={handleToggleFavorite}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              fontSize: '1em',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '6px 12px'
            }}
            title={isFavorite ? 'Added to favorites' : 'Add to favorites'}
          >
            {isFavorite ? '❤️ Favorites' : '🤍 Favorites'}
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: displayBook.title,
                  text: `Reading ${displayBook.title} by ${displayBook.author} on Libreya`,
                  url: window.location.href
                });
              } else {
                alert('Share this book: ' + window.location.href);
              }
            }}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              fontSize: '1em',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '6px 12px'
            }}
          >
            📤 Share
          </button>
          <Link href="/profile" style={{ color: 'white', fontWeight: '600', textDecoration: 'none' }}>
            👤 Profile
          </Link>
        </nav>

        {/* Chapter Reading Header */}
        <header className="reader-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 20px',
          position: 'sticky',
          top: 45,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <button
            className="reader-chapters-btn"
            onClick={() => setShowChapterMenu(!showChapterMenu)}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '8px 12px',
              minWidth: 'auto',
              fontWeight: '600',
              flexShrink: 0
            }}
            title="Table of Contents"
          >
            📖 Chapters
          </button>
          <h1 className="reader-title" style={{ margin: '0 15px', fontSize: '1.3em', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'white' }}>
            {chapter.title}
          </h1>
          <div className="reader-font-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={decreaseFontSize}
              title="Decrease font size"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '6px 10px',
                minWidth: 'auto',
                fontWeight: '600',
                fontSize: '1.1em'
              }}
            >
              A−
            </button>
            <span style={{ color: 'white', fontSize: '0.85em', minWidth: '45px', textAlign: 'center' }}>
              {Math.round(fontSize * 100)}%
            </span>
            <button
              onClick={increaseFontSize}
              title="Increase font size"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '6px 10px',
                minWidth: 'auto',
                fontWeight: '600',
                fontSize: '1.1em'
              }}
            >
              A+
            </button>
          </div>
          <button
            className="reader-back-btn"
            onClick={() => setIsReading(false)}
            style={{
              backgroundColor: '#c6a75e',
              color: '#2b2b2b',
              padding: '8px 16px',
              minWidth: 'auto',
              fontWeight: '600',
              marginLeft: '15px'
            }}
          >
            ← Back
          </button>
        </header>

        {showChapterMenu && (
          <div style={{
            position: 'fixed',
            left: 0,
            right: 0,
            top: '80px',
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 99
          }} onClick={() => setShowChapterMenu(false)}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '280px',
              height: '100%',
              backgroundColor: 'var(--bg)',
              overflowY: 'auto',
              boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
              animation: 'slideIn 0.3s ease'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                padding: '20px',
                borderBottom: '2px solid #c6a75e',
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--bg)'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--heading)' }}>Table of Contents</h3>
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'var(--border)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    backgroundColor: '#c6a75e',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <p style={{ margin: '10px 0 0 0', fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                  Chapter {currentChapter + 1} of {chapters.length}
                </p>
              </div>
              <div style={{ padding: '10px' }}>
                {chapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => handleChapterChange(idx)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 15px',
                      margin: '5px 0',
                      backgroundColor: idx === currentChapter ? '#c6a75e' : 'var(--surface)',
                      color: idx === currentChapter ? '#2b2b2b' : 'var(--text)',
                      border: '1px solid ' + (idx === currentChapter ? '#5a1f2b' : 'var(--border)'),
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontWeight: idx === currentChapter ? '700' : '500'
                    }}
                  >
                    {idx + 1}. {ch.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <main className="container" style={{ maxWidth: '900px', paddingTop: '20px', paddingBottom: '100px' }}>
          <div style={{
            backgroundColor: 'var(--bg)',
            padding: '50px 45px',
            borderRadius: '12px',
            lineHeight: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--border)',
            marginBottom: '40px'
          }}>
            <div
              dangerouslySetInnerHTML={{ __html: chapter.content }}
              style={{
                color: 'var(--text)',
                fontSize: `${fontSize}em`,
                fontFamily: "'Libre Baskerville', Georgia, serif",
                textAlign: 'justify',
              }}
            />
          </div>

          {/* Navigation Footer */}
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#5a1f2b',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.2)',
            zIndex: 50
          }}>
            <button
              onClick={goToPreviousChapter}
              disabled={currentChapter === 0}
              style={{
                backgroundColor: currentChapter === 0 ? '#999' : '#c6a75e',
                color: 'var(--text)',
                padding: '12px 24px',
                fontWeight: '600',
                flex: 1
              }}
            >
              ← Previous
            </button>

            <div style={{
              color: 'white',
              textAlign: 'center',
              flex: 2
            }}>
              <p style={{ margin: 0, fontSize: '0.9em' }}>
                Chapter {currentChapter + 1} of {chapters.length}
              </p>
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '8px'
              }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  backgroundColor: '#c6a75e',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <button
              onClick={goToNextChapter}
              disabled={currentChapter === chapters.length - 1}
              style={{
                backgroundColor: currentChapter === chapters.length - 1 ? '#999' : '#c6a75e',
                color: 'var(--text)',
                padding: '12px 24px',
                fontWeight: '600',
                flex: 1
              }}
            >
              Next →
            </button>
          </div>
        </main>

        <style>{`
          @keyframes slideIn {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0);
            }
          }

          nav {
            gap: 15px;
          }

          nav a,
          nav button {
            font-size: 0.95em;
            white-space: nowrap;
          }

          @media (max-width: 768px) {
            nav {
              gap: 8px;
              padding: 10px 15px !important;
            }
            nav a, nav button {
              font-size: 0.8em;
              padding: 4px 8px !important;
            }

            /* Reader header: 2-row layout on mobile
               Row 1: [← Back]  [📖 Chapters]  [A− % A+]
               Row 2: [Chapter title — full width]          */
            .reader-header {
              flex-wrap: wrap;
              padding: 10px 12px !important;
              gap: 8px;
              top: 44px !important;
            }
            .reader-back-btn {
              order: 0;
              padding: 7px 14px !important;
              font-size: 0.875em !important;
              margin-left: 0 !important;
              flex-shrink: 0;
            }
            .reader-chapters-btn {
              order: 1;
              padding: 6px 10px !important;
              font-size: 0.8em !important;
              flex-shrink: 0;
            }
            .reader-font-controls {
              order: 2;
              margin-left: auto;
              gap: 6px !important;
            }
            .reader-font-controls button {
              padding: 5px 9px !important;
              font-size: 0.9em !important;
            }
            .reader-font-controls span {
              font-size: 0.78em !important;
              min-width: 36px !important;
            }
            /* Title: own full-width row below the controls */
            .reader-title {
              order: 3;
              flex: 0 0 100% !important;
              margin: 0 !important;
              font-size: 1em !important;
              white-space: normal !important;
              overflow: visible !important;
              text-overflow: unset !important;
            }

            main {
              padding-bottom: 130px !important;
            }
            main > div:first-child {
              padding: 24px 16px !important;
            }
          }

          @media (max-width: 480px) {
            nav {
              gap: 4px;
              padding: 8px 10px !important;
              overflow-x: auto;
            }
            nav a, nav button {
              font-size: 0.72em;
              padding: 4px 6px !important;
              flex-shrink: 0;
            }

            .reader-header {
              padding: 8px 10px !important;
            }
            .reader-back-btn {
              padding: 6px 12px !important;
              font-size: 0.8em !important;
            }
            .reader-title {
              font-size: 0.9em !important;
            }

            main {
              max-width: 100% !important;
              padding: 8px !important;
              padding-bottom: 140px !important;
            }
            main > div:first-child {
              padding: 18px 14px !important;
              border-radius: 8px !important;
              margin-bottom: 16px !important;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{displayBook.title} by {displayBook.author} – Free Classic Literature | Libreya</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="book" />
        <meta property="og:title" content={`${displayBook.title} by ${displayBook.author} – Libreya`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Libreya" />
        {displayBook.author && <meta property="book:author" content={displayBook.author} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${displayBook.title} by ${displayBook.author}`} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
        {bookSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
          />
        )}
      </Head>

      <header>
        <h1 style={{ color: 'white' }}>{displayBook.title}</h1>
        <Link href="/browse" style={{ color: 'white' }}>
          Back to Browse
        </Link>
      </header>

      <main className="container" style={{ maxWidth: '900px' }}>
        <div className="book-layout" style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {displayBook.cover_image && (
            <div className="book-cover-col" style={{
              flex: '0 0 250px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <img
                className="book-cover-img"
                src={displayBook.cover_image}
                alt={`${displayBook.title} book cover`}
                style={{
                  width: '100%',
                  maxWidth: '250px',
                  height: '350px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  border: '2px solid #c6a75e'
                }}
              />
              <p style={{ marginTop: '15px', fontSize: '0.95em', color: 'var(--text-secondary)', textAlign: 'center' }}>
                {(currentBook?.read_count ?? displayBook.read_count) || 0} readers
              </p>
            </div>
          )}
          <div className="book-info-col" style={{ flex: 1, minWidth: '300px' }}>
            <h2 className="book-detail-title" style={{ marginBottom: '10px', borderBottom: 'none', paddingBottom: '0' }}>{displayBook.title}</h2>
            <p style={{ fontSize: '1.3em', color: '#c6a75e', marginBottom: '25px', fontStyle: 'italic' }}>
              by <strong style={{ color: 'var(--heading)' }}>{displayBook.author}</strong>
            </p>

            <div style={{
              backgroundColor: 'var(--surface)',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '25px',
              borderLeft: '4px solid #c6a75e'
            }}>
              {displayBook.category && (
                <p style={{ marginBottom: '10px' }}>
                  <strong>Category:</strong> <span style={{ color: 'var(--text-secondary)' }}>{displayBook.category}</span>
                </p>
              )}
              <p style={{ marginBottom: '10px' }}>
                <strong>Status:</strong> <span style={{ color: '#4CAF50' }}>Available</span>
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Source:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>Public Domain — Project Gutenberg</span>
              </p>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ marginBottom: '12px' }}>About This Book</h4>
              {summaryLoading ? (
                <div aria-label="Loading summary">
                  {[100, 90, 95, 70].map((w, i) => (
                    <div key={i} style={{
                      height: '14px',
                      width: `${w}%`,
                      borderRadius: '6px',
                      backgroundColor: 'var(--border)',
                      marginBottom: '10px',
                      animation: 'skeletonPulse 1.4s ease-in-out infinite'
                    }} />
                  ))}
                </div>
              ) : (gutendexSummary || currentBook?.description || initialBook?.description) ? (
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  {gutendexSummary || currentBook?.description || initialBook?.description}
                </p>
              ) : null}
            </div>

            <div className="book-actions" style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '30px'
            }}>
              <button
                onClick={handleToggleFavorite}
                style={{
                  backgroundColor: isFavorite ? '#c6a75e' : 'transparent',
                  color: isFavorite ? '#2b2b2b' : 'var(--heading)',
                  border: '2px solid var(--heading)',
                  flex: '1',
                  minWidth: '160px'
                }}
              >
                {isFavorite ? '★ Saved' : '☆ Save for Later'}
              </button>
              <button
                onClick={() => setIsReading(true)}
                style={{
                  backgroundColor: '#c6a75e',
                  color: 'var(--text)',
                  flex: '1',
                  minWidth: '160px',
                  fontWeight: '700'
                }}
              >
                📖 Start Reading
              </button>
            </div>
          </div>
        </div>

        {/* Author Bio */}
        {authorInfo && (
          <section style={{
            marginBottom: '40px',
            padding: '24px 28px',
            backgroundColor: 'var(--surface)',
            borderRadius: '10px',
            borderLeft: '4px solid #c6a75e'
          }}>
            <h3 style={{ marginBottom: '6px' }}>About the Author</h3>
            <p style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '500' }}>
              {authorInfo.nationality} · {authorInfo.years}
            </p>
            <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: 0 }}>
              {authorInfo.bio}
            </p>
          </section>
        )}

        <AdBanner slot="9986559126" format="horizontal" style={{ margin: '40px 0' }} />

        <section style={{
          marginTop: '10px',
          paddingTop: '30px',
          borderTop: '3px solid #c6a75e'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Preview</h3>
          {currentBook?.content_body ? (
            <div
              className="book-preview-content"
              dangerouslySetInnerHTML={{ __html: currentBook.content_body.substring(0, 800) }}
              style={{
                lineHeight: '1.8',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--surface)',
                padding: '25px',
                borderRadius: '8px',
                borderLeft: '4px solid #c6a75e',
                marginBottom: '20px',
                maxHeight: '400px',
                overflow: 'hidden',
                position: 'relative'
              }}
            />
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>
              {currentBook
                ? 'No preview available. Start reading to see the full content.'
                : 'Loading preview...'}
            </p>
          )}
          {currentBook?.content_body && currentBook.content_body.length > 800 && (
            <div style={{
              textAlign: 'center',
              paddingTop: '20px',
              backgroundImage: 'linear-gradient(transparent, var(--bg))',
              marginTop: '-60px',
              paddingBottom: '40px'
            }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95em' }}>... (scroll to read more)</p>
            </div>
          )}
        </section>

        {/* About This Edition */}
        <section style={{
          marginTop: '40px',
          padding: '24px 28px',
          backgroundColor: 'var(--surface)',
          borderRadius: '10px',
          borderTop: '3px solid #c6a75e'
        }}>
          <h3 style={{ marginBottom: '12px' }}>About This Edition</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: 0 }}>
            This edition of <em>{displayBook.title}</em> is sourced from Project Gutenberg, the world's oldest digital
            library of public domain literature. The text has been carefully formatted for comfortable reading on any
            screen — with consistent chapter navigation, adjustable font sizes, and multiple reading themes including
            light, sepia, dark, and night modes. The original text has not been altered in any way.
          </p>
        </section>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <section style={{ marginTop: '48px', paddingBottom: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>
              More {displayBook.category ? displayBook.category + ' Classics' : 'Classic Books'}
            </h3>
            <div className="related-books-grid" style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              {relatedBooks.map(book => (
                <Link
                  key={book.id}
                  href={`/book/${book.id}`}
                  style={{ textDecoration: 'none', flex: '1', minWidth: '140px', maxWidth: '200px' }}
                >
                  <div className="related-book-card" style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}>
                    {book.cover_image ? (
                      <img
                        src={book.cover_image}
                        alt={`${book.title} cover`}
                        style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '180px',
                        backgroundColor: 'rgba(90,31,43,1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px'
                      }}>
                        <p style={{ color: '#fff', fontSize: '0.85em', textAlign: 'center', margin: 0 }}>{book.title}</p>
                      </div>
                    )}
                    <div style={{ padding: '12px' }}>
                      <p style={{
                        fontSize: '0.88em', fontWeight: '600', color: 'var(--text)',
                        marginBottom: '4px', lineHeight: '1.3',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {book.title}
                      </p>
                      <p style={{ fontSize: '0.78em', color: 'var(--text-secondary)', marginBottom: 0 }}>
                        {book.author}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .related-book-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }

        @media (max-width: 600px) {
          .book-layout {
            gap: 20px !important;
            flex-direction: column;
          }
          .book-cover-col {
            flex: 0 0 auto !important;
            flex-direction: row !important;
            align-items: flex-start !important;
            gap: 16px;
            width: 100%;
          }
          .book-cover-img {
            width: 110px !important;
            max-width: 110px !important;
            height: 155px !important;
            flex-shrink: 0;
          }
          .book-cover-col > p {
            font-size: 0.8em !important;
            margin-top: 8px !important;
            text-align: left !important;
          }
          .book-info-col {
            min-width: 0 !important;
            width: 100% !important;
          }
          .book-detail-title {
            display: none;
          }
          .book-actions {
            flex-direction: column;
          }
          .book-actions button {
            min-width: 0 !important;
            width: 100%;
            flex: none !important;
          }
          .book-preview-content {
            padding: 16px !important;
          }
          .related-books-grid {
            gap: 12px !important;
          }
          .related-books-grid > a {
            min-width: 120px !important;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps(context: { params: { id: string } }) {
  const { id } = context.params;
  const bookId = parseInt(id);

  if (isNaN(bookId)) {
    return { notFound: true };
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: book } = await supabaseServer
      .from('books')
      .select('id, title, author, category, cover_image, description, source_url, read_count')
      .eq('id', bookId)
      .single();

    if (!book) {
      return { notFound: true };
    }

    const { data: relatedBooks } = book.category
      ? await supabaseServer
          .from('books')
          .select('id, title, author, cover_image, category')
          .eq('category', book.category)
          .neq('id', bookId)
          .order('read_count', { ascending: false })
          .limit(4)
      : { data: [] };

    return {
      props: {
        initialBook: book,
        relatedBooks: relatedBooks || [],
      },
    };
  } catch {
    return {
      props: {
        initialBook: null,
        relatedBooks: [],
      },
    };
  }
}
