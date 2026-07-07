// Shared Gutenberg plain-text -> Supabase-ready HTML conversion.
// Mirrors the logic in backend/seed_books.py so books imported through
// either path end up in the same shape (content_body with <h2> chapter
// headings and <p> paragraphs).

// Numbered/lettered markers conventionally continue into a subtitle on the same
// heading (e.g. Dickens' "CHAPTER I.\nTREATS OF THE PLACE WHERE OLIVER TWIST WAS
// BORN...", squished across lines with no blank line between the marker and its
// title) - so these are allowed to span multiple lines as one heading.
const NUMBERED_HEADING_RE = /^(CHAPTER|Chapter|BOOK|Book|PART|Part|ACT|Act|SCENE|Scene|LETTER|Letter|VOLUME|Volume)\b/;
// Unlike numbered markers, these always name a complete section by themselves -
// they never legitimately continue into a second line as a subtitle. Without this
// distinction, a squished TOC pair like "INTRODUCTION.\nPOPE'S PREFACE TO THE
// ILIAD OF HOMER" (two independent entries with no blank line between them) would
// get read as one heading swallowing the second entry as if it were a subtitle.
const STANDALONE_HEADING_RE = /^(PREFACE|Preface|INTRODUCTION|Introduction|FOREWORD|Foreword)\b/;
// Some editions number chapters with just a bare numeral on its own line/paragraph
// (e.g. "                    I" with no "Chapter" prefix). Only matches when the
// WHOLE trimmed paragraph is nothing but the numeral, since real prose paragraphs
// are never a single bare word by themselves. Capped at 3 digits - no real book
// has thousands of chapters, and a longer run of digits is more likely a year
// (e.g. a "1899" publication date on the title page) than a chapter number.
const BARE_NUMBER_HEADING_RE = /^(?:[IVXLCDM]{1,8}|\d{1,3})\.?$/i;
const START_MARKER_RE = /\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*/is;
const END_MARKER_RE = /\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*/is;
// Transcriber notes like "[Illustration: a knight on horseback]" or bare "[Illustration]".
// Non-greedy + spans newlines so a blank line inside the brackets doesn't leave a dangling "[Illustration:".
// Captures the inner content so a chapter heading embedded in an ornamental
// chapter-heading graphic (e.g. "[Illustration: ·TITLE·\n\nChapter I.]") can be rescued.
const ILLUSTRATION_RE = /\[\s*illustration\s*:?([\s\S]*?)\]/gi;
const HEADING_IN_BLOCK_RE = /^\s*(CHAPTER|BOOK|PART|ACT|SCENE|PREFACE|INTRODUCTION|FOREWORD|LETTER|VOLUME)\b.*$/im;
// Gutenberg's plain-text convention for italics: "_emphasized text_". Excludes
// newlines so an unbalanced underscore can't swallow an entire paragraph.
const ITALIC_RE = /_([^_\n]+)_/g;

// Real headings are short titles. Some paragraphs merely OPEN with a heading
// keyword before continuing into ordinary prose in the same paragraph (e.g.
// Moby-Dick's Cetology chapter: "BOOK I. (Folio), CHAPTER III. (Fin-Back).—Under
// this head I reckon a monster which..."). Capping the length keeps those from
// being mistaken for a real section break. Exempt from the cap: paragraphs with
// no lowercase letters at all - some editions (e.g. Dickens') print the chapter
// number and its full descriptive title as one all-caps paragraph, which can
// run well past the cap despite being a genuine heading, not narrative prose.
const MAX_HEADING_LENGTH = 100;

function isAllCapsText(p: string): boolean {
  return !/[a-z]/.test(p);
}

function isHeadingCandidate(p: string): boolean {
  if (STANDALONE_HEADING_RE.test(p)) {
    // Never let these absorb a trailing line as if it were a subtitle - only a
    // genuinely standalone, single-line occurrence counts.
    return !p.includes('\n') && p.length <= MAX_HEADING_LENGTH;
  }
  if (NUMBERED_HEADING_RE.test(p)) {
    return p.length <= MAX_HEADING_LENGTH || isAllCapsText(p);
  }
  return BARE_NUMBER_HEADING_RE.test(p);
}

// A squished TOC block rarely has every single line matching a heading keyword -
// some entries are section dividers or appendix labels that don't fit the list
// (e.g. "THE ODYSSEY" or "FOOTNOTES:" mixed in among a run of "BOOK I."..."BOOK
// XXIV."). Real prose essentially never has most of its physical line-wraps
// independently start with a heading keyword, so a high match ratio is still a
// safe signal even without requiring every line to match.
const SQUISHED_TOC_MATCH_RATIO = 0.7;

/**
 * Some editions squish an entire "CONTENTS" listing into one paragraph with no
 * blank lines between entries (e.g. "CHAPTER I. Title\nCHAPTER II. Title\n...").
 * That block still starts with a heading keyword, so it would otherwise pass the
 * single-candidate check below. Detect it directly: 2+ internal lines where most
 * lines independently look like a heading is never real prose.
 */
function isSquishedTocBlock(p: string): boolean {
  const lines = p.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) return false;
  const matchCount = lines.filter(isHeadingCandidate).length;
  return matchCount / lines.length >= SQUISHED_TOC_MATCH_RATIO;
}

interface ParagraphInfo {
  text: string;
  // True if the raw (pre-trim) paragraph started with a space/tab.
  isIndented: boolean;
}

// A real chapter break can legitimately be a short stack of nested headings
// (e.g. "BOOK ONE: 1805" immediately followed by "CHAPTER I", with no body text
// between them - a normal two-level BOOK/CHAPTER hierarchy; Les Misérables goes
// a level deeper still, with "VOLUME I" -> "BOOK FIRST" -> "CHAPTER I" stacked
// with nothing but blank lines between them at the start of each volume). A real
// table-of-contents listing (when its entries are separate blank-line-delimited
// paragraphs rather than one squished block) is a much longer run. Cap how many
// consecutive heading-candidates are allowed before treating the whole run as a
// TOC dump instead of a genuine nested heading.
const MAX_HEADING_RUN_LENGTH = 3;

/**
 * Length of the run of consecutive heading-candidate paragraphs containing
 * `index`. The run only extends into a neighbor that shares the same
 * indentation status - this stops a long, indented TOC listing from "leaking"
 * into an adjacent real (non-indented) heading with nothing but blank lines
 * between them, which would otherwise inflate the real heading's run length.
 */
function headingRunLength(paragraphs: ParagraphInfo[], index: number): number {
  const indented = paragraphs[index].isIndented;

  let start = index;
  while (
    start > 0 &&
    paragraphs[start - 1].isIndented === indented &&
    isHeadingCandidate(paragraphs[start - 1].text)
  ) {
    start--;
  }

  let end = index;
  while (
    end < paragraphs.length - 1 &&
    paragraphs[end + 1].isIndented === indented &&
    isHeadingCandidate(paragraphs[end + 1].text)
  ) {
    end++;
  }

  return end - start + 1;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Convert Gutenberg's "_emphasized text_" convention into real <em> tags. */
function convertItalics(escapedText: string): string {
  return escapedText.replace(ITALIC_RE, '<em>$1</em>');
}

export interface ParsedGutenbergMeta {
  title: string | null;
  author: string | null;
}

/** Pull "Title:" / "Author:" out of the Gutenberg preamble, if present. */
export function parseGutenbergMeta(rawText: string): ParsedGutenbergMeta {
  const startIdx = rawText.search(START_MARKER_RE);
  const header = startIdx >= 0 ? rawText.slice(0, startIdx) : rawText.slice(0, 4000);

  const titleMatch = header.match(/^Title:\s*(.+)$/im);
  const authorMatch = header.match(/^Author:\s*(.+)$/im);

  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    author: authorMatch ? authorMatch[1].trim() : null,
  };
}

/** Strip Gutenberg's license header/footer, keeping just the book body. */
export function stripGutenbergBoilerplate(rawText: string): string {
  let text = rawText.replace(/\r\n/g, '\n');

  const startMatch = text.match(START_MARKER_RE);
  if (startMatch && startMatch.index !== undefined) {
    text = text.slice(startMatch.index + startMatch[0].length);
  }

  const endMatch = text.match(END_MARKER_RE);
  if (endMatch && endMatch.index !== undefined) {
    text = text.slice(0, endMatch.index);
  }

  return text.trim();
}

/**
 * Remove "[Illustration: ...]" / "[Illustration]" transcriber notes.
 * Some editions render ornamental chapter-heading art as an illustration
 * whose caption contains the chapter title itself — in that case keep just
 * the heading line (as its own paragraph) instead of dropping the whole block.
 */
export function stripIllustrationMarkers(text: string): string {
  return text.replace(ILLUSTRATION_RE, (_match, inner: string) => {
    const headingMatch = inner.match(HEADING_IN_BLOCK_RE);
    return headingMatch ? `\n\n${headingMatch[0].trim()}\n\n` : '';
  });
}

/** Convert cleaned plain text into <h2>/<p> HTML ready for `books.content_body`. */
export function textToSupabaseHtml(cleanedText: string): string {
  const withoutIllustrations = stripIllustrationMarkers(cleanedText);
  const paragraphs: ParagraphInfo[] = withoutIllustrations
    .split(/\n\s*\n/)
    .map((raw) => ({ text: raw.trim(), isIndented: /^[ \t]/.test(raw) }))
    .filter((info) => info.text.length > 0);

  const parts: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].text;
    const escaped = convertItalics(escapeHtml(p));

    // Three outcomes, not two: a real heading (<h2>), an ordinary paragraph
    // (<p>, unchanged), or a recognized table-of-contents entry - which is
    // dropped entirely rather than kept as a <p>. A demoted TOC entry has no
    // reading value on its own (the app builds its own interactive chapter
    // nav from the real headings), and keeping it as inert text is actively
    // wrong when the TOC sits between two real headings rather than before
    // all of them: the reader's chapter-splitter groups everything between
    // consecutive <h2>s into one chapter, so a kept-but-demoted TOC block
    // right after a real heading (e.g. a Preface followed by "Contents"
    // before "Volume I") visibly leaks into that preceding chapter.
    let isRealHeading = false;
    let isTocEntry = false;

    if (isSquishedTocBlock(p)) {
      isTocEntry = true;
    } else if (isHeadingCandidate(p)) {
      // A genuine chapter break (or a short nested stack like BOOK+CHAPTER) is
      // a short run of heading-candidates; a real table-of-contents listing
      // (its entries as separate paragraphs rather than one squished block)
      // is a much longer run. See headingRunLength() for how it's bounded.
      if (headingRunLength(paragraphs, i) <= MAX_HEADING_RUN_LENGTH) {
        isRealHeading = true;
      } else {
        isTocEntry = true;
      }
    }

    if (isRealHeading) {
      parts.push(`<h2>${escaped}</h2>`);
    } else if (!isTocEntry) {
      parts.push(`<p>${escaped}</p>`);
    }
  }

  return parts.join('\n');
}

export interface FormattedGutenbergBook {
  title: string | null;
  author: string | null;
  html: string;
  charCount: number;
}

export function formatGutenbergText(rawText: string): FormattedGutenbergBook {
  const meta = parseGutenbergMeta(rawText);
  const cleaned = stripGutenbergBoilerplate(rawText);
  const html = textToSupabaseHtml(cleaned);

  return {
    title: meta.title,
    author: meta.author,
    html,
    charCount: html.length,
  };
}
