"""
Additional Book Seeding Script - Add 40 more books to reach 300+
"""
import httpx
import asyncio
import re
import os
from bs4 import BeautifulSoup
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

def categorize_book(title: str, author: str, description: str = "") -> str:
    """Categorize book based on title, author, and description"""
    text = f"{title} {author} {description}".lower()
    
    if any(word in text for word in ['poetry', 'poems', 'verse', 'sonnet']):
        return "Poetry"
    elif any(word in text for word in ['play', 'tragedy', 'comedy', 'drama', 'act i', 'act 1']):
        return "Drama"
    elif any(word in text for word in ['science fiction', 'sci-fi', 'space', 'future', 'robot']):
        return "Science Fiction"
    elif any(word in text for word in ['mystery', 'detective', 'crime', 'murder']):
        return "Mystery"
    elif any(word in text for word in ['horror', 'terror', 'ghost', 'supernatural']):
        return "Horror"
    elif any(word in text for word in ['adventure', 'journey', 'expedition', 'voyage']):
        return "Adventure"
    elif any(word in text for word in ['romance', 'love', 'heart', 'passion']):
        return "Romance"
    elif any(word in text for word in ['philosophy', 'ethics', 'moral', 'wisdom']):
        return "Philosophy"
    elif any(word in text for word in ['biography', 'life of', 'autobiography', 'memoir']):
        return "Biography"
    elif any(word in text for word in ['history', 'war', 'revolution', 'empire']):
        return "History"
    elif any(word in text for word in ['children', 'fairy', 'tales for']):
        return "Children's Literature"
    elif any(word in text for word in ['essay', 'essays', 'reflections']):
        return "Essays"
    else:
        return "Fiction"

# Additional books to reach 300+
ADDITIONAL_BOOKS = [
    {"title": "The Brothers Karamazov", "author": "Fyodor Dostoevsky", "gutenberg_id": 28054},
    {"title": "Anna Karenina", "author": "Leo Tolstoy", "gutenberg_id": 1399},
    {"title": "The Idiot", "author": "Fyodor Dostoevsky", "gutenberg_id": 2638},
    {"title": "Dead Souls", "author": "Nikolai Gogol", "gutenberg_id": 1081},
    {"title": "Fathers and Sons", "author": "Ivan Turgenev", "gutenberg_id": 30723},
    {"title": "The Overcoat", "author": "Nikolai Gogol", "gutenberg_id": 36238},
    {"title": "Eugene Onegin", "author": "Alexander Pushkin", "gutenberg_id": 23997},
    {"title": "A Hero of Our Time", "author": "Mikhail Lermontov", "gutenberg_id": 6937},
    {"title": "The Queen of Spades", "author": "Alexander Pushkin", "gutenberg_id": 23058},
    {"title": "Oblomov", "author": "Ivan Goncharov", "gutenberg_id": 6702},
    {"title": "Uncle Tom's Cabin", "author": "Harriet Beecher Stowe", "gutenberg_id": 203},
    {"title": "The Scarlet Letter", "author": "Nathaniel Hawthorne", "gutenberg_id": 25344},
    {"title": "The House of the Seven Gables", "author": "Nathaniel Hawthorne", "gutenberg_id": 77},
    {"title": "The Marble Faun", "author": "Nathaniel Hawthorne", "gutenberg_id": 2181},
    {"title": "The Blithedale Romance", "author": "Nathaniel Hawthorne", "gutenberg_id": 2081},
    {"title": "Walden", "author": "Henry David Thoreau", "gutenberg_id": 205},
    {"title": "Civil Disobedience", "author": "Henry David Thoreau", "gutenberg_id": 71},
    {"title": "The American", "author": "Henry James", "gutenberg_id": 177},
    {"title": "The Europeans", "author": "Henry James", "gutenberg_id": 179},
    {"title": "Washington Square", "author": "Henry James", "gutenberg_id": 176},
    {"title": "Daisy Miller", "author": "Henry James", "gutenberg_id": 208},
    {"title": "The Aspern Papers", "author": "Henry James", "gutenberg_id": 211},
    {"title": "The Beast in the Jungle", "author": "Henry James", "gutenberg_id": 1093},
    {"title": "The Ambassadors", "author": "Henry James", "gutenberg_id": 430},
    {"title": "The Wings of the Dove", "author": "Henry James", "gutenberg_id": 171},
    {"title": "What Maisie Knew", "author": "Henry James", "gutenberg_id": 7118},
    {"title": "The Awakening", "author": "Kate Chopin", "gutenberg_id": 160},
    {"title": "Maggie: A Girl of the Streets", "author": "Stephen Crane", "gutenberg_id": 447},
    {"title": "The Red Badge of Courage", "author": "Stephen Crane", "gutenberg_id": 73},
    {"title": "McTeague", "author": "Frank Norris", "gutenberg_id": 165},
    {"title": "Sister Carrie", "author": "Theodore Dreiser", "gutenberg_id": 233},
    {"title": "The House of Mirth", "author": "Edith Wharton", "gutenberg_id": 284},
    {"title": "Ethan Frome", "author": "Edith Wharton", "gutenberg_id": 4517},
    {"title": "Summer", "author": "Edith Wharton", "gutenberg_id": 6646},
    {"title": "The Custom of the Country", "author": "Edith Wharton", "gutenberg_id": 8472},
    {"title": "The Age of Innocence", "author": "Edith Wharton", "gutenberg_id": 541},
    {"title": "My Ántonia", "author": "Willa Cather", "gutenberg_id": 242},
    {"title": "O Pioneers!", "author": "Willa Cather", "gutenberg_id": 24},
    {"title": "The Song of the Lark", "author": "Willa Cather", "gutenberg_id": 44},
    {"title": "Death Comes for the Archbishop", "author": "Willa Cather", "gutenberg_id": 833},
]

async def fetch_gutenberg_text(gutenberg_id: int) -> str:
    """Fetch book text from Project Gutenberg"""
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
                    # Convert to simple HTML
                    paragraphs = text.split('\n\n')
                    html_content = ""
                    for p in paragraphs:
                        p = p.strip()
                        if p:
                            # Check if it's a chapter heading
                            if re.match(r'^(CHAPTER|Chapter|BOOK|Book|PART|Part|ACT|Act|SCENE|Scene)', p):
                                html_content += f"<h2>{p}</h2>\n"
                            else:
                                html_content += f"<p>{p}</p>\n"
                    return html_content
            except Exception as e:
                print(f"Error fetching from {url}: {e}")
                continue
    
    return ""

async def get_gutenberg_cover(gutenberg_id: int) -> str:
    """Try to get cover image from Project Gutenberg"""
    cover_urls = [
        f"https://www.gutenberg.org/cache/epub/{gutenberg_id}/pg{gutenberg_id}.cover.medium.jpg",
        f"https://www.gutenberg.org/cache/epub/{gutenberg_id}/pg{gutenberg_id}.cover.small.jpg",
    ]
    
    async with httpx.AsyncClient(timeout=30) as client:
        for url in cover_urls:
            try:
                response = await client.head(url)
                if response.status_code == 200:
                    return url
            except:
                continue
    
    return ""

async def check_book_exists(title: str) -> bool:
    """Check if a book already exists in the database"""
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/books",
            headers=get_supabase_headers(),
            params={"title": f"eq.{title}", "select": "id"}
        )
        if response.status_code == 200:
            return len(response.json()) > 0
    return False

async def seed_single_book(book_info: dict) -> dict:
    """Seed a single book to the database"""
    print(f"Processing: {book_info['title']} by {book_info['author']}")
    
    # Check if already exists
    if await check_book_exists(book_info['title']):
        print(f"  - Already exists, skipping")
        return None
    
    # Fetch content
    content = await fetch_gutenberg_text(book_info['gutenberg_id'])
    if not content:
        print(f"  - Could not fetch content, skipping")
        return None
    
    # Get cover
    cover = await get_gutenberg_cover(book_info['gutenberg_id'])
    
    # Categorize
    category = categorize_book(book_info['title'], book_info['author'])
    
    # Create description
    description = f"A classic work by {book_info['author']}. This public domain text is sourced from Project Gutenberg."
    
    book_data = {
        "title": book_info['title'],
        "author": book_info['author'],
        "content_body": content[:500000],  # Limit content size
        "category": category,
        "cover_image": cover,
        "is_featured": book_info.get('is_featured', False),
        "read_count": 0,
        "description": description,
        "source_url": f"https://www.gutenberg.org/ebooks/{book_info['gutenberg_id']}"
    }
    
    # Insert into Supabase
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/books",
            headers=get_supabase_headers(),
            json=book_data
        )
        
        if response.status_code in [200, 201]:
            print(f"  - Successfully added: {book_info['title']}")
            return response.json()[0] if response.json() else book_data
        else:
            print(f"  - Failed to add: {response.text}")
            return None

async def main():
    print("Starting additional book seeding process...")
    print(f"Will attempt to seed {len(ADDITIONAL_BOOKS)} more books")
    
    success_count = 0
    for book in ADDITIONAL_BOOKS:
        result = await seed_single_book(book)
        if result:
            success_count += 1
        await asyncio.sleep(0.5)  # Rate limit
    
    print(f"\nSeeding complete! Added {success_count} new books.")

if __name__ == "__main__":
    asyncio.run(main())
