"""
Final Book Seeding Script - Add 15 more books to reach 300+
"""
import httpx
import asyncio
import re
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://bruzgztsltjtzwkkehif.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

def get_supabase_headers():
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def categorize_book(title: str, author: str) -> str:
    text = f"{title} {author}".lower()
    if any(word in text for word in ['poetry', 'poems', 'verse']): return "Poetry"
    elif any(word in text for word in ['mystery', 'detective']): return "Mystery"
    elif any(word in text for word in ['adventure', 'journey']): return "Adventure"
    elif any(word in text for word in ['romance', 'love']): return "Romance"
    else: return "Fiction"

# Additional books 
FINAL_BOOKS = [
    {"title": "The Virginian", "author": "Owen Wister", "gutenberg_id": 1298},
    {"title": "Riders of the Purple Sage", "author": "Zane Grey", "gutenberg_id": 1300},
    {"title": "The Last Trail", "author": "Zane Grey", "gutenberg_id": 2918},
    {"title": "The Lone Star Ranger", "author": "Zane Grey", "gutenberg_id": 3951},
    {"title": "The Rainbow Trail", "author": "Zane Grey", "gutenberg_id": 2799},
    {"title": "Desert Gold", "author": "Zane Grey", "gutenberg_id": 1709},
    {"title": "The Wonderful Wizard of Oz", "author": "L. Frank Baum", "gutenberg_id": 55},
    {"title": "The Marvelous Land of Oz", "author": "L. Frank Baum", "gutenberg_id": 54},
    {"title": "Ozma of Oz", "author": "L. Frank Baum", "gutenberg_id": 33361},
    {"title": "Dorothy and the Wizard in Oz", "author": "L. Frank Baum", "gutenberg_id": 22566},
    {"title": "The Emerald City of Oz", "author": "L. Frank Baum", "gutenberg_id": 517},
    {"title": "Peter Pan", "author": "J. M. Barrie", "gutenberg_id": 16},
    {"title": "The Little White Bird", "author": "J. M. Barrie", "gutenberg_id": 1376},
    {"title": "The Admirable Crichton", "author": "J. M. Barrie", "gutenberg_id": 3363},
]

async def fetch_gutenberg_text(gutenberg_id: int) -> str:
    urls = [
        f"https://www.gutenberg.org/cache/epub/{gutenberg_id}/pg{gutenberg_id}.txt",
        f"https://www.gutenberg.org/files/{gutenberg_id}/{gutenberg_id}-0.txt",
        f"https://www.gutenberg.org/files/{gutenberg_id}/{gutenberg_id}.txt",
    ]
    async with httpx.AsyncClient(timeout=60) as client:
        for url in urls:
            try:
                response = await client.get(url)
                if response.status_code == 200:
                    text = response.text
                    paragraphs = text.split('\n\n')
                    html = ""
                    for p in paragraphs:
                        p = p.strip()
                        if p:
                            if re.match(r'^(CHAPTER|Chapter|BOOK|Book|PART|Part)', p):
                                html += f"<h2>{p}</h2>\n"
                            else:
                                html += f"<p>{p}</p>\n"
                    return html
            except: continue
    return ""

async def get_cover(gutenberg_id: int) -> str:
    urls = [f"https://www.gutenberg.org/cache/epub/{gutenberg_id}/pg{gutenberg_id}.cover.medium.jpg"]
    async with httpx.AsyncClient(timeout=30) as client:
        for url in urls:
            try:
                if (await client.head(url)).status_code == 200: return url
            except: pass
    return ""

async def check_exists(title: str) -> bool:
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(f"{SUPABASE_URL}/rest/v1/books", headers=get_supabase_headers(), params={"title": f"eq.{title}", "select": "id"})
        return len(r.json()) > 0 if r.status_code == 200 else False

async def seed_book(book: dict):
    print(f"Processing: {book['title']}")
    if await check_exists(book['title']):
        print(f"  - Already exists")
        return False
    content = await fetch_gutenberg_text(book['gutenberg_id'])
    if not content:
        print(f"  - No content")
        return False
    
    data = {
        "title": book['title'], "author": book['author'], "content_body": content[:500000],
        "category": categorize_book(book['title'], book['author']),
        "cover_image": await get_cover(book['gutenberg_id']),
        "is_featured": False, "read_count": 0,
        "description": f"A classic by {book['author']}. Public domain from Project Gutenberg.",
        "source_url": f"https://www.gutenberg.org/ebooks/{book['gutenberg_id']}"
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(f"{SUPABASE_URL}/rest/v1/books", headers=get_supabase_headers(), json=data)
        if r.status_code in [200, 201]:
            print(f"  - Added!")
            return True
        print(f"  - Failed: {r.text[:100]}")
    return False

async def main():
    print("Final seeding...")
    count = sum([await seed_book(b) or await asyncio.sleep(0.5) or False for b in FINAL_BOOKS])
    print(f"Done! Added {count} books.")

if __name__ == "__main__": asyncio.run(main())
