import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAppStore } from '../lib/store-web';

interface AuthorInfo { nationality: string; years: string; bio: string; }

const AUTHOR_BIOS: Record<string, AuthorInfo> = {
  'Jane Austen': { nationality: 'English', years: '1775–1817', bio: 'One of the most celebrated novelists in the English language, Austen\'s quiet domestic scenes carry an astonishing weight of social intelligence and psychological precision. Through the courtship plots her society expected, she embedded radical observations about women\'s limited autonomy and the moral failures of the privileged.' },
  'Charles Dickens': { nationality: 'English', years: '1812–1870', bio: 'The defining voice of Victorian England, Dickens populated his novels with some of literature\'s most vivid characters while wielding fiction as a weapon against poverty and social injustice. His serialised stories captivated millions and permanently enlarged the scope of the English novel.' },
  'Mark Twain': { nationality: 'American', years: '1835–1910', bio: 'America\'s greatest humorist and its sharpest social critic, Twain used vernacular wit and moral indignation in equal measure. His Adventures of Huckleberry Finn is widely regarded as the foundational work of American literature.' },
  'Leo Tolstoy': { nationality: 'Russian', years: '1828–1910', bio: 'A titan of world literature, Tolstoy\'s epic novels War and Peace and Anna Karenina survey the full breadth of human experience with unmatched psychological depth and moral seriousness. In later life he renounced his earlier work in favour of radical Christian pacifism.' },
  'Fyodor Dostoevsky': { nationality: 'Russian', years: '1821–1881', bio: 'Dostoevsky plunged deeper into the darkness of the human soul than almost any writer before or since. His novels — shaped by imprisonment, epilepsy, and gambling addiction — are urgent, tormented explorations of guilt, faith, and free will.' },
  'George Orwell': { nationality: 'British', years: '1903–1950', bio: 'A writer of fierce intellectual honesty, Orwell used plain prose and political fable to diagnose the dangers of totalitarianism. Animal Farm and Nineteen Eighty-Four remain essential warnings whose vocabulary — Big Brother, doublethink, Newspeak — has entered everyday speech.' },
  'Oscar Wilde': { nationality: 'Irish', years: '1854–1900', bio: 'The supreme wit of the Victorian age, Wilde dazzled London with plays of effortless brilliance before his spectacular fall from grace. Beneath the epigrams lies a writer of genuine moral vision and deep sympathy for the outcast.' },
  'Herman Melville': { nationality: 'American', years: '1819–1891', bio: 'Melville occupies a singular place in American literature — a writer who spent his career wrestling with God, fate, obsession, and the indifferent vastness of the natural world. His voyages as a sailor gave him the raw material for his fiction, culminating in Moby-Dick (1851), a cetological epic that layered adventure, philosophy, and tragedy into a structure unlike anything before or since. Largely ignored in his lifetime, he worked nineteen years as a customs inspector; the twentieth century finally recognised his genius.' },
  'Charlotte Brontë': { nationality: 'English', years: '1816–1855', bio: 'The eldest of the three literary Brontë sisters, Charlotte brought passionate intensity and psychological honesty to the Victorian novel. Jane Eyre, with its defiant heroine and gothic atmosphere, remains a landmark of English fiction.' },
  'Emily Brontë': { nationality: 'English', years: '1818–1848', bio: 'Emily Brontë wrote only one novel, but Wuthering Heights is among the most original and haunting works in the English canon. Wild, uncompromising, and structurally bold, it stands apart from anything else the Victorian era produced.' },
  'Victor Hugo': { nationality: 'French', years: '1802–1885', bio: 'Hugo was the supreme figure of French Romanticism — poet, playwright, and novelist of towering ambition. Les Misérables, his vast hymn to human dignity and social justice, has never been out of print since its publication in 1862.' },
  'Gustave Flaubert': { nationality: 'French', years: '1821–1880', bio: 'Flaubert was the first great perfectionist of prose, agonising over every sentence in pursuit of le mot juste. Madame Bovary scandalized France on publication and established the template for the modern realist novel.' },
  'Franz Kafka': { nationality: 'Czech', years: '1883–1924', bio: 'Kafka\'s nightmarish bureaucratic fictions — published mostly after his death, against his wishes — captured something essential about modern alienation. His name has become an adjective: Kafkaesque now describes any system that is absurd, oppressive, and impossible to navigate.' },
  'James Joyce': { nationality: 'Irish', years: '1882–1941', bio: 'Joyce reinvented the novel with each book he wrote, culminating in Ulysses — a single day in Dublin rendered with such linguistic density and interior richness that it changed what fiction was thought capable of. He spent his adult life in self-imposed exile from Ireland, which never left his imagination.' },
  'Virginia Woolf': { nationality: 'English', years: '1882–1941', bio: 'One of modernism\'s great architects, Woolf used the novel to explore the fluid nature of consciousness, time, and identity. Mrs Dalloway and To the Lighthouse redefined what interior experience could look like on the page.' },
  'F. Scott Fitzgerald': { nationality: 'American', years: '1896–1940', bio: 'Fitzgerald was the laureate of the Jazz Age — dazzled by wealth and beauty, and devastated by their cost. The Great Gatsby, compact and luminous, captures the glamour and hollowness of the American Dream with heartbreaking precision.' },
  'Ernest Hemingway': { nationality: 'American', years: '1899–1961', bio: 'Hemingway\'s stripped-down prose — forged in journalism and sharpened by war — created one of the most imitated styles in literary history. Beneath the tough surface of his work runs a powerful current of loss, courage, and the search for grace under pressure.' },
  'William Shakespeare': { nationality: 'English', years: '1564–1616', bio: 'Widely regarded as the greatest writer in the English language, Shakespeare\'s 37 plays and 154 sonnets have shaped theatre, poetry, and the very language itself for four centuries. His psychological depth and verbal invention remain unmatched.' },
  'Homer': { nationality: 'Greek', years: 'c. 8th century BC', bio: 'The legendary poet of ancient Greece, Homer is credited with the Iliad and the Odyssey — two epics that formed the foundation of Western literary tradition. Whether a single individual or a tradition of oral poets, Homer\'s influence on all subsequent literature is incalculable.' },
  'Dante Alighieri': { nationality: 'Italian', years: '1265–1321', bio: 'Dante\'s Divine Comedy — an epic journey through Hell, Purgatory, and Paradise — is the supreme achievement of medieval literature and one of the greatest poems ever written. Written in the vernacular Italian rather than Latin, it helped shape the modern Italian language.' },
  'Miguel de Cervantes': { nationality: 'Spanish', years: '1547–1616', bio: 'Cervantes created Don Quixote at the age of 58, writing the first great modern novel while in financial ruin. The story of a man who reads too many chivalric romances and sets out to become a knight-errant is at once hilarious, heartbreaking, and inexhaustibly rich.' },
  'Jonathan Swift': { nationality: 'Irish', years: '1667–1745', bio: 'The most savage satirist in the English language, Swift used irony and misanthropy as surgical tools to expose human folly and political corruption. Gulliver\'s Travels begins as an adventure story and darkens, with each voyage, into a devastating critique of humanity.' },
  'Edgar Allan Poe': { nationality: 'American', years: '1809–1849', bio: 'Poe pioneered Gothic horror and detective fiction simultaneously, inventing the form that would later give rise to Sherlock Holmes and a century of crime writing. His tales of psychological terror and his haunting verse set a standard of atmospheric intensity rarely matched.' },
  'Arthur Conan Doyle': { nationality: 'Scottish', years: '1859–1930', bio: 'Doyle created the most famous fictional detective in history, then spent years trying to escape him. Sherlock Holmes — with his deerstalker, his violin, and his cold analytical brilliance — remains a cultural icon more than a century after his first appearance.' },
  'H.G. Wells': { nationality: 'English', years: '1866–1946', bio: 'Wells was the father of scientific romance, imagining time machines, invisible men, Martian invasions, and genetic engineering long before such things seemed plausible. Beyond his science fiction he was a tireless social reformer and one of the most widely-read writers of his age.' },
  'Jules Verne': { nationality: 'French', years: '1828–1905', bio: 'Verne\'s extraordinary voyages — to the moon, to the ocean floor, around the world in eighty days — inspired not only generations of readers but many of the scientists and explorers who turned his fictions into fact. He is the second most translated author in history.' },
  'Louisa May Alcott': { nationality: 'American', years: '1832–1888', bio: 'Alcott\'s Little Women, drawn from her own childhood in a progressive Concord household, gave the world the March sisters and one of fiction\'s most enduring portraits of female ambition, friendship, and growth. She resisted her publisher\'s demand for a conventional happy ending as long as she could.' },
  'Thomas Hardy': { nationality: 'English', years: '1840–1928', bio: 'Hardy set his tragedies of fate, class, and thwarted desire against the rhythms of rural Wessex with an unsentimental tenderness that is entirely his own. After the hostile reception of Jude the Obscure he abandoned novels and spent his final thirty years writing poetry.' },
  'Rudyard Kipling': { nationality: 'British', years: '1865–1936', bio: 'Kipling was the first English-language author to win the Nobel Prize in Literature, celebrated for the linguistic energy of his verse and the imaginative richness of his fiction. The Jungle Book and Kim secured his place in the canon, though his celebration of empire remains deeply contested.' },
  'Robert Louis Stevenson': { nationality: 'Scottish', years: '1850–1894', bio: 'A master of storytelling whose adventurous spirit was at odds with the tuberculosis that confined him for much of his life, Stevenson gave the world Treasure Island, Kidnapped, and the unforgettable duality of Dr Jekyll and Mr Hyde. He died in Samoa at forty-four, mourned across the English-speaking world.' },
  'Jack London': { nationality: 'American', years: '1876–1916', bio: 'London lived as furiously as he wrote — gold prospector, oyster pirate, war correspondent, social reformer. His novels of survival in the wild, above all The Call of the Wild, pulse with physical vitality and a dark awareness of nature\'s indifference to human wishes.' },
  'Bram Stoker': { nationality: 'Irish', years: '1847–1912', bio: 'Stoker spent most of his career as a theatre manager, but Dracula — assembled from research notes, folklore, and a nightmarish dream — created the template for vampire fiction that has never been bettered. The Count himself appears surprisingly rarely in its pages; the horror lies in what surrounds him.' },
  'Mary Shelley': { nationality: 'English', years: '1797–1851', bio: 'Shelley wrote Frankenstein at eighteen during a rainy summer in Geneva on a dare, and in doing so invented the science-fiction genre. The novel\'s central question — what does a creator owe to what he creates? — has only grown more urgent in the centuries since.' },
};

const BENEFITS = [
  { icon: '↻', title: 'Cross-Device Sync', desc: 'Continue reading on any device without losing your place.' },
  { icon: '�bookmark', title: 'Smart Favorites', desc: 'Build your personal library of favourite classics.' },
  { icon: '◷', title: 'Reading History', desc: 'Track your progress across all books.' },
  { icon: '◑', title: 'Custom Themes', desc: 'Read in light, dark, sepia, or night mode.' },
];

export default function Home() {
  const featuredBooks = useAppStore((s) => s.featuredBooks);
  const fetchFeaturedBooks = useAppStore((s) => s.fetchFeaturedBooks);
  const user = useAppStore((s) => s.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedBooks().then(() => setIsLoading(false));
  }, [fetchFeaturedBooks]);

  return (
    <>
      <Head>
        <title>Libreya - Free Classic Books</title>
        <meta name="description" content="Read thousands of classic books for free with Libreya" />
        <meta name="keywords" content="books, reading, classics, free, literature" />
      </Head>

      {/* ── HERO ── */}
      <div style={{
        backgroundColor: 'rgba(90,31,43,1)',
        //backgroundImage: 'url(https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '72px 24px 80px',
        textAlign: 'center',
      }}>
        <img
          src="https://customer-assets.emergentagent.com/job_b554f1a4-c35c-4e60-a285-bdc61c896871/artifacts/0ouwazt9_Libreya%20Logo.png"
          alt="Libreya"
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '24px', backgroundColor: '#fff' }}
        />
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.25rem)', color: '#fff',
          lineHeight: '1.2', marginBottom: '20px',
        }}>
          Classic Literature,<br />Reimagined
        </h1>
        <p style={{
          fontSize: '1.1em', color: 'rgba(255,255,255,0.85)',
          maxWidth: '540px', margin: '0 auto 36px', lineHeight: '1.8',
        }}>
          Discover over 300 timeless masterpieces from the world's greatest authors.
          Beautifully formatted, completely free, forever.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/browse">
            <button style={{ backgroundColor: '#c6a75e', color: '#2b2b2b' }}>
              Explore Library
            </button>
          </Link>
          {!user && (
            <Link href="/auth">
              <button style={{ backgroundColor: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.5)' }}>
                Create Account
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ backgroundColor: 'var(--surface)', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{
          fontSize: '0.72em', fontWeight: '700', letterSpacing: '3px',
          textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '28px',
        }}>
          LIBRARY AT A GLANCE
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {[
            { number: '300+', label: 'Classics' },
            { number: '9', label: 'Genres' },
            { number: '100%', label: 'Free' },
          ].map((stat) => (
            <div key={stat.label} style={{
              backgroundColor: 'var(--bg)', borderRadius: '16px',
              padding: '28px 40px', textAlign: 'center', minWidth: '140px',
              border: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--heading)', marginBottom: '4px' }}>
                {stat.number}
              </p>
              <p style={{ fontSize: '0.95em', color: 'var(--text-secondary)', marginBottom: 0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED CLASSICS ── */}
      <div className="container" style={{ paddingTop: '48px', paddingBottom: '0' }}>
        <p style={{
          fontSize: '0.72em', fontWeight: '700', letterSpacing: '3px',
          textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px',
        }}>
          HANDPICKED FOR YOU
        </p>
        <h2 style={{ marginBottom: '24px' }}>Featured Classics</h2>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div className="spinner" style={{ margin: '0 auto', width: '40px', height: '40px' }}></div>
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Loading books...</p>
          </div>
        ) : (
          <div style={{
            display: 'flex', gap: '16px', overflowX: 'auto',
            paddingBottom: '12px', scrollbarWidth: 'thin', scrollbarColor: '#c6a75e transparent',
          }}>
            {featuredBooks.map((book) => (
              <Link key={book.id} href={`/book/${book.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div className="featured-classic-card" style={{
                  width: '190px', backgroundColor: 'var(--surface)',
                  borderRadius: '12px', overflow: 'hidden',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}>
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title}
                      style={{ width: '190px', height: '255px', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{
                      width: '190px', height: '255px', backgroundColor: 'rgba(90,31,43,1)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', padding: '16px',
                    }}>
                      <p style={{ color: '#fff', fontSize: '0.95em', textAlign: 'center', marginBottom: '8px' }}>{book.title}</p>
                      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8em', textAlign: 'center', marginBottom: 0 }}>{book.author}</p>
                    </div>
                  )}
                  <div style={{ padding: '12px' }}>
                    <p style={{
                      fontSize: '0.9em', fontWeight: '600', color: 'var(--text)',
                      marginBottom: '4px', lineHeight: '1.3',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {book.title}
                    </p>
                    <p style={{ fontSize: '0.78em', color: 'var(--text-secondary)', marginBottom: '8px' }}>{book.author}</p>
                    {book.category && (
                      <span style={{
                        fontSize: '0.7em', color: '#c6a75e',
                        backgroundColor: 'rgba(198,167,94,0.12)',
                        border: '1px solid rgba(198,167,94,0.35)',
                        borderRadius: '4px', padding: '2px 8px', fontWeight: '500',
                      }}>{book.category}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── FEATURED AUTHORS ── */}
      <div className="container" style={{ paddingTop: '56px', paddingBottom: '0' }}>
        <h2 style={{ marginBottom: '8px' }}>Featured Authors</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.05em' }}>
          Timeless voices whose works have shaped world literature
        </p>
        {featuredBooks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No featured authors available at the moment.</p>
        ) : (() => {
          const authorMap = new Map<string, typeof featuredBooks>();
          featuredBooks.forEach(book => {
            const author = book.author || 'Unknown Author';
            if (!authorMap.has(author)) authorMap.set(author, []);
            authorMap.get(author)!.push(book);
          });
          return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {Array.from(authorMap.entries()).map(([author, authorBooks], i, arr) => {
                const genres = [...new Set(authorBooks.map(b => b.category).filter(Boolean))].slice(0, 2).join(' · ');
                const count = authorBooks.length;
                const info = AUTHOR_BIOS[author];
                return (
                  <div key={author} style={{
                    display: 'flex', gap: '24px', alignItems: 'flex-start',
                    padding: '28px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: 'rgba(90,31,43,1)', color: '#c6a75e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', fontWeight: '700',
                    }}>
                      {author.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.1em', marginBottom: '4px' }}>{author}</h3>
                      <p style={{ fontSize: '0.78em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        {info ? `${info.nationality} · ${info.years}` : genres || null}
                        {count > 0 && ` · ${count} work${count !== 1 ? 's' : ''} in collection`}
                      </p>
                      {info?.bio && (
                        <p style={{ fontSize: '0.93em', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: 0 }}>
                          {info.bio}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ── BENEFITS ── */}
      <div style={{
        backgroundColor: 'rgba(90,31,43,1)',
        padding: '56px 24px', textAlign: 'center', marginTop: '56px',
      }}>
        <p style={{
          fontSize: '0.72em', fontWeight: '700', letterSpacing: '3px',
          textTransform: 'uppercase', color: '#c6a75e', marginBottom: '8px',
        }}>
          WHY CREATE AN ACCOUNT
        </p>
        <h2 style={{ color: '#fff', borderBottom: 'none', marginBottom: '36px' }}>Benefits for Readers</h2>
        <div style={{
          display: 'flex', justifyContent: 'center',
          flexWrap: 'wrap', gap: '16px',
          maxWidth: '900px', margin: '0 auto 36px',
        }}>
          {BENEFITS.map((b) => (
            <div key={b.title} style={{
              backgroundColor: '#fff', borderRadius: '14px',
              padding: '28px 24px', width: '210px', textAlign: 'center',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                backgroundColor: 'rgba(90,31,43,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px', fontSize: '1.3rem',
              }}>
                {b.icon}
              </div>
              <p style={{ fontSize: '0.95em', fontWeight: '600', color: '#2b2b2b', marginBottom: '6px' }}>{b.title}</p>
              <p style={{ fontSize: '0.82em', color: '#666', lineHeight: '1.6', marginBottom: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
        {!user && (
          <Link href="/auth">
            <button style={{ backgroundColor: '#c6a75e', color: '#2b2b2b' }}>Get Started Free</button>
          </Link>
        )}
      </div>

      {/* ── PHILOSOPHY ── */}
      <div style={{
        backgroundColor: 'var(--surface)',
        padding: '64px 32px', textAlign: 'center',
      }}>
        <p style={{
          fontSize: '1.25em', fontStyle: 'italic', color: 'var(--heading)',
          maxWidth: '600px', margin: '0 auto', lineHeight: '1.8',
        }}>
          "Libreya is not built for endless scrolling; it is built for intentional reading."
        </p>
        <div style={{
          width: '48px', height: '3px', backgroundColor: '#c6a75e',
          borderRadius: '2px', margin: '28px auto',
        }} />
        <p style={{
          color: 'var(--text-secondary)', maxWidth: '480px',
          margin: '0 auto 24px', lineHeight: '1.8',
        }}>
          We curate timeless literature with minimalist design, creating a calm reading
          space in a world of digital noise.
        </p>
        <Link href="/about">
          <button style={{
            backgroundColor: 'transparent', color: 'var(--heading)',
            border: '1px solid var(--heading)',
          }}>
            Learn Our Story
          </button>
        </Link>
      </div>

      {/* ── FINAL CTA ── */}
      {/*    <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>Begin Your Journey</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 28px', lineHeight: '1.8' }}>
          Join thousands of readers discovering the world's greatest literature.
        </p>
        <Link href="/browse">
          <button>Browse Library</button>
        </Link>
      </div> */}

      <style>{`
        .featured-classic-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        @media (max-width: 600px) {
          .container { padding-top: 32px !important; }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  // This enables SSR for AdSense
  return {
    props: {},
  };
}
