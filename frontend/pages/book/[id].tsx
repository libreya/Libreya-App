import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAppStore } from '../../lib/store-web';

interface Chapter {
  id: number;
  title: string;
  content: string;
  startPos: number;
}

export default function BookPage() {
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

  useEffect(() => {
    if (id && typeof id === 'string') {
      const bookId = parseInt(id);
      fetchBook(bookId);
    }
  }, [id, fetchBook]);

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

  const resetFontSize = () => {
    setFontSize(1.15);
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

  if (!currentBook) {
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
          <title>Reading {currentBook.title} - Libreya</title>
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
                  title: currentBook.title,
                  text: `Reading ${currentBook.title} by ${currentBook.author} on Libreya`,
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
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 20px',
          position: 'sticky',
          top: 45,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
            <button
              onClick={() => setShowChapterMenu(!showChapterMenu)}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '8px 12px',
                minWidth: 'auto',
                fontWeight: '600'
              }}
              title="Table of Contents"
            >
              📖 Chapters
            </button>
            <h1 style={{ margin: 0, fontSize: '1.3em', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'white' }}>
              {chapter.title}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            onClick={() => setIsReading(false)}
            style={{
              backgroundColor: '#c6a75e',
              color: 'var(--text)',
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

            nav a,
            nav button {
              font-size: 0.8em;
              padding: 4px 8px !important;
            }

            header {
              flex-direction: column;
              padding: 12px 15px !important;
              gap: 10px !important;
              top: 50px !important;
            }

            header > div:first-child {
              width: 100%;
              min-width: 0;
            }

            header h1 {
              font-size: 1.1em !important;
            }

            header button {
              padding: 6px 10px !important;
              font-size: 0.85em !important;
            }

            main {
              padding-bottom: 130px !important;
            }

            main > div:first-child {
              padding: 30px 20px !important;
            }

            main > div > div {
              font-size: 1em !important;
            }
          }

          @media (max-width: 480px) {
            nav {
              gap: 4px;
              padding: 8px 10px !important;
              justify-content: flex-start;
              overflow-x: auto;
            }

            nav a,
            nav button {
              font-size: 0.7em;
              padding: 4px 6px !important;
              flex-shrink: 0;
            }

            header {
              padding: 10px 8px !important;
              top: 45px !important;
            }

            header > div:first-child button {
              padding: 5px 8px !important;
              font-size: 0.75em !important;
            }

            header h1 {
              font-size: 1em !important;
            }

            header > div:last-child {
              gap: 5px !important;
              align-items: center;
            }

            header > div:last-child button {
              padding: 5px 8px !important;
              font-size: 0.7em !important;
            }

            header > div:last-child span {
              font-size: 0.7em !important;
              min-width: 35px !important;
            }

            header > button {
              padding: 5px 10px !important;
              font-size: 0.75em !important;
              margin-left: 5px !important;
            }

            main {
              max-width: 100% !important;
              padding: 10px !important;
              padding-bottom: 140px !important;
            }

            main > div:first-child {
              padding: 20px 15px !important;
              border-radius: 8px !important;
              margin-bottom: 20px !important;
            }

            main > div > div {
              font-size: 0.95em !important;
              line-height: 1.8 !important;
            }

            footer-nav {
              padding: 15px !important;
              gap: 10px !important;
            }

            footer-nav button {
              padding: 10px 12px !important;
              font-size: 0.8em !important;
            }

            footer-nav > div {
              flex: 1 !important;
            }

            footer-nav p {
              font-size: 0.8em !important;
            }

            div[style*="position: fixed"][style*="bottom: 0"] {
              flex-direction: column !important;
              padding: 10px !important;
              gap: 8px !important;
            }

            div[style*="position: fixed"][style*="bottom: 0"] button {
              padding: 10px 12px !important;
              font-size: 0.8em !important;
              flex: 1 !important;
            }

            div[style*="position: fixed"][style*="bottom: 0"] > div:nth-child(2) {
              flex: 1 !important;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{currentBook.title} - Libreya</title>
        <meta name="description" content={`Read ${currentBook.title} by ${currentBook.author} on Libreya`} />
      </Head>

      <header>
        <h1 style={{ color: 'white' }}>{currentBook.title}</h1>
        <Link href="/browse" style={{ color: 'white' }}>
          Back to Browse
        </Link>
      </header>

      <main className="container" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {currentBook.cover_image && (
            <div style={{
              flex: '0 0 250px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <img
                src={currentBook.cover_image}
                alt={currentBook.title}
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
                {currentBook.read_count || 0} readers
              </p>
            </div>
          )}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 style={{ marginBottom: '10px', borderBottom: 'none', paddingBottom: '0' }}>{currentBook.title}</h2>
            <p style={{ fontSize: '1.3em', color: '#c6a75e', marginBottom: '25px', fontStyle: 'italic' }}>
              by <strong style={{ color: 'var(--heading)' }}>{currentBook.author}</strong>
            </p>
            
            <div style={{
              backgroundColor: 'var(--surface)',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '25px',
              borderLeft: '4px solid #c6a75e'
            }}>
              {currentBook.category && (
                <p style={{ marginBottom: '10px' }}>
                  <strong>Category:</strong> <span style={{ color: 'var(--text-secondary)' }}>{currentBook.category}</span>
                </p>
              )}
              <p style={{ marginBottom: '10px' }}>
                <strong>Status:</strong> <span style={{ color: '#4CAF50' }}>Available</span>
              </p>
            </div>

            {currentBook.description && (
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ marginBottom: '12px' }}>About</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{currentBook.description}</p>
              </div>
            )}

            <div style={{
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

        <section style={{
          marginTop: '50px',
          paddingTop: '30px',
          borderTop: '3px solid #c6a75e'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Preview</h3>
          {currentBook.content_body ? (
            <div
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
            <p style={{ color: 'var(--text-secondary)' }}>No preview available. Start reading to see the full content.</p>
          )}
          {currentBook.content_body && currentBook.content_body.length > 800 && (
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
      </main>
    </>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}
