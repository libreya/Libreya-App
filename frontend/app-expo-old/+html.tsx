import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Libreya – Classic Literature, Reimagined | Free Online Library</title>
        <meta name="description" content="Libreya is a free online library with 300+ classic books. Read works by Jane Austen, Charles Dickens, Leo Tolstoy, and more. Beautifully formatted, free forever." />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* SEO Meta Tags */}
        <meta name="description" content="Libreya - Discover over 300 timeless classics from the world's greatest authors. Beautifully formatted, completely free, forever." />
        <meta name="keywords" content="classic literature, free books, public domain, reading app, ebooks, Libreya" />
        <meta property="og:title" content="Libreya - Classic Literature, Reimagined" />
        <meta property="og:description" content="Discover over 300 timeless masterpieces. Free forever." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://libreya.app" />
        <meta name="theme-color" content="#5A1F2B" />

        {/* Favicon - Libreya icon */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />

        {/*
          Google AdSense Auto Ads Script
          Client ID: ca-pub-4299148862195882
        */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4299148862195882"
          crossOrigin="anonymous"
        />

        {/*
          Combined styles:
          - Body overflow: auto (NOT hidden) for AdSense auto-ads
          - Remove default input borders/outlines for clean UI
          - Micro-animations for hover states
        */}
        <style dangerouslySetInnerHTML={{
          __html: `
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          body {
            overflow-y: auto;
            overscroll-behavior-y: none;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          #root {
            display: flex;
            flex-direction: column;
            min-height: 100%;
          }
          /* ===== Remove all default input borders ===== */
          input, textarea {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          input:focus, textarea:focus {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          /* ===== Micro-Animations ===== */
          /* Smooth transitions for all interactive elements */
          a, button, [role="button"] {
            transition: transform 0.15s ease, opacity 0.15s ease, background-color 0.2s ease;
          }
          a:hover, button:hover, [role="button"]:hover {
            opacity: 0.9;
          }
          /* Navigation link hover effects */
          [data-testid="nav-link"]:hover {
            background-color: rgba(90, 31, 43, 0.06);
          }
          /* Card hover lift effect */
          [data-testid="card"]:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          }
          /* Smooth scrollbar */
          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(90, 31, 43, 0.2);
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(90, 31, 43, 0.4);
          }
          /* AdSense container */
          .adsbygoogle {
            display: block;
            overflow: visible !important;
          }
        `}} />

        {/* Ad-Blocker Detection */}
        <script dangerouslySetInnerHTML={{
          __html: `
          window.__ADSENSE_STATUS = 'checking';
          window.addEventListener('load', function() {
            setTimeout(function() {
              if (typeof window.adsbygoogle !== 'undefined' && window.adsbygoogle.loaded !== false) {
                window.__ADSENSE_STATUS = 'loaded';
                console.log('[Libreya Ads] AdSense script loaded successfully.');
              } else {
                window.__ADSENSE_STATUS = 'blocked';
                console.warn('[Libreya Ads] AdSense may be blocked by an ad-blocker or failed to load.');
              }
              window.dispatchEvent(new CustomEvent('adsense-status', { detail: window.__ADSENSE_STATUS }));
            }, 3000);
          });
        `}} />
      </head>
      <body>
        <div
          id="seo-content"
          style={{
            maxWidth: "100%",
            margin: "0 auto",
            padding: "80px 30px",
            textAlign: "center",
            fontFamily: "Georgia, serif",
            lineHeight: 1.7,
            color: "#ffffff",
            background: "linear-gradient(180deg,#5A1F2B 0%,#7B2E3E 100%)"
          }}
        >
          <h1 style={{ fontSize: "44px", marginBottom: "25px", fontWeight: 700 }}>
            Libreya – Classic Literature, Reimagined
          </h1>

          <p style={{ fontSize: "18px", opacity: 0.9 }}>
            Libreya
            is a free online library offering over 300 timeless works of classic
            literature, beautifully formatted and accessible to everyone. The
            following pages present original biographical essays on ten of the
            greatest authors in the Libreya collection, paired with their three
            most essential works. These writers, working across four centuries
            and six nations, changed what literature could do and what human
            beings could say about themselves.
          </p>
          <p style={{ fontSize: "18px", opacity: 0.9 }}>
            Every book is public domain and free for anyone to read.
          </p>

          <div>
            <h2 style={{ fontSize: "26px", marginTop: "40px" }}>Featured Books</h2>
            <ul style={{ listStyle: "none", padding: 0, fontSize: "18px" }}>
              <li><a href="/books/pride-and-prejudice.html" style={{ color: "#fff" }}>Pride and Prejudice – Jane Austen</a></li>
              <li><a href="/books/moby-dick.html" style={{ color: "#fff" }}>Moby Dick – Herman Melville</a></li>
              <li><a href="/books/crime-and-punishment.html" style={{ color: "#fff" }}>Crime and Punishment – Fyodor Dostoevsky</a></li>
              {/* <li><a href="/books/war-and-peace.html" style={{ color: "#fff" }}>War and Peace – Leo Tolstoy</a></li>
            <li><a href="/books/jane-eyre.html" style={{ color: "#fff" }}>Jane Eyre – Charlotte Brontë</a></li> */}
            </ul>
          </div>

          <div
            style={{
              backgroundColor: "rgba(90,31,43,1)",
              padding: "1.5rem",
            }}
          >
            <p style={{ lineHeight: "100%", marginTop: "0.14in", marginBottom: "0.04in" }}>
              <span
                style={{
                  color: "#e6c7a1", // softer gold
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                01.
              </span>{" "}
              <span
                style={{
                  color: "#ffffff", // strong contrast
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                Jane Austen
              </span>
            </p>

            <p style={{ lineHeight: "100%", marginBottom: "0.17in" }}>
              <span
                style={{
                  color: "#d6c2c7", // light muted pink-gray
                  fontFamily: "Arial, serif",
                  fontSize: "10pt",
                  fontStyle: "italic",
                }}
              >
                English · 1775–1817
              </span>
            </p>

            <p
              style={{
                textAlign: "left",
                lineHeight: "1.6",
                marginTop: "0.06in",
                marginBottom: "0.11in",
                color: "#f3e9eb", // soft off-white
                fontFamily: "Georgia, serif",
                fontSize: "12pt",
              }}
            >
              Jane Austen stands as one of the most celebrated novelists in the English
              language — a writer whose quiet domestic scenes carry an astonishing weight
              of social intelligence, psychological precision, and moral seriousness.
              Born in the small Hampshire village of Steventon on December 16, 1775,
              she was the seventh of eight children in a warmly literary household. Her
              father George Austen, a clergyman, kept a well-stocked library and actively
              encouraged his daughter's reading and writing from an early age.
            </p>

            <p
              style={{
                textAlign: "left",
                lineHeight: "1.6",
                marginTop: "0.06in",
                marginBottom: "0.11in",
                color: "#f3e9eb",
                fontFamily: "Georgia, serif",
                fontSize: "12pt",
              }}
            >
              Austen spent much of her life in relative obscurity, moving between rented
              homes and relying on the kindness of brothers for financial support. She
              never married, though she came close on at least one occasion. Her writing
              was done quietly, often in the family sitting room, manuscripts hidden
              beneath blotting paper if visitors arrived. It is extraordinary that from
              such constrained circumstances, she produced novels of such breadth and
              brilliance.
            </p>

            <p
              style={{
                textAlign: "left",
                lineHeight: "1.6",
                marginTop: "0.06in",
                marginBottom: "0.11in",
                color: "#f3e9eb",
                fontFamily: "Georgia, serif",
                fontSize: "12pt",
              }}
            >
              Her six completed novels — written during two distinct periods of creative
              activity — explore the lives of the English landed gentry with razor-sharp
              irony and deep compassion. Through the courtship plots her society expected,
              she embedded radical observations about women's limited autonomy, the cruelty
              of poverty, and the moral failures of the privileged. Her heroines are witty,
              flawed, and deeply human, and they demand that readers take their inner lives
              seriously.
            </p>
          </div>

          {/** Next author */}
          <div>
            <p
              style={{
                textAlign: "left",
                lineHeight: "1.6",
                marginTop: "0.06in",
                marginBottom: "0.11in",
                color: "#f3e9eb",
                fontFamily: "Georgia, serif",
                fontSize: "12pt",
              }}
            >
              Austen published anonymously during her lifetime, her novels credited simply
              to "A Lady." She died in 1817 at the age of 41, likely from Addison's disease,
              leaving two novels — Northanger Abbey and Persuasion — to be published
              posthumously by her brother Henry. Her reputation grew steadily through the
              nineteenth century and exploded into a global cultural phenomenon in the
              twentieth, spawning adaptations, sequels, academic journals, and devoted fan
              communities worldwide.
            </p>

            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.19in",
                marginBottom: "0.07in",
                color: "#e6c7a1",
                fontFamily: "Arial, serif",
                fontSize: "11pt",
                fontWeight: "bold",
              }}
            >
              Top 3 Books
            </p>

            <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  Pride and Prejudice (1813)
                </span>
                <span
                  style={{
                    color: "#f3e9eb",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                  }}
                >
                  {" "}
                  — The sparkling story of Elizabeth Bennet and Mr. Darcy — a
                  masterwork of wit, irony, and romantic tension that remains the most
                  widely read of Austen's novels.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  Emma (1815)
                </span>
                <span
                  style={{
                    color: "#f3e9eb",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                  }}
                >
                  {" "}
                  — A brilliantly comic exploration of self-deception, matchmaking,
                  and the limits of cleverness, centered on the irresistible Emma
                  Woodhouse.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  Persuasion (1817)
                </span>
                <span
                  style={{
                    color: "#f3e9eb",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                  }}
                >
                  {" "}
                  — Austen's most tender and elegiac novel, following Anne Elliot as
                  she rediscovers a love she was once persuaded to abandon.
                </span>
              </li>
            </ul>

            <div
              style={{
                marginTop: "0.14in",
                marginBottom: "0.14in",
                borderBottom: "1px solid #d4b896",
              }}
            />
          </div>

          {/** Next author */}
          <div>
            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.33in",
                marginBottom: "0.04in",
              }}
            >
              <span
                style={{
                  color: "#e6c7a1",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                02.
              </span>{" "}
              <span
                style={{
                  color: "#ffffff",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                Herman Melville
              </span>
            </p>

            <p style={{ lineHeight: "100%", marginBottom: "0.17in" }}>
              <span
                style={{
                  color: "#d6c2c7",
                  fontFamily: "Arial, serif",
                  fontSize: "10pt",
                  fontStyle: "italic",
                }}
              >
                American · 1819–1891
              </span>
            </p>

            <p
              style={{
                textAlign: "left",
                lineHeight: "1.6",
                marginTop: "0.06in",
                marginBottom: "0.11in",
                color: "#f3e9eb",
                fontFamily: "Georgia, serif",
                fontSize: "12pt",
              }}
            >
              Herman Melville occupies a singular place in American literature — a
              writer who spent his career wrestling with God, fate, obsession, and the
              indifferent vastness of the natural world. Born in New York City on
              August 1, 1819, he grew up in a family that fell from prosperity into
              precarity after his merchant father died bankrupt, a collapse that
              scarred Melville's sense of the world and shaped his deepest themes.
            </p>

            <p
              style={{
                textAlign: "left",
                lineHeight: "1.6",
                marginTop: "0.06in",
                marginBottom: "0.11in",
                color: "#f3e9eb",
                fontFamily: "Georgia, serif",
                fontSize: "12pt",
              }}
            >
              At twenty, Melville abandoned convention and shipped out as a sailor —
              first on a merchant vessel to Liverpool, then aboard a whaler to the
              South Pacific. These voyages gave him not only the raw material for his
              fiction but a profound, embodied understanding of labor, danger, and the
              democratic mixing of men from every nation and background. He jumped ship
              in the Marquesas Islands and lived briefly among the native Typee people,
              an experience that became his first popular success.
            </p>
          </div>

          {/** Next author */}
          <div>
            <p
              style={{
                textAlign: "left",
                lineHeight: "1.6",
                marginTop: "0.06in",
                marginBottom: "0.11in",
                color: "#f3e9eb",
                fontFamily: "Georgia, serif",
                fontSize: "12pt",
              }}
            >
              Melville returned to America, married Elizabeth Shaw in 1847,
              and launched a productive literary career. His early novels —
              Typee, Omoo, Redburn, White-Jacket — sold well and established
              him as an exciting voice in American letters. But with Moby-Dick
              (1851), he swung for something far larger and stranger: a
              cetological epic that layered adventure, philosophy, tragedy,
              and comedy into a structure unlike anything before or since.
              The novel was misunderstood by contemporary readers and largely
              ignored.
            </p>

            <p
              style={{
                textAlign: "left",
                lineHeight: "1.6",
                marginTop: "0.06in",
                marginBottom: "0.11in",
                color: "#f3e9eb",
                fontFamily: "Georgia, serif",
                fontSize: "12pt",
              }}
            >
              Melville spent the second half of his life in relative obscurity,
              working as a customs inspector for nineteen years on the New York
              docks. He continued writing poetry and prose — his late masterpiece
              Billy Budd was discovered unfinished in a bread box after his death.
              The twentieth century finally recognized his genius, and he is now
              regarded as one of the supreme figures of world literature.
            </p>

            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.19in",
                marginBottom: "0.07in",
                color: "#e6c7a1",
                fontFamily: "Arial, serif",
                fontSize: "11pt",
                fontWeight: "bold",
              }}
            >
              Top 3 Books
            </p>

            <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  Moby-Dick (1851)
                </span>
                <span
                  style={{
                    color: "#f3e9eb",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                  }}
                >
                  {" "}
                  — Captain Ahab's monomaniacal hunt for the white whale — an
                  oceanic epic of obsession, metaphysics, and American ambition
                  that redefined what a novel could be.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  Bartleby, the Scrivener (1853)
                </span>
                <span
                  style={{
                    color: "#f3e9eb",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                  }}
                >
                  {" "}
                  — A haunting short story about a legal copyist whose simple
                  refusal — "I would prefer not to" — becomes a profound
                  meditation on alienation and passive resistance.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  Billy Budd, Sailor (1924)
                </span>
                <span
                  style={{
                    color: "#f3e9eb",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                  }}
                >
                  {" "}
                  — Melville's final, posthumously published novella, a morally
                  complex tale of innocence, institutional authority, and the
                  tragic cost of justice.
                </span>
              </li>
            </ul>

            <div
              style={{
                marginTop: "0.14in",
                marginBottom: "0.14in",
                borderBottom: "1px solid #d4b896",
              }}
            />
          </div>

          {/** Next author */}
          <div>
            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.33in",
                marginBottom: "0.04in",
              }}
            >
              <span
                style={{
                  color: "#e6c7a1",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                03.
              </span>{" "}
              <span
                style={{
                  color: "#ffffff",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                Fyodor Dostoevsky
              </span>
            </p>

            <p style={{ lineHeight: "100%", marginBottom: "0.17in" }}>
              <span
                style={{
                  color: "#d6c2c7",
                  fontFamily: "Arial, serif",
                  fontSize: "10pt",
                  fontStyle: "italic",
                }}
              >
                Russian · 1821–1881
              </span>
            </p>

            {[
              `Few writers have mapped the geography of the human soul with the intensity and moral urgency of Fyodor Mikhailovich Dostoevsky. Born in Moscow on November 11, 1821, the son of a staff doctor at a charitable hospital for the poor, he grew up surrounded by suffering and faith — two forces that would define his life and art. His childhood ended abruptly when his father was murdered by his own serfs in 1839, a trauma that marked Dostoevsky deeply and may have triggered the epilepsy that plagued him throughout his life.`,

              `Dostoevsky's literary career began brilliantly with Poor Folk (1845), which caused a sensation in St. Petersburg. But in 1849 he was arrested for involvement with a radical political circle and sentenced to death. Reprieved at the last moment — a mock execution was staged and the sentence commuted — he spent four years in a Siberian prison camp followed by four years of compulsory military service. This experience shattered and remade him, producing the profound Christian humanism that animates his greatest works.`,

              `Returning to literature in the 1860s, Dostoevsky began producing the great novels that secured his immortality. Notes from Underground, Crime and Punishment, The Idiot, Demons, and The Brothers Karamazov appeared in rapid succession — each a world unto itself, populated by characters of searing psychological complexity. He explored murder, sainthood, nihilism, faith, freedom, and suffering not as abstract philosophical problems but as lived human crises.`,

              `Dostoevsky died in 1881 at the age of 59, shortly after completing The Brothers Karamazov. His funeral was attended by thousands of mourners. Nietzsche, Freud, Einstein, and Kafka all acknowledged his influence. His novels remain among the most psychologically acute and spiritually searching works in all of literature.`,
            ].map((text, i) => (
              <p
                key={i}
                style={{
                  textAlign: "left",
                  lineHeight: "1.6",
                  marginTop: "0.06in",
                  marginBottom: "0.11in",
                  color: "#f3e9eb",
                  fontFamily: "Georgia, serif",
                  fontSize: "12pt",
                }}
              >
                {text}
              </p>
            ))}

            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.19in",
                marginBottom: "0.07in",
                color: "#e6c7a1",
                fontFamily: "Arial, serif",
                fontSize: "11pt",
                fontWeight: "bold",
              }}
            >
              Top 3 Books
            </p>

            <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  Crime and Punishment (1866)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — A young student murders a pawnbroker and descends into psychological
                  torment — Dostoevsky's electrifying investigation of guilt, ideology,
                  and the possibility of redemption.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Brothers Karamazov (1880)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — Dostoevsky's final and greatest novel: a vast family drama that
                  becomes a summit meeting between faith and doubt, reason and love,
                  God and the suffering of children.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Idiot (1869)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — The story of Prince Myshkin, a pure and Christ-like figure destroyed
                  by a corrupt world — a devastating exploration of goodness and its
                  fate among ordinary human beings.
                </span>
              </li>
            </ul>

            <div
              style={{
                marginTop: "0.14in",
                marginBottom: "0.14in",
                borderBottom: "1px solid #d4b896",
              }}
            />
          </div>

          {/** Next author */}
          <div>
            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.33in",
                marginBottom: "0.04in",
              }}
            >
              <span
                style={{
                  color: "#e6c7a1",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                04.
              </span>{" "}
              <span
                style={{
                  color: "#ffffff",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                Leo Tolstoy
              </span>
            </p>

            <p style={{ lineHeight: "100%", marginBottom: "0.17in" }}>
              <span
                style={{
                  color: "#d6c2c7",
                  fontFamily: "Arial, serif",
                  fontSize: "10pt",
                  fontStyle: "italic",
                }}
              >
                Russian · 1828–1910
              </span>
            </p>

            {[
              `Count Lev Nikolayevich Tolstoy is often regarded simply as the greatest novelist who ever lived. Born on September 9, 1828, at Yasnaya Polyana, his family's estate in the Tula region south of Moscow, he inherited both aristocratic privilege and a profound moral restlessness that made that privilege increasingly intolerable to him. He lost both parents in early childhood and was raised by aunts, educated by tutors, and eventually enrolled at Kazan University — which he left without a degree.`,

              `After years of dissipation, gambling, and military service in the Caucasus and Crimea, Tolstoy began transforming his experiences into fiction. Childhood, Boyhood, Youth — his autobiographical early trilogy — and the Sevastopol Sketches from the Crimean War established him as a writer of exceptional power and honesty. He was praised by Turgenev, revered by Nekrasov, and recognized immediately as a major talent.`,

              `In the 1860s and 1870s Tolstoy produced the two novels that define him: War and Peace (1869), an immense panorama of Russian society during the Napoleonic Wars, and Anna Karenina (1878), a searching examination of love, marriage, and moral accountability. Both novels demonstrate a mastery of human psychology, historical imagination, and sheer narrative scope that remains unmatched in world literature.`,

              `In the 1880s, following a spiritual crisis documented in his memoir A Confession, Tolstoy renounced his early work, embraced a form of radical Christian anarchism, and devoted his remaining decades to moral and religious tracts, simplified fiction for peasant readers, and a vast correspondence with admirers worldwide. He became one of the most famous and controversial figures on earth. He died in 1910 at a remote railway station at Astapovo, having fled his estate in a final, dramatic break with his family and past.`,
            ].map((text, i) => (
              <p
                key={i}
                style={{
                  textAlign: "left",
                  lineHeight: "1.6",
                  marginTop: "0.06in",
                  marginBottom: "0.11in",
                  color: "#f3e9eb",
                  fontFamily: "Georgia, serif",
                  fontSize: "12pt",
                }}
              >
                {text}
              </p>
            ))}

            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.19in",
                marginBottom: "0.07in",
                color: "#e6c7a1",
                fontFamily: "Arial, serif",
                fontSize: "11pt",
                fontWeight: "bold",
              }}
            >
              Top 3 Books
            </p>

            <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  War and Peace (1869)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — The supreme novel of history and human life — following five
                  aristocratic families through Napoleon's invasion of Russia with
                  unparalleled breadth and psychological intimacy.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  Anna Karenina (1878)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — A devastating portrait of a woman destroyed by the collision
                  between passionate love and social convention — Tolstoy called it
                  his "first real novel."
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Death of Ivan Ilyich (1886)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — A short masterpiece: a judge faces his death and discovers he
                  has never truly lived — perhaps the most concentrated distillation
                  of Tolstoy's moral vision.
                </span>
              </li>
            </ul>

            <div
              style={{
                marginTop: "0.14in",
                marginBottom: "0.14in",
                borderBottom: "1px solid #d4b896",
              }}
            />
          </div>

          {/** Next author */}
          <div>
            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.33in",
                marginBottom: "0.04in",
              }}
            >
              <span
                style={{
                  color: "#e6c7a1",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                05.
              </span>{" "}
              <span
                style={{
                  color: "#ffffff",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                Charles Dickens
              </span>
            </p>

            <p style={{ lineHeight: "100%", marginBottom: "0.17in" }}>
              <span
                style={{
                  color: "#d6c2c7",
                  fontFamily: "Arial, serif",
                  fontSize: "10pt",
                  fontStyle: "italic",
                }}
              >
                English · 1812–1870
              </span>
            </p>

            {[
              `Charles John Huffam Dickens was born on February 7, 1812, in Portsmouth, England, the second of eight children in a family that lived perpetually at the edge of financial ruin. When his father John was imprisoned for debt in the Marshalsea prison, twelve-year-old Charles was sent to work pasting labels on bottles in a blacking warehouse — an experience of humiliation and abandonment that he carried in secret for decades and that powered his lifelong anger at poverty, injustice, and the suffering of children.`,

              `Dickens educated himself largely through voracious reading, worked as a court reporter and parliamentary journalist, and burst onto the literary scene in 1836 with the serialized Pickwick Papers. The serial format — releasing novels in monthly or weekly installments — became his distinctive medium, allowing him to adjust his stories in response to reader reaction and to build an unprecedented mass audience. At his peak, his installments were eagerly awaited by millions of readers across Britain and America.`,

              `Over a career of extraordinary productivity, Dickens produced fifteen major novels, hundreds of short stories, journalism, travel writing, and stage performances. He used fiction as a weapon against the workhouses, debtors' prisons, legal corruption, factory exploitation, and educational cruelty of Victorian England — while simultaneously filling his pages with unforgettable characters, irrepressible comedy, and scenes of almost unbearable emotional power.`,

              `Dickens was also a tireless public performer, and his late reading tours — in which he re-enacted murders, deaths, and comic scenes to packed houses — contributed to the heart disease that killed him in 1870 at the age of 58. He died leaving an unfinished novel, The Mystery of Edwin Drood, and a place in English literature that has never seriously been challenged.`,
            ].map((text, i) => (
              <p
                key={i}
                style={{
                  textAlign: "left",
                  lineHeight: "1.6",
                  marginTop: "0.06in",
                  marginBottom: "0.11in",
                  color: "#f3e9eb",
                  fontFamily: "Georgia, serif",
                  fontSize: "12pt",
                }}
              >
                {text}
              </p>
            ))}

            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.19in",
                marginBottom: "0.07in",
                color: "#e6c7a1",
                fontFamily: "Arial, serif",
                fontSize: "11pt",
                fontWeight: "bold",
              }}
            >
              Top 3 Books
            </p>

            <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  Great Expectations (1861)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — Young Pip's journey from humble origins to London society and back —
                  Dickens's most perfectly shaped novel and his most searching examination
                  of ambition, loyalty, and self-knowledge.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  A Tale of Two Cities (1859)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — A historical novel set against the French Revolution, opening with
                  one of literature's most famous sentences and closing with one of its
                  most celebrated acts of sacrifice.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  David Copperfield (1850)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — Dickens's most autobiographical novel, tracing a young man's growth
                  from a suffering child to a successful writer — the author called it
                  his "favourite child."
                </span>
              </li>
            </ul>

            <div
              style={{
                marginTop: "0.14in",
                marginBottom: "0.14in",
                borderBottom: "1px solid #d4b896",
              }}
            />
          </div>

          {/** Next author */}
          <div>
            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.33in",
                marginBottom: "0.04in",
              }}
            >
              <span
                style={{
                  color: "#e6c7a1",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                06.
              </span>{" "}
              <span
                style={{
                  color: "#ffffff",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                Mark Twain
              </span>
            </p>

            <p style={{ lineHeight: "100%", marginBottom: "0.17in" }}>
              <span
                style={{
                  color: "#d6c2c7",
                  fontFamily: "Arial, serif",
                  fontSize: "10pt",
                  fontStyle: "italic",
                }}
              >
                American · 1835–1910
              </span>
            </p>

            {[
              `Samuel Langhorne Clemens — who gave the world the name Mark Twain — was born on November 30, 1835, in the tiny Missouri village of Florida and grew up in Hannibal on the banks of the Mississippi River. That river, with its paddle-steamers, its drifting commerce, its violence, its freedoms, and its slaves, became the central landscape of his imagination. He left school at twelve after his father's death, worked as a printer's apprentice, journeyman typesetter, and eventually achieved his boyhood dream of becoming a riverboat pilot.`,

              `The Civil War ended river traffic and Twain drifted west to Nevada and California, where he found his voice as a journalist, humorist, and lecturer. His story "The Celebrated Jumping Frog of Calaveras County" (1865) made him nationally famous. Travel letters from a voyage to Europe and the Holy Land became his first major book, The Innocents Abroad (1869), which sold faster than any American book had sold before it.`,

              `Twain's mature masterpieces grew from his Mississippi childhood. The Adventures of Tom Sawyer (1876) captured the pleasures of boyhood freedom; Adventures of Huckleberry Finn (1884) — written in Huck's vernacular voice, confronting slavery and moral courage head-on — is by wide consensus the foundational novel of American literature. Ernest Hemingway famously declared that all American literature comes from it.`,

              `In his later years, personal tragedy — the deaths of his wife and daughters, financial ruin through failed investments — turned Twain increasingly dark. His late essays and stories, many left unpublished at his death, are scathing indictments of human nature, imperialism, and organized religion. He died on April 21, 1910, and remains one of the most beloved and most read American writers in history.`,
            ].map((text, i) => (
              <p
                key={i}
                style={{
                  textAlign: "left",
                  lineHeight: "1.6",
                  marginTop: "0.06in",
                  marginBottom: "0.11in",
                  color: "#f3e9eb",
                  fontFamily: "Georgia, serif",
                  fontSize: "12pt",
                }}
              >
                {text}
              </p>
            ))}

            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.19in",
                marginBottom: "0.07in",
                color: "#e6c7a1",
                fontFamily: "Arial, serif",
                fontSize: "11pt",
                fontWeight: "bold",
              }}
            >
              Top 3 Books
            </p>

            <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  Adventures of Huckleberry Finn (1884)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — Huck and the escaped slave Jim float down the Mississippi on a raft —
                  the foundational American novel, a masterpiece of vernacular voice and
                  moral reckoning.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Adventures of Tom Sawyer (1876)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — A sun-drenched portrait of boyhood adventure, mischief, and the
                  pleasures of a small-town American childhood along the Mississippi River.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Prince and the Pauper (1881)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — A Tudor-era tale of a young prince and a street boy who accidentally
                  swap lives — Twain's commentary on class, power, and the accidents of
                  birth.
                </span>
              </li>
            </ul>

            <div
              style={{
                marginTop: "0.14in",
                marginBottom: "0.14in",
                borderBottom: "1px solid #d4b896",
              }}
            />
          </div>

          {/** Next author */}
          <div>
            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.33in",
                marginBottom: "0.04in",
              }}
            >
              <span
                style={{
                  color: "#e6c7a1",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                07.
              </span>{" "}
              <span
                style={{
                  color: "#ffffff",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                Victor Hugo
              </span>
            </p>

            <p style={{ lineHeight: "100%", marginBottom: "0.17in" }}>
              <span
                style={{
                  color: "#d6c2c7",
                  fontFamily: "Arial, serif",
                  fontSize: "10pt",
                  fontStyle: "italic",
                }}
              >
                French · 1802–1885
              </span>
            </p>

            {[
              `Victor-Marie Hugo was born on February 26, 1802, in Besançon, France, the son of a Napoleonic general. He spent his childhood following his father on military postings across Europe — Spain, Italy, Corsica — and received a fragmentary, cosmopolitan education that instilled in him a sense of history as lived drama. By the time he was seventeen he had won prizes from the Académie française and resolved to become a writer.`,

              `Hugo's career unfolded across an extraordinary arc of nearly seven decades and encompassed poetry, drama, fiction, political theory, and visual art. His plays — Hernani and Ruy Blas — revolutionized French theatre and launched the Romantic movement in France. His early novel Notre-Dame de Paris (The Hunchback of Notre-Dame, 1831) was an immediate international sensation, a richly atmospheric historical novel that made medieval Paris as vivid as any living city and essentially invented the idea of architectural preservation.`,

              `Hugo was also a towering political figure — elected to the National Assembly, elevated to the French Senate, exiled for nineteen years by Napoleon III for opposing the coup d'état of 1851. From exile in Jersey and Guernsey, he published his most politically charged work, including Les Misérables (1862), a panoramic novel of social injustice, revolution, and spiritual transformation that became one of the most widely read books ever written.`,

              `Hugo returned to France in 1870 to an extraordinary public welcome. His eightieth birthday in 1881 was celebrated as a national event — half a million people marched past his window. When he died in 1885, his body lay in state under the Arc de Triomphe, and two million people accompanied his coffin to the Panthéon. He remains the defining figure of French Romanticism and one of the giants of world literature.`,
            ].map((text, i) => (
              <p
                key={i}
                style={{
                  textAlign: "left",
                  lineHeight: "1.6",
                  marginTop: "0.06in",
                  marginBottom: "0.11in",
                  color: "#f3e9eb",
                  fontFamily: "Georgia, serif",
                  fontSize: "12pt",
                }}
              >
                {text}
              </p>
            ))}

            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.19in",
                marginBottom: "0.07in",
                color: "#e6c7a1",
                fontFamily: "Arial, serif",
                fontSize: "11pt",
                fontWeight: "bold",
              }}
            >
              Top 3 Books
            </p>

            <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  Les Misérables (1862)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — Jean Valjean's decades-long journey from convict to redeemed
                  man, set against the upheavals of post-Napoleonic France —
                  one of the most beloved novels ever written.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Hunchback of Notre-Dame (1831)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — A gothic tale of beauty and deformity, desire and fate, set in
                  medieval Paris — the novel that made the great cathedral a
                  symbol of French identity.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  Ninety-Three (1874)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — Hugo's final novel, set during the Terror of the French
                  Revolution — a meditation on war, mercy, and the moral cost
                  of political conviction.
                </span>
              </li>
            </ul>

            <div
              style={{
                marginTop: "0.14in",
                marginBottom: "0.14in",
                borderBottom: "1px solid #d4b896",
              }}
            />
          </div>

          {/** Next author */}
          <div>
            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.33in",
                marginBottom: "0.04in",
              }}
            >
              <span
                style={{
                  color: "#e6c7a1",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                08.
              </span>{" "}
              <span
                style={{
                  color: "#ffffff",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                Franz Kafka
              </span>
            </p>

            <p style={{ lineHeight: "100%", marginBottom: "0.17in" }}>
              <span
                style={{
                  color: "#d6c2c7",
                  fontFamily: "Arial, serif",
                  fontSize: "10pt",
                  fontStyle: "italic",
                }}
              >
                Czech · 1883–1924
              </span>
            </p>

            {[
              `Franz Kafka was born on July 3, 1883, in Prague, then part of the Austro-Hungarian Empire, into a German-speaking Jewish family of the middle class. His relationship with his domineering father Hermann — documented in the extraordinary Letter to His Father, never sent — was one of the defining wounds of his life and the subterranean engine of his fiction. He studied law, worked in insurance, and spent his entire working life in Prague, writing almost entirely at night.`,

              `Kafka's literary output was small, largely unpublished in his lifetime, and mostly incomplete. He published a handful of short stories and novellas — The Metamorphosis, In the Penal Colony, A Country Doctor — but left his three major novels unfinished. On his deathbed he instructed his closest friend, Max Brod, to burn all his manuscripts. Brod refused. He published them instead, and literary history was changed.`,

              `What Kafka's fiction captures is something so precise and so previously unnamed that it required the invention of a new adjective — 'Kafkaesque' — to describe it: the experience of encountering vast, indifferent bureaucratic systems that produce inexplicable guilt, endless deferral, and the systematic undermining of individual agency. Gregor Samsa wakes to find himself transformed into a giant insect. Josef K. is arrested without being told his crime. K. seeks to reach a castle that recedes as he approaches it.`,

              `Kafka died of tuberculosis on June 3, 1924, at the age of forty. He had asked Brod to burn his diaries, letters, and manuscripts. Brod's act of creative disobedience preserved one of the most distinctive and influential bodies of fiction in the modern era. Kafka's work has been claimed by existentialists, Marxists, Zionists, psychoanalysts, and absurdists, none of whom can exhaust his bottomless ambiguity.`,
            ].map((text, i) => (
              <p
                key={i}
                style={{
                  textAlign: "left",
                  lineHeight: "1.6",
                  marginTop: "0.06in",
                  marginBottom: "0.11in",
                  color: "#f3e9eb",
                  fontFamily: "Georgia, serif",
                  fontSize: "12pt",
                }}
              >
                {text}
              </p>
            ))}

            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.19in",
                marginBottom: "0.07in",
                color: "#e6c7a1",
                fontFamily: "Arial, serif",
                fontSize: "11pt",
                fontWeight: "bold",
              }}
            >
              Top 3 Books
            </p>

            <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Metamorphosis (1915)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — Gregor Samsa awakes one morning transformed into a giant insect
                  — one of literature's most startling and resonant premises, a
                  merciless examination of alienation, family, and identity.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Trial (1925)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — Josef K. is arrested for an unspecified crime and navigates an
                  opaque and terrifying legal labyrinth — the defining novel of
                  bureaucratic absurdity and existential dread.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Castle (1926)
                </span>
                <span style={{ color: "#f3e9eb", fontFamily: "Georgia, serif", fontSize: "11pt" }}>
                  {" "}
                  — A land surveyor called K. attempts endlessly and fruitlessly to
                  reach a castle — Kafka's most sustained and haunting meditation on
                  exclusion, authority, and futile striving.
                </span>
              </li>
            </ul>

            <div
              style={{
                marginTop: "0.14in",
                marginBottom: "0.14in",
                borderBottom: "1px solid #d4b896",
              }}
            />
          </div>

          {/** Next author */}
          <div>
            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.33in",
                marginBottom: "0.04in",
              }}
            >
              <span
                style={{
                  color: "#e6c7a1",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                09.
              </span>{" "}
              <span
                style={{
                  color: "#ffffff",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                Oscar Wilde
              </span>
            </p>

            <p style={{ lineHeight: "100%", marginBottom: "0.17in" }}>
              <span
                style={{
                  color: "#d6c2c7",
                  fontFamily: "Arial, serif",
                  fontSize: "10pt",
                  fontStyle: "italic",
                }}
              >
                Irish · 1854–1900
              </span>
            </p>

            {[
              `Oscar Fingal O'Flahertie Wills Wilde was born on October 16, 1854, in Dublin, to parents of exceptional intellectual distinction: his father Sir William Wilde was a distinguished surgeon and antiquarian, his mother Jane Wilde a celebrated nationalist poet. He won a scholarship to Trinity College Dublin and then to Magdalen College Oxford, where he studied classics and first cultivated the aesthetic philosophy — art for art's sake, beauty as the highest value — that would define his public persona and private convictions.`,

              `Wilde arrived in London in the early 1880s as a fully formed phenomenon: tall, flamboyant, conversational, devastating. His lectures on aestheticism filled halls on both sides of the Atlantic. His poems, fairy tales, essays, and society comedies established him as the most brilliant wit of his age. The plays he produced in the early 1890s — Lady Windermere's Fan, A Woman of No Importance, An Ideal Husband, and especially The Importance of Being Earnest — are still among the most performed works in the English-speaking theatre.`,

              `Wilde's only novel, The Picture of Dorian Gray (1890), caused a scandal for its frank treatment of decadence and implicit homoeroticism. But the real scandal came in 1895, when Wilde sued the Marquess of Queensberry for libel after Queensberry accused him of 'posing as a sodomite.' The suit collapsed, and Wilde was prosecuted under laws criminalizing homosexual acts. He was convicted and sentenced to two years of hard labor.`,

              `Prison broke his health and his finances, but not his mind. His long poem The Ballad of Reading Gaol and his prose meditation De Profundis were written in its shadow. Released in 1897, he lived his final years in poverty and exile in France, dying in Paris on November 30, 1900, at the age of forty-six. The wit, the suffering, and the injustice have made him one of the most enduring and beloved figures in English literary culture.`,
            ].map((text, i) => (
              <p
                key={i}
                style={{
                  textAlign: "left",
                  lineHeight: "1.6",
                  marginTop: "0.06in",
                  marginBottom: "0.11in",
                  color: "#f3e9eb",
                  fontFamily: "Georgia, serif",
                  fontSize: "12pt",
                }}
              >
                {text}
              </p>
            ))}

            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.19in",
                marginBottom: "0.07in",
                color: "#e6c7a1",
                fontFamily: "Arial, serif",
                fontSize: "11pt",
                fontWeight: "bold",
              }}
            >
              Top 3 Books
            </p>

            <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Picture of Dorian Gray (1890)
                </span>
                <span
                  style={{
                    color: "#f3e9eb",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                  }}
                >
                  {" "}
                  — A beautiful young man sells his soul for eternal youth while his
                  portrait ages in his place — Wilde's only novel, a shimmering Gothic
                  fable about art, beauty, and moral corruption.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Importance of Being Earnest (1895)
                </span>
                <span
                  style={{
                    color: "#f3e9eb",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                  }}
                >
                  {" "}
                  — The funniest play in the English language — a perfectly engineered
                  comedy of mistaken identities, cucumber sandwiches, and the sublime
                  absurdity of Victorian social convention.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Happy Prince and Other Tales (1888)
                </span>
                <span
                  style={{
                    color: "#f3e9eb",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                  }}
                >
                  {" "}
                  — Wilde's fairy tales for adults — exquisitely written, deceptively
                  simple, and quietly heartbreaking in their examination of sacrifice,
                  beauty, and human indifference.
                </span>
              </li>
            </ul>

            <div
              style={{
                marginTop: "0.14in",
                marginBottom: "0.14in",
                borderBottom: "1px solid #d4b896",
              }}
            />
          </div>

          {/** Next author */}
          <div>
            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.33in",
                marginBottom: "0.04in",
              }}
            >
              <span
                style={{
                  color: "#e6c7a1",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                10.
              </span>{" "}
              <span
                style={{
                  color: "#ffffff",
                  fontFamily: "Arial, serif",
                  fontSize: "18pt",
                  fontWeight: "bold",
                }}
              >
                Edgar Allan Poe
              </span>
            </p>

            <p style={{ lineHeight: "100%", marginBottom: "0.17in" }}>
              <span
                style={{
                  color: "#d6c2c7",
                  fontFamily: "Arial, serif",
                  fontSize: "10pt",
                  fontStyle: "italic",
                }}
              >
                American · 1809–1849
              </span>
            </p>

            {[
              `Edgar Allan Poe was born in Boston on January 19, 1809, to itinerant actors, and was orphaned by the age of three. Taken in — though never formally adopted — by John and Frances Allan of Richmond, Virginia, he was educated in England and America, attended the University of Virginia briefly, and was discharged from West Point under circumstances that severed his relationship with his foster father permanently. He spent the rest of his life in genteel poverty, moving between Baltimore, Richmond, Philadelphia, and New York.`,

              `Poe was the first American writer to attempt to make a living entirely through writing and editing, and the strain showed: he was perpetually in debt, dependent on irregular magazine work, and haunted by the death of the women he loved — his mother, his foster mother, and most devastatingly his young wife Virginia Clemm, who died of tuberculosis in 1847. His relationship with alcohol, the subject of much speculation and myth, compounded his difficulties.`,

              `What Poe achieved in fiction was nothing less than the invention of two major literary genres: the detective story and the modern horror tale. His tales of ratiocination — The Murders in the Rue Morgue, The Purloined Letter, The Mystery of Marie Rogêt — gave birth to every detective story ever written, from Conan Doyle to Agatha Christie to contemporary crime fiction. His horror tales — The Tell-Tale Heart, The Fall of the House of Usher, The Masque of the Red Death — defined the aesthetics of psychological terror.`,

              `As a poet, Poe sought a pure musicality, a fusion of sound and feeling uncontaminated by moral instruction. The Raven and Annabel Lee are among the most memorized poems in American literary history. He also wrote influential theoretical essays on the nature of poetry and short fiction. He died in Baltimore on October 7, 1849, under mysterious circumstances — found delirious on a street, possibly a victim of cooping or rabies — at the age of forty.`,
            ].map((text, i) => (
              <p
                key={i}
                style={{
                  textAlign: "left",
                  lineHeight: "1.6",
                  marginTop: "0.06in",
                  marginBottom: "0.11in",
                  color: "#f3e9eb",
                  fontFamily: "Georgia, serif",
                  fontSize: "12pt",
                }}
              >
                {text}
              </p>
            ))}

            <p
              style={{
                lineHeight: "100%",
                marginTop: "0.19in",
                marginBottom: "0.07in",
                color: "#e6c7a1",
                fontFamily: "Arial, serif",
                fontSize: "11pt",
                fontWeight: "bold",
              }}
            >
              Top 3 Books
            </p>

            <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Tell-Tale Heart and Other Tales (1843)
                </span>
                <span
                  style={{
                    color: "#f3e9eb",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                  }}
                >
                  {" "}
                  — The murderer who cannot silence the beating heart beneath his
                  floorboards — Poe at his most compressed, relentless, and
                  psychologically devastating.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Fall of the House of Usher (1839)
                </span>
                <span
                  style={{
                    color: "#f3e9eb",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                  }}
                >
                  {" "}
                  — A crumbling ancestral mansion, a doomed family, and a narrator
                  losing his grip on reality — the supreme example of Poe's
                  atmospheric Gothic horror.
                </span>
              </li>

              <li style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                    fontWeight: "bold",
                  }}
                >
                  The Murders in the Rue Morgue (1841)
                </span>
                <span
                  style={{
                    color: "#f3e9eb",
                    fontFamily: "Georgia, serif",
                    fontSize: "11pt",
                  }}
                >
                  {" "}
                  — The world's first detective story, introducing the brilliant C.
                  Auguste Dupin and inventing a genre that has never stopped growing.
                </span>
              </li>
            </ul>

            <div
              style={{
                marginTop: "0.14in",
                marginBottom: "0.14in",
                borderBottom: "1px solid #d4b896",
              }}
            />

            <p
              style={{
                textAlign: "center",
                marginTop: "0.28in",
                paddingTop: "0.11in",
                borderTop: "1px solid #d4b896",
                color: "#aaaaaa",
                fontFamily: "Arial, serif",
                fontSize: "9pt",
              }}
            >
              All authors featured on Libreya · libreya.app · Free classic literature
              for everyone
            </p>

            <p
              style={{
                textAlign: "center",
                marginTop: "0.47in",
                color: "#aaaaaa",
                fontFamily: "Arial, serif",
                fontSize: "9pt",
              }}
            >
              Libreya Classic Library · libreya.app · Page 6
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "26px", marginTop: "40px" }}>Easy Reading Online</h2>
            <p style={{ fontSize: "18px", opacity: 0.9 }}>
              Libreya makes reading classic books simple. Pages are clean and easy to read.
            </p>
            <p style={{ fontSize: "18px", opacity: 0.9 }}>
              You can enjoy long reading sessions on any device.
            </p>
          </div>

          <div>

          </div>

          <div>
            <h2 style={{ fontSize: "26px", marginTop: "40px" }}>Free for Everyone</h2>
            <p style={{ fontSize: "18px", opacity: 0.9 }}>
              There are no subscriptions or paywalls. Students, teachers, and readers can explore these books anytime.
            </p>

            <h2 style={{ fontSize: "26px", marginTop: "40px" }}>Start Reading Today</h2>
            <p style={{ fontSize: "18px", opacity: 0.9 }}>
              Browse authors, find famous novels, and enjoy classic literature with Libreya.
            </p>
          </div>
        </div>

        {/* Hide static SEO content after SPA loads */}
        <script dangerouslySetInnerHTML={{
          __html: `
    window.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        var seo = document.getElementById('seo-content');
        if (seo) seo.style.display = 'none';
        var footer = document.getElementById('seo-footer');
        if (footer) footer.style.display = 'none';
      }, 1000);
    });
  `}} />

        {children /* Expo SPA */}

        {/* Footer for AdSense-required pages */}
        <div
          id="seo-footer"
          style={{
            textAlign: "center",
            padding: "30px 20px",
            fontSize: "14px",
            color: "#f3e8ea",
            fontFamily: "Georgia, serif",
            borderTop: "1px solid rgba(255,255,255,0.15)"
          }}
        >
          <a href="/about" style={{ color: "#fff", margin: "0 10px" }}>About</a> |
          <a href="/privacy" style={{ color: "#fff", margin: "0 10px" }}>Privacy Policy</a> |
          <a href="/contact" style={{ color: "#fff", margin: "0 10px" }}>Contact</a> |
          <a href="/disclaimer" style={{ color: "#fff", margin: "0 10px" }}>Disclaimer</a>
          <p style={{ marginTop: "15px", color: "#f3e8ea" }}>© 2026 Libreya. All rights reserved.</p>
        </div>

      </body>
    </html>
  );
}
