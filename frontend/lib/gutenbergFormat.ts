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
// Some editions number chapters with a bare numeral AND its title squished onto
// the very same line (e.g. "I. David and I Set Forth Upon a Journey", vs. the
// numeral-then-title-on-next-line pattern BARE_NUMBER_HEADING_RE/NUMBERED_HEADING_RE
// already cover). Deliberately NOT folded into isHeadingCandidate: a single-letter
// roman numeral ("I", "M", "V"...) followed by ". Capitalized word" collides with
// ordinary abbreviations - "M." for Monsieur recurs constantly in Les Misérables
// ("M. Madeleine rose.") - so trusting this pattern on an isolated paragraph would
// wrongly promote narrative sentences to headings. Only ever used to (a) spot a
// squished TOC block via a match-ratio across many lines, same as
// isSquishedTocBlock, and (b) harvest each entry's exact text there for
// cross-reference against a later real occurrence - never as a standalone signal.
const BARE_NUMBERED_TITLE_RE = /^(?:[IVXLCDM]{1,8}|\d{1,3})[.:]\s+\S/i;
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
  // Bare numerals (no CHAPTER/BOOK/etc keyword) can also have a subtitle
  // squished onto the very next line with no blank line between them (e.g.
  // Treasure Island: "I\nThe Old Sea-dog at the Admiral Benbow"). Only the
  // FIRST line needs to be just the numeral - testing the whole multi-line
  // string would never match (a real subtitle isn't itself just a numeral),
  // and a prefix match against the whole string would be unsafe, since many
  // ordinary sentences start with the word "I".
  const firstLine = p.split('\n', 1)[0];
  return BARE_NUMBER_HEADING_RE.test(firstLine);
}

// A page-numbered table of contents (e.g. "I.  THE OLD SEA-DOG . . . .  11")
// has no reliable heading keyword to match on, so it needs its own signal:
// most editions right-align a page number after a run of dot leaders. Real
// narrative prose never ends most of its lines this way.
const TOC_PAGE_NUMBER_RE = /(?:\.\s*){2,}\d+\s*$/;

function looksLikeTocPageListing(p: string): boolean {
  const lines = p.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return false;
  const matchCount = lines.filter((l) => TOC_PAGE_NUMBER_RE.test(l)).length;
  return matchCount / lines.length >= 0.5;
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

/**
 * Same idea as isSquishedTocBlock, but for a "numeral. Title" listing (e.g. The
 * Little White Bird's CONTENTS: "I. David and I Set Forth Upon a Journey" /
 * "II. The Little Nursery Governess" / ... with no blank lines between entries,
 * so the whole listing is one paragraph). Kept separate from isSquishedTocBlock/
 * isHeadingCandidate on purpose - see BARE_NUMBERED_TITLE_RE's comment on why
 * that pattern is only ever safe to trust across a ratio of many lines, never
 * on a single isolated paragraph.
 */
function isSquishedNumberedTitleTocBlock(p: string): boolean {
  const lines = p.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 4) return false;
  const matchCount = lines.filter((l) => BARE_NUMBERED_TITLE_RE.test(l)).length;
  return matchCount / lines.length >= SQUISHED_TOC_MATCH_RATIO;
}

/** Collapse a (possibly wrapped, multi-line) entry down to a comparable key. */
function normalizeNumberedTitle(p: string): string {
  return p
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.:;,]+$/, '')
    .toLowerCase();
}

/**
 * Harvests exact entries out of confirmed isSquishedNumberedTitleTocBlock
 * paragraphs, so a later real occurrence of the same title can be promoted to
 * <h2> by exact match (mirroring findBareTitleTocEntries' cross-reference
 * approach). A TOC entry can itself wrap onto a continuation line with deeper
 * indentation and no marker of its own (e.g. "III. Her Marriage, Her Clothes,
 * Her Appetite, and an\n    Inventory of Her Furniture.") - lines that don't
 * start a new "numeral. " marker are joined onto the entry they continue
 * rather than treated as their own line.
 */
function findNumberedTitleTocEntries(paragraphs: ParagraphInfo[]): Set<string> {
  const entries = new Set<string>();

  for (const info of paragraphs) {
    const p = info.text;
    if (!isSquishedNumberedTitleTocBlock(p)) continue;

    const lines = p.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    let current: string | null = null;
    for (const line of lines) {
      if (BARE_NUMBERED_TITLE_RE.test(line)) {
        if (current !== null) entries.add(normalizeNumberedTitle(current));
        current = line;
      } else if (current !== null) {
        current += ` ${line}`;
      }
    }
    if (current !== null) entries.add(normalizeNumberedTitle(current));
  }

  return entries;
}

interface ParagraphInfo {
  text: string;
  // True if the raw (pre-trim) paragraph started with a space/tab.
  isIndented: boolean;
}

// Some books title chapters with just a short descriptive name and no
// numbering or keyword at all (e.g. Dr. Jekyll and Mr. Hyde: "STORY OF THE
// DOOR", "SEARCH FOR MR. HYDE"). There's no anchor to match on directly, so
// this is only trusted when found as part of a confirmed run (see
// findBareTitleTocEntries below) - never as a standalone per-paragraph
// signal, which is far too easily triggered by dedications, signatures, or a
// single shouted word in dialogue.
const MAX_BARE_TITLE_LENGTH = 60;

function isBareTitleCandidate(p: string): boolean {
  if (p.includes('\n')) return false;
  if (p.length > MAX_BARE_TITLE_LENGTH) return false;
  if (!/[A-Za-z]/.test(p)) return false;
  // Don't double-count paragraphs the keyword-based system already
  // recognizes - those already have their own correct run-length +
  // indentation handling. Without this exclusion, a short non-keyword
  // paragraph like "NOTE." or "FOOTNOTES:" sitting between a keyword-based
  // TOC's tail and a real heading can act as a bridge, letting a confirmed
  // run "leak" into real headings the keyword-based system already isolates.
  if (STANDALONE_HEADING_RE.test(p) || NUMBERED_HEADING_RE.test(p)) return false;
  return isAllCapsText(p);
}

// Guards against treating a couple of incidental short all-caps lines (a
// dedication, a signature) as a table of contents - a real one lists many
// entries in a row.
const MIN_BARE_TITLE_TOC_RUN = 5;

/**
 * Scan for run(s) of consecutive bare-title-candidate paragraphs (sharing
 * indentation) at least MIN_BARE_TITLE_TOC_RUN long. Returns the paragraph
 * indices that make up those runs (to drop, since they're the TOC itself)
 * and the exact text of each entry (so a later, real occurrence of the same
 * title elsewhere in the document can be promoted to <h2> by exact match -
 * a much narrower and safer signal than treating every bare all-caps line
 * as a heading candidate on its own).
 */
function findBareTitleTocEntries(paragraphs: ParagraphInfo[]): { indices: Set<number>; titles: Set<string> } {
  const indices = new Set<number>();
  const titles = new Set<string>();

  let i = 0;
  while (i < paragraphs.length) {
    if (!isBareTitleCandidate(paragraphs[i].text)) {
      i++;
      continue;
    }

    const indented = paragraphs[i].isIndented;
    let j = i;
    while (
      j < paragraphs.length &&
      paragraphs[j].isIndented === indented &&
      isBareTitleCandidate(paragraphs[j].text)
    ) {
      j++;
    }

    if (j - i >= MIN_BARE_TITLE_TOC_RUN) {
      for (let k = i; k < j; k++) {
        indices.add(k);
        titles.add(paragraphs[k].text);
      }
    }

    i = j;
  }

  return { indices, titles };
}

// Some TOCs combine the chapter marker and its title on one line (e.g. "CHAPTER
// 44 THE JOURNEY ENDED"), while the real heading later is just the bare marker
// alone ("CHAPTER 1", with its title as a separate paragraph next).
function isBareNumberedMarker(p: string): boolean {
  if (p.includes('\n')) return false;
  const match = p.match(NUMBERED_HEADING_RE);
  if (!match) return false;
  const rest = p.slice(match[0].length).trim();
  return /^[\dIVXLCDM]{0,8}[.:]?$/i.test(rest);
}

/** Extracts just "CHAPTER 44" from "CHAPTER 44 THE JOURNEY ENDED", or null if no immediate number follows the keyword. */
function extractNumberedMarkerPrefix(p: string): string | null {
  const match = p.match(NUMBERED_HEADING_RE);
  if (!match) return null;
  const rest = p.slice(match[0].length);
  const numMatch = rest.match(/^\s*[\dIVXLCDM]{1,8}\.?/i);
  if (!numMatch) return null;
  return (match[0] + numMatch[0]).replace(/\s+/g, ' ').trim();
}

/**
 * Finds runs of consecutive, same-indentation, non-bare NUMBERED entries
 * longer than MAX_HEADING_RUN_LENGTH (i.e. already-confirmed TOC listings by
 * the normal rule) and extracts each entry's bare marker prefix ("CHAPTER 44"
 * from "CHAPTER 44 THE JOURNEY ENDED"). Used to rescue a bare marker that's
 * directly adjacent to such a TOC with no indentation difference to lean on
 * (e.g. Journey to the Centre of the Earth's real "CHAPTER 1", sitting flush
 * against the TOC's flush-left "CHAPTER 44 THE JOURNEY ENDED").
 *
 * Only prefixes that occur exactly once GLOBALLY are trusted: some books
 * (War and Peace, Les Misérables) restart chapter numbering per Book/Volume,
 * so "CHAPTER I" can legitimately recur many times - even across more than
 * one confirmed run, when the TOC is fragmented by an occasional untitled
 * chapter - and treating it as a unique identifier there would wrongly
 * rescue an unrelated occurrence sharing the same bare text.
 */
function findNumberedTocMarkerPrefixes(paragraphs: ParagraphInfo[]): Set<string> {
  const allPrefixes: string[] = [];

  let i = 0;
  while (i < paragraphs.length) {
    const info = paragraphs[i];
    const isNonBareNumbered =
      !info.text.includes('\n') && NUMBERED_HEADING_RE.test(info.text) && !isBareNumberedMarker(info.text);
    if (!isNonBareNumbered) {
      i++;
      continue;
    }

    const indented = info.isIndented;
    let j = i;
    while (
      j < paragraphs.length &&
      paragraphs[j].isIndented === indented &&
      !paragraphs[j].text.includes('\n') &&
      NUMBERED_HEADING_RE.test(paragraphs[j].text) &&
      !isBareNumberedMarker(paragraphs[j].text)
    ) {
      j++;
    }

    if (j - i > MAX_HEADING_RUN_LENGTH) {
      for (let k = i; k < j; k++) {
        const prefix = extractNumberedMarkerPrefix(paragraphs[k].text);
        if (prefix) allPrefixes.push(prefix);
      }
    }

    i = j;
  }

  const counts = new Map<string, number>();
  allPrefixes.forEach((p) => counts.set(p, (counts.get(p) || 0) + 1));
  const prefixes = new Set<string>();
  counts.forEach((count, p) => {
    if (count === 1) prefixes.add(p);
  });
  return prefixes;
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

  const bareTitleToc = findBareTitleTocEntries(paragraphs);
  const numberedTocPrefixes = findNumberedTocMarkerPrefixes(paragraphs);
  const numberedTitleTocEntries = findNumberedTitleTocEntries(paragraphs);
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

    if (bareTitleToc.indices.has(i)) {
      isTocEntry = true;
    } else if (isSquishedTocBlock(p) || looksLikeTocPageListing(p) || isSquishedNumberedTitleTocBlock(p)) {
      isTocEntry = true;
    } else if (isHeadingCandidate(p)) {
      // A page-numbered TOC has no heading keyword of its own to match on, so
      // its "PART ONE" / "CHAPTER I" entries can end up isolated - not part of
      // any detectable run - once the page-numbered listing lines around them
      // are excluded. If a heading candidate sits directly next to a
      // page-numbered listing, treat it as part of that same TOC too.
      const prevIsTocListing = i > 0 && looksLikeTocPageListing(paragraphs[i - 1].text);
      const nextIsTocListing = i < paragraphs.length - 1 && looksLikeTocPageListing(paragraphs[i + 1].text);

      if (prevIsTocListing || nextIsTocListing) {
        isTocEntry = true;
      } else if (headingRunLength(paragraphs, i) <= MAX_HEADING_RUN_LENGTH) {
        // A genuine chapter break (or a short nested stack like BOOK+CHAPTER)
        // is a short run of heading-candidates; a real table-of-contents
        // listing (its entries as separate paragraphs rather than one
        // squished block) is a much longer run. See headingRunLength().
        isRealHeading = true;
      } else if (isBareNumberedMarker(p) && numberedTocPrefixes.has(p)) {
        // Overflow case: a bare marker directly adjacent to a confirmed long
        // "number + title" TOC run with no indentation difference to lean on
        // (e.g. Journey to the Centre of the Earth's real "CHAPTER 1" sitting
        // flush against the TOC's flush-left "CHAPTER 44 THE JOURNEY ENDED").
        // Rescued because its exact bare text matches a prefix extracted from
        // that confirmed run - see findNumberedTocMarkerPrefixes().
        isRealHeading = true;
      } else {
        isTocEntry = true;
      }
    } else if (bareTitleToc.titles.has(p)) {
      // Exact match against a confirmed bare-title TOC entry found elsewhere
      // in the document - the narrow, evidence-based signal that lets a
      // keyword-less chapter title (e.g. "STORY OF THE DOOR") be recognized
      // as real without treating every bare all-caps line as a candidate.
      isRealHeading = true;
    } else if (numberedTitleTocEntries.has(normalizeNumberedTitle(p))) {
      // Same idea, but for a "numeral. Title" heading (e.g. "I. David and I
      // Set Forth Upon a Journey") cross-referenced against a confirmed
      // squished numbered-title TOC listing - see findNumberedTitleTocEntries().
      isRealHeading = true;
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
