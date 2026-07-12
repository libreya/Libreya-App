"""
Bulk-update book descriptions from Gutendex
Fetches the AI-generated summary for each book from the Gutendex API
(https://gutendex.com) and writes it into the `description` column in
Supabase for books that don't have one yet (description IS NULL). Existing
descriptions - including the generic "A classic work by ..." placeholder
seed_books.py inserts - are left untouched.

Only books whose `source_url` points at gutenberg.org/ebooks/<id> can be
matched against Gutendex - other rows are skipped and counted separately.

Requires SUPABASE_SERVICE_ROLE_KEY: the `books` table's RLS policy only
allows admins (checked via auth.uid()) to write, and this script has no
Supabase Auth session, so the anon key won't pass that check. Get the
service role key from the Supabase dashboard -> Project Settings -> API,
and put it in scripts/.env (gitignored) - never commit it or add it to
frontend/.env.local.

Usage:
    python scripts/update_descriptions_gutendex.py [--dry-run] [--delay 0.3]
"""
import argparse
import asyncio
import os
import re
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Matches the site's own convention for reading the id back out (see
# source_url.split('/').pop() in pages/book/[id].tsx) and how seed_books.py
# writes it: f"https://www.gutenberg.org/ebooks/{gutenberg_id}"
GUTENBERG_ID_RE = re.compile(r"gutenberg\.org/ebooks/(\d+)", re.IGNORECASE)

# Gutendex/Gutenberg block plain default-UA requests; mirror the headers
# pages/api/gutendex.ts already uses successfully.
GUTENDEX_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://gutendex.com/",
}

PAGE_SIZE = 500


def supabase_headers() -> dict:
    if not SUPABASE_SERVICE_ROLE_KEY:
        raise SystemExit(
            "SUPABASE_SERVICE_ROLE_KEY is not set. The books table's RLS policy only "
            "allows admins to write (checked via auth.uid()), and this script has no "
            "Supabase Auth session, so the anon key can't update rows here. Add the "
            "service role key (Supabase dashboard -> Project Settings -> API) to "
            "scripts/.env as SUPABASE_SERVICE_ROLE_KEY=... before running this script."
        )
    return {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }


async def fetch_all_books(client: httpx.AsyncClient) -> list[dict]:
    books = []
    offset = 0
    while True:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/books",
            headers=supabase_headers(),
            params={
                "select": "id,title,source_url",
                "description": "is.null",
                "order": "id.asc",
                "limit": PAGE_SIZE,
                "offset": offset,
            },
        )
        response.raise_for_status()
        page = response.json()
        books.extend(page)
        if len(page) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return books


def extract_gutenberg_id(source_url: str | None) -> int | None:
    if not source_url:
        return None
    match = GUTENBERG_ID_RE.search(source_url)
    return int(match.group(1)) if match else None


async def fetch_gutendex_summary(client: httpx.AsyncClient, gutenberg_id: int) -> str | None:
    try:
        response = await client.get(
            f"https://gutendex.com/books/{gutenberg_id}/", headers=GUTENDEX_HEADERS
        )
    except httpx.HTTPError as exc:
        print(f"  - Gutendex request failed for #{gutenberg_id}: {exc}")
        return None
    if response.status_code != 200:
        print(f"  - Gutendex returned {response.status_code} for #{gutenberg_id}")
        return None
    summaries = response.json().get("summaries") or []
    return summaries[0].strip() if summaries and summaries[0].strip() else None


async def update_description(
    client: httpx.AsyncClient, book_id: int, description: str, dry_run: bool
) -> bool:
    if dry_run:
        return True
    response = await client.patch(
        f"{SUPABASE_URL}/rest/v1/books",
        headers=supabase_headers(),
        params={"id": f"eq.{book_id}"},
        json={"description": description},
    )
    if response.status_code not in (200, 204):
        print(f"  - Failed to update book {book_id}: {response.status_code} {response.text}")
        return False
    return True


async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Fetch summaries but don't write to Supabase")
    parser.add_argument("--delay", type=float, default=0.3, help="Seconds to wait between Gutendex requests")
    args = parser.parse_args()

    if not SUPABASE_URL:
        raise SystemExit("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is not set.")

    async with httpx.AsyncClient(timeout=30) as client:
        print("Fetching books with no description from Supabase...")
        books = await fetch_all_books(client)
        print(f"Found {len(books)} books with a NULL description.\n")

        updated = skipped_no_id = skipped_no_summary = failed = 0

        for book in books:
            title = book.get("title", "?")
            gutenberg_id = extract_gutenberg_id(book.get("source_url"))

            if gutenberg_id is None:
                print(f"Skipping '{title}': no Gutenberg id in source_url")
                skipped_no_id += 1
                continue

            summary = await fetch_gutendex_summary(client, gutenberg_id)
            if not summary:
                print(f"Skipping '{title}' (#{gutenberg_id}): no Gutendex summary available")
                skipped_no_summary += 1
                await asyncio.sleep(args.delay)
                continue

            ok = await update_description(client, book["id"], summary, args.dry_run)
            if ok:
                verb = "Would update" if args.dry_run else "Updated"
                print(f"{verb} '{title}' (#{gutenberg_id})")
                updated += 1
            else:
                failed += 1

            await asyncio.sleep(args.delay)

        print("\nDone.")
        print(f"  Updated: {updated}")
        print(f"  Skipped (no Gutenberg id): {skipped_no_id}")
        print(f"  Skipped (no summary available): {skipped_no_summary}")
        print(f"  Failed: {failed}")


if __name__ == "__main__":
    asyncio.run(main())
