"""
Book Seeding Script for Libreya
Fetches books from Standard Ebooks and Project Gutenberg
"""
import httpx
import asyncio
import re
import os
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import json
import base64

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://bruzgztsltjtzwkkehif.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# Standard Ebooks catalog
STANDARD_EBOOKS_API = "https://standardebooks.org/ebooks"

# Categories mapping
CATEGORIES = [
    "Fiction", "Non-Fiction", "Poetry", "Drama", "Philosophy",
    "Science Fiction", "Adventure", "Romance", "Mystery", "Horror",
    "Biography", "History", "Children's Literature", "Classics", "Essays"
]

def get_supabase_headers():
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def clean_gutenberg_text(html_content: str) -> str:
    """Remove Project Gutenberg headers and footers, keep only book content"""
    soup = BeautifulSoup(html_content, 'lxml')
    
    # Remove script and style elements
    for element in soup(['script', 'style', 'meta', 'link']):
        element.decompose()
    
    text = str(soup)
    
    # Remove Gutenberg header
    patterns_to_remove = [
        r'\*\*\* START OF (THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*',
        r'\*\*\* END OF (THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*',
        r'The Project Gutenberg EBook of.*?(?=Chapter|CHAPTER|CONTENTS|PREFACE|INTRODUCTION)',
        r'This eBook is for the use of anyone anywhere.*?(?=Chapter|CHAPTER|CONTENTS|PREFACE|INTRODUCTION)',
        r'End of (the )?Project Gutenberg.*',
        r'^\s*Project Gutenberg.*?(?=\n\n)',
    ]
    
    for pattern in patterns_to_remove:
        text = re.sub(pattern, '', text, flags=re.DOTALL | re.IGNORECASE)
    
    return text.strip()

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

# Popular public domain books with their Gutenberg IDs
CLASSIC_BOOKS = [
    {"title": "Pride and Prejudice", "author": "Jane Austen", "gutenberg_id": 1342},
    {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "gutenberg_id": 64317},
    {"title": "Moby Dick", "author": "Herman Melville", "gutenberg_id": 2701},
    {"title": "Frankenstein", "author": "Mary Shelley", "gutenberg_id": 84},
    {"title": "Dracula", "author": "Bram Stoker", "gutenberg_id": 345},
    {"title": "Alice's Adventures in Wonderland", "author": "Lewis Carroll", "gutenberg_id": 11},
    {"title": "The Adventures of Sherlock Holmes", "author": "Arthur Conan Doyle", "gutenberg_id": 1661},
    {"title": "The Picture of Dorian Gray", "author": "Oscar Wilde", "gutenberg_id": 174},
    {"title": "A Tale of Two Cities", "author": "Charles Dickens", "gutenberg_id": 98},
    {"title": "Great Expectations", "author": "Charles Dickens", "gutenberg_id": 1400},
    {"title": "Oliver Twist", "author": "Charles Dickens", "gutenberg_id": 730},
    {"title": "David Copperfield", "author": "Charles Dickens", "gutenberg_id": 766},
    {"title": "Wuthering Heights", "author": "Emily Brontë", "gutenberg_id": 768},
    {"title": "Jane Eyre", "author": "Charlotte Brontë", "gutenberg_id": 1260},
    {"title": "The Count of Monte Cristo", "author": "Alexandre Dumas", "gutenberg_id": 1184},
    {"title": "The Three Musketeers", "author": "Alexandre Dumas", "gutenberg_id": 1257},
    {"title": "War and Peace", "author": "Leo Tolstoy", "gutenberg_id": 2600},
    {"title": "Anna Karenina", "author": "Leo Tolstoy", "gutenberg_id": 1399},
    {"title": "Crime and Punishment", "author": "Fyodor Dostoyevsky", "gutenberg_id": 2554},
    {"title": "The Brothers Karamazov", "author": "Fyodor Dostoyevsky", "gutenberg_id": 28054},
    {"title": "Don Quixote", "author": "Miguel de Cervantes", "gutenberg_id": 996},
    {"title": "The Odyssey", "author": "Homer", "gutenberg_id": 1727},
    {"title": "The Iliad", "author": "Homer", "gutenberg_id": 6130},
    {"title": "Les Misérables", "author": "Victor Hugo", "gutenberg_id": 135},
    {"title": "The Hunchback of Notre-Dame", "author": "Victor Hugo", "gutenberg_id": 2610},
    {"title": "Treasure Island", "author": "Robert Louis Stevenson", "gutenberg_id": 120},
    {"title": "The Strange Case of Dr. Jekyll and Mr. Hyde", "author": "Robert Louis Stevenson", "gutenberg_id": 43},
    {"title": "The Time Machine", "author": "H.G. Wells", "gutenberg_id": 35},
    {"title": "The War of the Worlds", "author": "H.G. Wells", "gutenberg_id": 36},
    {"title": "The Invisible Man", "author": "H.G. Wells", "gutenberg_id": 5230},
    {"title": "The Island of Doctor Moreau", "author": "H.G. Wells", "gutenberg_id": 159},
    {"title": "Twenty Thousand Leagues Under the Sea", "author": "Jules Verne", "gutenberg_id": 164},
    {"title": "Around the World in Eighty Days", "author": "Jules Verne", "gutenberg_id": 103},
    {"title": "Journey to the Center of the Earth", "author": "Jules Verne", "gutenberg_id": 18857},
    {"title": "The Scarlet Letter", "author": "Nathaniel Hawthorne", "gutenberg_id": 25344},
    {"title": "The House of the Seven Gables", "author": "Nathaniel Hawthorne", "gutenberg_id": 77},
    {"title": "The Call of the Wild", "author": "Jack London", "gutenberg_id": 215},
    {"title": "White Fang", "author": "Jack London", "gutenberg_id": 910},
    {"title": "The Adventures of Tom Sawyer", "author": "Mark Twain", "gutenberg_id": 74},
    {"title": "Adventures of Huckleberry Finn", "author": "Mark Twain", "gutenberg_id": 76},
    {"title": "A Connecticut Yankee in King Arthur's Court", "author": "Mark Twain", "gutenberg_id": 86},
    {"title": "The Prince and the Pauper", "author": "Mark Twain", "gutenberg_id": 1837},
    {"title": "Little Women", "author": "Louisa May Alcott", "gutenberg_id": 514},
    {"title": "The Wonderful Wizard of Oz", "author": "L. Frank Baum", "gutenberg_id": 55},
    {"title": "Peter Pan", "author": "J.M. Barrie", "gutenberg_id": 16},
    {"title": "Anne of Green Gables", "author": "L.M. Montgomery", "gutenberg_id": 45},
    {"title": "The Secret Garden", "author": "Frances Hodgson Burnett", "gutenberg_id": 113},
    {"title": "A Little Princess", "author": "Frances Hodgson Burnett", "gutenberg_id": 146},
    {"title": "Robinson Crusoe", "author": "Daniel Defoe", "gutenberg_id": 521},
    {"title": "Gulliver's Travels", "author": "Jonathan Swift", "gutenberg_id": 829},
    {"title": "The Jungle Book", "author": "Rudyard Kipling", "gutenberg_id": 236},
    {"title": "Kim", "author": "Rudyard Kipling", "gutenberg_id": 2226},
    {"title": "Heart of Darkness", "author": "Joseph Conrad", "gutenberg_id": 219},
    {"title": "Lord Jim", "author": "Joseph Conrad", "gutenberg_id": 5658},
    {"title": "The Secret Agent", "author": "Joseph Conrad", "gutenberg_id": 974},
    {"title": "Sense and Sensibility", "author": "Jane Austen", "gutenberg_id": 161},
    {"title": "Emma", "author": "Jane Austen", "gutenberg_id": 158},
    {"title": "Mansfield Park", "author": "Jane Austen", "gutenberg_id": 141},
    {"title": "Northanger Abbey", "author": "Jane Austen", "gutenberg_id": 121},
    {"title": "Persuasion", "author": "Jane Austen", "gutenberg_id": 105},
    {"title": "The Metamorphosis", "author": "Franz Kafka", "gutenberg_id": 5200},
    {"title": "The Trial", "author": "Franz Kafka", "gutenberg_id": 7849},
    {"title": "The Republic", "author": "Plato", "gutenberg_id": 1497},
    {"title": "Meditations", "author": "Marcus Aurelius", "gutenberg_id": 2680},
    {"title": "The Art of War", "author": "Sun Tzu", "gutenberg_id": 132},
    {"title": "Thus Spoke Zarathustra", "author": "Friedrich Nietzsche", "gutenberg_id": 1998},
    {"title": "Beyond Good and Evil", "author": "Friedrich Nietzsche", "gutenberg_id": 4363},
    {"title": "Walden", "author": "Henry David Thoreau", "gutenberg_id": 205},
    {"title": "Civil Disobedience", "author": "Henry David Thoreau", "gutenberg_id": 71},
    {"title": "Common Sense", "author": "Thomas Paine", "gutenberg_id": 147},
    {"title": "The Communist Manifesto", "author": "Karl Marx", "gutenberg_id": 61},
    {"title": "The Prince", "author": "Niccolò Machiavelli", "gutenberg_id": 1232},
    {"title": "Leviathan", "author": "Thomas Hobbes", "gutenberg_id": 3207},
    {"title": "Candide", "author": "Voltaire", "gutenberg_id": 19942},
    {"title": "The Divine Comedy", "author": "Dante Alighieri", "gutenberg_id": 8800},
    {"title": "Paradise Lost", "author": "John Milton", "gutenberg_id": 26},
    {"title": "Hamlet", "author": "William Shakespeare", "gutenberg_id": 1524},
    {"title": "Macbeth", "author": "William Shakespeare", "gutenberg_id": 1533},
    {"title": "Romeo and Juliet", "author": "William Shakespeare", "gutenberg_id": 1513},
    {"title": "Othello", "author": "William Shakespeare", "gutenberg_id": 1531},
    {"title": "King Lear", "author": "William Shakespeare", "gutenberg_id": 1532},
    {"title": "A Midsummer Night's Dream", "author": "William Shakespeare", "gutenberg_id": 1514},
    {"title": "The Tempest", "author": "William Shakespeare", "gutenberg_id": 2235},
    {"title": "Julius Caesar", "author": "William Shakespeare", "gutenberg_id": 1522},
    {"title": "The Merchant of Venice", "author": "William Shakespeare", "gutenberg_id": 2243},
    {"title": "Much Ado About Nothing", "author": "William Shakespeare", "gutenberg_id": 1519},
    {"title": "Leaves of Grass", "author": "Walt Whitman", "gutenberg_id": 1322},
    {"title": "The Raven", "author": "Edgar Allan Poe", "gutenberg_id": 17192},
    {"title": "The Complete Tales and Poems of Edgar Allan Poe", "author": "Edgar Allan Poe", "gutenberg_id": 2147},
    {"title": "The Canterbury Tales", "author": "Geoffrey Chaucer", "gutenberg_id": 2383},
    {"title": "Beowulf", "author": "Unknown", "gutenberg_id": 16328},
    {"title": "Aesop's Fables", "author": "Aesop", "gutenberg_id": 28},
    {"title": "Grimm's Fairy Tales", "author": "Brothers Grimm", "gutenberg_id": 2591},
    {"title": "Andersen's Fairy Tales", "author": "Hans Christian Andersen", "gutenberg_id": 27200},
    {"title": "The Arabian Nights", "author": "Anonymous", "gutenberg_id": 128},
    {"title": "A Christmas Carol", "author": "Charles Dickens", "gutenberg_id": 46},
    {"title": "The Origin of Species", "author": "Charles Darwin", "gutenberg_id": 2009},
    {"title": "The Descent of Man", "author": "Charles Darwin", "gutenberg_id": 2300},
    {"title": "Autobiography of Benjamin Franklin", "author": "Benjamin Franklin", "gutenberg_id": 20203},
    {"title": "The Souls of Black Folk", "author": "W.E.B. Du Bois", "gutenberg_id": 408},
    {"title": "Narrative of the Life of Frederick Douglass", "author": "Frederick Douglass", "gutenberg_id": 23},
    {"title": "Uncle Tom's Cabin", "author": "Harriet Beecher Stowe", "gutenberg_id": 203},
    {"title": "The Age of Innocence", "author": "Edith Wharton", "gutenberg_id": 541},
    {"title": "Ethan Frome", "author": "Edith Wharton", "gutenberg_id": 4517},
    {"title": "The House of Mirth", "author": "Edith Wharton", "gutenberg_id": 284},
    {"title": "My Ántonia", "author": "Willa Cather", "gutenberg_id": 242},
    {"title": "O Pioneers!", "author": "Willa Cather", "gutenberg_id": 24},
    {"title": "The Song of the Lark", "author": "Willa Cather", "gutenberg_id": 44},
    {"title": "Main Street", "author": "Sinclair Lewis", "gutenberg_id": 543},
    {"title": "Babbitt", "author": "Sinclair Lewis", "gutenberg_id": 1156},
    {"title": "Sister Carrie", "author": "Theodore Dreiser", "gutenberg_id": 233},
    {"title": "Dubliners", "author": "James Joyce", "gutenberg_id": 2814},
    {"title": "A Portrait of the Artist as a Young Man", "author": "James Joyce", "gutenberg_id": 4217},
    {"title": "Sons and Lovers", "author": "D.H. Lawrence", "gutenberg_id": 5465},
    {"title": "Women in Love", "author": "D.H. Lawrence", "gutenberg_id": 4240},
    {"title": "The Rainbow", "author": "D.H. Lawrence", "gutenberg_id": 28948},
    {"title": "Tess of the d'Urbervilles", "author": "Thomas Hardy", "gutenberg_id": 110},
    {"title": "Far from the Madding Crowd", "author": "Thomas Hardy", "gutenberg_id": 107},
    {"title": "Jude the Obscure", "author": "Thomas Hardy", "gutenberg_id": 153},
    {"title": "The Mayor of Casterbridge", "author": "Thomas Hardy", "gutenberg_id": 143},
    {"title": "The Return of the Native", "author": "Thomas Hardy", "gutenberg_id": 122},
    {"title": "Middlemarch", "author": "George Eliot", "gutenberg_id": 145},
    {"title": "Silas Marner", "author": "George Eliot", "gutenberg_id": 550},
    {"title": "The Mill on the Floss", "author": "George Eliot", "gutenberg_id": 6688},
    {"title": "Adam Bede", "author": "George Eliot", "gutenberg_id": 507},
    {"title": "North and South", "author": "Elizabeth Gaskell", "gutenberg_id": 4276},
    {"title": "Cranford", "author": "Elizabeth Gaskell", "gutenberg_id": 394},
    {"title": "Wives and Daughters", "author": "Elizabeth Gaskell", "gutenberg_id": 4274},
    {"title": "The Woman in White", "author": "Wilkie Collins", "gutenberg_id": 583},
    {"title": "The Moonstone", "author": "Wilkie Collins", "gutenberg_id": 155},
    {"title": "The Tenant of Wildfell Hall", "author": "Anne Brontë", "gutenberg_id": 969},
    {"title": "Agnes Grey", "author": "Anne Brontë", "gutenberg_id": 767},
    {"title": "Villette", "author": "Charlotte Brontë", "gutenberg_id": 9182},
    {"title": "Shirley", "author": "Charlotte Brontë", "gutenberg_id": 30486},
    {"title": "Vanity Fair", "author": "William Makepeace Thackeray", "gutenberg_id": 599},
    {"title": "The History of Henry Esmond", "author": "William Makepeace Thackeray", "gutenberg_id": 2519},
    {"title": "Bleak House", "author": "Charles Dickens", "gutenberg_id": 1023},
    {"title": "Our Mutual Friend", "author": "Charles Dickens", "gutenberg_id": 883},
    {"title": "The Old Curiosity Shop", "author": "Charles Dickens", "gutenberg_id": 700},
    {"title": "Nicholas Nickleby", "author": "Charles Dickens", "gutenberg_id": 967},
    {"title": "Martin Chuzzlewit", "author": "Charles Dickens", "gutenberg_id": 968},
    {"title": "Dombey and Son", "author": "Charles Dickens", "gutenberg_id": 821},
    {"title": "Little Dorrit", "author": "Charles Dickens", "gutenberg_id": 963},
    {"title": "The Pickwick Papers", "author": "Charles Dickens", "gutenberg_id": 580},
    {"title": "Barnaby Rudge", "author": "Charles Dickens", "gutenberg_id": 917},
    {"title": "Hard Times", "author": "Charles Dickens", "gutenberg_id": 786},
    {"title": "The Hound of the Baskervilles", "author": "Arthur Conan Doyle", "gutenberg_id": 2852},
    {"title": "A Study in Scarlet", "author": "Arthur Conan Doyle", "gutenberg_id": 244},
    {"title": "The Sign of the Four", "author": "Arthur Conan Doyle", "gutenberg_id": 2097},
    {"title": "The Valley of Fear", "author": "Arthur Conan Doyle", "gutenberg_id": 3289},
    {"title": "The Memoirs of Sherlock Holmes", "author": "Arthur Conan Doyle", "gutenberg_id": 834},
    {"title": "The Return of Sherlock Holmes", "author": "Arthur Conan Doyle", "gutenberg_id": 108},
    {"title": "His Last Bow", "author": "Arthur Conan Doyle", "gutenberg_id": 2350},
    {"title": "The Lost World", "author": "Arthur Conan Doyle", "gutenberg_id": 139},
    {"title": "The Importance of Being Earnest", "author": "Oscar Wilde", "gutenberg_id": 844},
    {"title": "Lady Windermere's Fan", "author": "Oscar Wilde", "gutenberg_id": 790},
    {"title": "An Ideal Husband", "author": "Oscar Wilde", "gutenberg_id": 885},
    {"title": "A Woman of No Importance", "author": "Oscar Wilde", "gutenberg_id": 854},
    {"title": "De Profundis", "author": "Oscar Wilde", "gutenberg_id": 921},
    {"title": "The Canterville Ghost", "author": "Oscar Wilde", "gutenberg_id": 14522},
    {"title": "The Happy Prince and Other Tales", "author": "Oscar Wilde", "gutenberg_id": 902},
    {"title": "Through the Looking-Glass", "author": "Lewis Carroll", "gutenberg_id": 12},
    {"title": "The Hunting of the Snark", "author": "Lewis Carroll", "gutenberg_id": 13},
    {"title": "Sylvie and Bruno", "author": "Lewis Carroll", "gutenberg_id": 620},
    {"title": "Phantastes", "author": "George MacDonald", "gutenberg_id": 325},
    {"title": "The Princess and the Goblin", "author": "George MacDonald", "gutenberg_id": 708},
    {"title": "At the Back of the North Wind", "author": "George MacDonald", "gutenberg_id": 2440},
    {"title": "The Light Princess", "author": "George MacDonald", "gutenberg_id": 709},
    {"title": "Lilith", "author": "George MacDonald", "gutenberg_id": 1640},
    {"title": "Kidnapped", "author": "Robert Louis Stevenson", "gutenberg_id": 421},
    {"title": "Catriona", "author": "Robert Louis Stevenson", "gutenberg_id": 125},
    {"title": "The Master of Ballantrae", "author": "Robert Louis Stevenson", "gutenberg_id": 436},
    {"title": "The Black Arrow", "author": "Robert Louis Stevenson", "gutenberg_id": 848},
    {"title": "The Sea-Wolf", "author": "Jack London", "gutenberg_id": 1074},
    {"title": "The Iron Heel", "author": "Jack London", "gutenberg_id": 1164},
    {"title": "Martin Eden", "author": "Jack London", "gutenberg_id": 1056},
    {"title": "Burning Daylight", "author": "Jack London", "gutenberg_id": 1160},
    {"title": "The People of the Abyss", "author": "Jack London", "gutenberg_id": 1688},
    {"title": "The Road", "author": "Jack London", "gutenberg_id": 14658},
    {"title": "John Barleycorn", "author": "Jack London", "gutenberg_id": 318},
    {"title": "The Scarlet Pimpernel", "author": "Baroness Orczy", "gutenberg_id": 60},
    {"title": "I Will Repay", "author": "Baroness Orczy", "gutenberg_id": 3857},
    {"title": "The Prisoner of Zenda", "author": "Anthony Hope", "gutenberg_id": 95},
    {"title": "Rupert of Hentzau", "author": "Anthony Hope", "gutenberg_id": 6391},
    {"title": "The Thirty-Nine Steps", "author": "John Buchan", "gutenberg_id": 558},
    {"title": "Greenmantle", "author": "John Buchan", "gutenberg_id": 559},
    {"title": "Mr. Standfast", "author": "John Buchan", "gutenberg_id": 560},
    {"title": "The Riddle of the Sands", "author": "Erskine Childers", "gutenberg_id": 2360},
    {"title": "She", "author": "H. Rider Haggard", "gutenberg_id": 3155},
    {"title": "King Solomon's Mines", "author": "H. Rider Haggard", "gutenberg_id": 2166},
    {"title": "Allan Quatermain", "author": "H. Rider Haggard", "gutenberg_id": 711},
    {"title": "The Food of the Gods", "author": "H.G. Wells", "gutenberg_id": 11696},
    {"title": "The First Men in the Moon", "author": "H.G. Wells", "gutenberg_id": 1013},
    {"title": "In the Days of the Comet", "author": "H.G. Wells", "gutenberg_id": 6339},
    {"title": "The Sleeper Awakes", "author": "H.G. Wells", "gutenberg_id": 12163},
    {"title": "A Modern Utopia", "author": "H.G. Wells", "gutenberg_id": 6424},
    {"title": "The World Set Free", "author": "H.G. Wells", "gutenberg_id": 1059},
    {"title": "Kipps", "author": "H.G. Wells", "gutenberg_id": 5658},
    {"title": "The History of Mr. Polly", "author": "H.G. Wells", "gutenberg_id": 7308},
    {"title": "Tono-Bungay", "author": "H.G. Wells", "gutenberg_id": 5679},
    {"title": "From the Earth to the Moon", "author": "Jules Verne", "gutenberg_id": 83},
    {"title": "The Mysterious Island", "author": "Jules Verne", "gutenberg_id": 8993},
    {"title": "Michael Strogoff", "author": "Jules Verne", "gutenberg_id": 1842},
    {"title": "Five Weeks in a Balloon", "author": "Jules Verne", "gutenberg_id": 3526},
    {"title": "In Search of the Castaways", "author": "Jules Verne", "gutenberg_id": 2083},
    {"title": "Master of the World", "author": "Jules Verne", "gutenberg_id": 3808},
    {"title": "Robur the Conqueror", "author": "Jules Verne", "gutenberg_id": 3711},
    {"title": "The Phantom of the Opera", "author": "Gaston Leroux", "gutenberg_id": 175},
    {"title": "The Mystery of the Yellow Room", "author": "Gaston Leroux", "gutenberg_id": 3802},
    {"title": "A Princess of Mars", "author": "Edgar Rice Burroughs", "gutenberg_id": 62},
    {"title": "The Gods of Mars", "author": "Edgar Rice Burroughs", "gutenberg_id": 64},
    {"title": "Warlord of Mars", "author": "Edgar Rice Burroughs", "gutenberg_id": 68},
    {"title": "Tarzan of the Apes", "author": "Edgar Rice Burroughs", "gutenberg_id": 78},
    {"title": "The Return of Tarzan", "author": "Edgar Rice Burroughs", "gutenberg_id": 81},
    {"title": "The Beasts of Tarzan", "author": "Edgar Rice Burroughs", "gutenberg_id": 85},
    {"title": "At the Earth's Core", "author": "Edgar Rice Burroughs", "gutenberg_id": 545},
    {"title": "Pellucidar", "author": "Edgar Rice Burroughs", "gutenberg_id": 605},
    {"title": "The Land That Time Forgot", "author": "Edgar Rice Burroughs", "gutenberg_id": 551},
    {"title": "Herland", "author": "Charlotte Perkins Gilman", "gutenberg_id": 32},
    {"title": "The Yellow Wallpaper", "author": "Charlotte Perkins Gilman", "gutenberg_id": 1952},
    {"title": "Looking Backward", "author": "Edward Bellamy", "gutenberg_id": 624},
    {"title": "News from Nowhere", "author": "William Morris", "gutenberg_id": 3261},
    {"title": "Erewhon", "author": "Samuel Butler", "gutenberg_id": 1906},
    {"title": "The Way of All Flesh", "author": "Samuel Butler", "gutenberg_id": 2084},
    {"title": "New Grub Street", "author": "George Gissing", "gutenberg_id": 1709},
    {"title": "The Odd Women", "author": "George Gissing", "gutenberg_id": 5765},
    {"title": "The Private Papers of Henry Ryecroft", "author": "George Gissing", "gutenberg_id": 1456},
    {"title": "The Water-Babies", "author": "Charles Kingsley", "gutenberg_id": 1018},
    {"title": "Westward Ho!", "author": "Charles Kingsley", "gutenberg_id": 769},
    {"title": "Hypatia", "author": "Charles Kingsley", "gutenberg_id": 1827},
    {"title": "Alton Locke", "author": "Charles Kingsley", "gutenberg_id": 2166},
    {"title": "The Wind in the Willows", "author": "Kenneth Grahame", "gutenberg_id": 289},
    {"title": "The Golden Age", "author": "Kenneth Grahame", "gutenberg_id": 13047},
    {"title": "Dream Days", "author": "Kenneth Grahame", "gutenberg_id": 13534},
    {"title": "The Railway Children", "author": "E. Nesbit", "gutenberg_id": 1874},
    {"title": "Five Children and It", "author": "E. Nesbit", "gutenberg_id": 778},
    {"title": "The Phoenix and the Carpet", "author": "E. Nesbit", "gutenberg_id": 836},
    {"title": "The Story of the Amulet", "author": "E. Nesbit", "gutenberg_id": 837},
    {"title": "The Enchanted Castle", "author": "E. Nesbit", "gutenberg_id": 3536},
    {"title": "The House of Arden", "author": "E. Nesbit", "gutenberg_id": 4378},
    {"title": "The Story of the Treasure Seekers", "author": "E. Nesbit", "gutenberg_id": 770},
    {"title": "The Wouldbegoods", "author": "E. Nesbit", "gutenberg_id": 794},
    {"title": "Black Beauty", "author": "Anna Sewell", "gutenberg_id": 271},
    {"title": "Heidi", "author": "Johanna Spyri", "gutenberg_id": 1448},
    {"title": "The Swiss Family Robinson", "author": "Johann David Wyss", "gutenberg_id": 3836},
    {"title": "The Last of the Mohicans", "author": "James Fenimore Cooper", "gutenberg_id": 940},
    {"title": "The Deerslayer", "author": "James Fenimore Cooper", "gutenberg_id": 3285},
    {"title": "The Pathfinder", "author": "James Fenimore Cooper", "gutenberg_id": 1603},
    {"title": "The Pioneers", "author": "James Fenimore Cooper", "gutenberg_id": 2275},
    {"title": "The Prairie", "author": "James Fenimore Cooper", "gutenberg_id": 6450},
    {"title": "The Spy", "author": "James Fenimore Cooper", "gutenberg_id": 9845},
    {"title": "The Pilot", "author": "James Fenimore Cooper", "gutenberg_id": 2755},
    {"title": "Ivanhoe", "author": "Sir Walter Scott", "gutenberg_id": 82},
    {"title": "Rob Roy", "author": "Sir Walter Scott", "gutenberg_id": 7025},
    {"title": "Waverley", "author": "Sir Walter Scott", "gutenberg_id": 5998},
    {"title": "The Heart of Midlothian", "author": "Sir Walter Scott", "gutenberg_id": 6944},
    {"title": "The Bride of Lammermoor", "author": "Sir Walter Scott", "gutenberg_id": 471},
    {"title": "Kenilworth", "author": "Sir Walter Scott", "gutenberg_id": 1609},
    {"title": "Quentin Durward", "author": "Sir Walter Scott", "gutenberg_id": 7864},
    {"title": "The Antiquary", "author": "Sir Walter Scott", "gutenberg_id": 7005},
    {"title": "The Talisman", "author": "Sir Walter Scott", "gutenberg_id": 1377},
    {"title": "The Fortunes of Nigel", "author": "Sir Walter Scott", "gutenberg_id": 6949},
    {"title": "Redgauntlet", "author": "Sir Walter Scott", "gutenberg_id": 7024},
    {"title": "Old Mortality", "author": "Sir Walter Scott", "gutenberg_id": 6943},
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
                    # Clean the text
                    cleaned = clean_gutenberg_text(text)
                    # Strip "[Illustration: ...]" / "[Illustration]" transcriber notes.
                    # Non-greedy + DOTALL so a blank line inside the brackets doesn't
                    # leave a dangling "[Illustration:" fragment after paragraph splitting.
                    # Some editions render ornamental chapter-heading art as an illustration
                    # whose caption contains the chapter title itself - rescue that line
                    # instead of dropping the whole block.
                    def _replace_illustration(match):
                        inner = match.group(1)
                        heading_match = re.search(
                            r'^\s*(CHAPTER|BOOK|PART|ACT|SCENE|PREFACE|INTRODUCTION|FOREWORD|LETTER|VOLUME)\b.*$', inner,
                            flags=re.IGNORECASE | re.MULTILINE
                        )
                        return f"\n\n{heading_match.group(0).strip()}\n\n" if heading_match else ""

                    cleaned = re.sub(
                        r'\[\s*illustration\s*:?(.*?)\]', _replace_illustration, cleaned,
                        flags=re.IGNORECASE | re.DOTALL
                    )
                    # Real headings are short titles. Some paragraphs merely OPEN with
                    # a heading keyword before continuing into ordinary prose in the
                    # same paragraph (e.g. Moby-Dick's Cetology chapter: "BOOK I.
                    # (Folio), CHAPTER III. (Fin-Back).--Under this head I reckon a
                    # monster which..."). Capping the length keeps those from being
                    # mistaken for a real section break. Exempt from the cap:
                    # paragraphs with no lowercase letters at all - some editions
                    # (e.g. Dickens') print the chapter number and its full
                    # descriptive title as one all-caps paragraph, which can run well
                    # past the cap despite being a genuine heading, not narrative prose.
                    MAX_HEADING_LENGTH = 100

                    def _is_all_caps_text(p):
                        return not re.search(r'[a-z]', p)

                    # Numbered/lettered markers conventionally continue into a
                    # subtitle on the same heading (e.g. Dickens' "CHAPTER I.\nTREATS
                    # OF THE PLACE WHERE OLIVER TWIST WAS BORN...", squished across
                    # lines with no blank line between the marker and its title) - so
                    # these are allowed to span multiple lines as one heading.
                    NUMBERED_HEADING_PATTERN = r'^(CHAPTER|Chapter|BOOK|Book|PART|Part|ACT|Act|SCENE|Scene|LETTER|Letter|VOLUME|Volume)'
                    # Unlike numbered markers, these always name a complete section
                    # by themselves - they never legitimately continue into a second
                    # line as a subtitle. Without this distinction, a squished TOC
                    # pair like "INTRODUCTION.\nPOPE'S PREFACE TO THE ILIAD OF HOMER"
                    # (two independent entries with no blank line between them) would
                    # get read as one heading swallowing the second entry.
                    STANDALONE_HEADING_PATTERN = r'^(PREFACE|Preface|INTRODUCTION|Introduction|FOREWORD|Foreword)'
                    # Capped at 3 digits - no real book has thousands of chapters, and
                    # a longer run of digits is more likely a year (e.g. a "1899"
                    # publication date on the title page) than a chapter number.
                    BARE_NUMBER_PATTERN = r'^(?:[IVXLCDM]{1,8}|\d{1,3})\.?$'

                    def _is_heading_candidate(p):
                        if re.match(STANDALONE_HEADING_PATTERN, p):
                            return '\n' not in p and len(p) <= MAX_HEADING_LENGTH
                        if re.match(NUMBERED_HEADING_PATTERN, p):
                            return len(p) <= MAX_HEADING_LENGTH or _is_all_caps_text(p)
                        return bool(re.match(BARE_NUMBER_PATTERN, p, re.IGNORECASE))

                    # A squished TOC block rarely has every single line matching a
                    # heading keyword - some entries are section dividers or appendix
                    # labels that don't fit the list (e.g. "THE ODYSSEY" or
                    # "FOOTNOTES:" mixed in among a run of "BOOK I."..."BOOK XXIV.").
                    # Real prose essentially never has most of its physical
                    # line-wraps independently start with a heading keyword, so a
                    # high match ratio is still a safe signal without requiring
                    # every line to match.
                    SQUISHED_TOC_MATCH_RATIO = 0.7

                    # Some editions squish an entire "CONTENTS" listing into one
                    # paragraph with no blank lines between entries (e.g.
                    # "CHAPTER I. Title\nCHAPTER II. Title\n..."). That block still
                    # starts with a heading keyword, so it would otherwise pass the
                    # single-candidate check below. Detect it directly: 2+ internal
                    # lines where most lines independently look like a heading is
                    # never real prose.
                    def _is_squished_toc_block(p):
                        lines = [line.strip() for line in p.split('\n') if line.strip()]
                        if len(lines) < 2:
                            return False
                        match_count = sum(1 for line in lines if _is_heading_candidate(line))
                        return (match_count / len(lines)) >= SQUISHED_TOC_MATCH_RATIO

                    # A real chapter break can legitimately be a short stack of nested
                    # headings (e.g. "BOOK ONE: 1805" immediately followed by "CHAPTER
                    # I", with no body text between them; Les Misérables goes a level
                    # deeper still, with "VOLUME I" -> "BOOK FIRST" -> "CHAPTER I"
                    # stacked with nothing but blank lines between them). A real
                    # table-of-contents listing (when its entries are separate
                    # blank-line-delimited paragraphs rather than one squished block)
                    # is a much longer run.
                    MAX_HEADING_RUN_LENGTH = 3

                    def _heading_run_length(paragraphs, index):
                        # The run only extends into a neighbor that shares the same
                        # indentation status - this stops a long, indented TOC listing
                        # from "leaking" into an adjacent real (non-indented) heading
                        # with nothing but blank lines between them.
                        indented = paragraphs[index]['indented']
                        start = index
                        while (
                            start > 0
                            and paragraphs[start - 1]['indented'] == indented
                            and _is_heading_candidate(paragraphs[start - 1]['text'])
                        ):
                            start -= 1
                        end = index
                        while (
                            end < len(paragraphs) - 1
                            and paragraphs[end + 1]['indented'] == indented
                            and _is_heading_candidate(paragraphs[end + 1]['text'])
                        ):
                            end += 1
                        return end - start + 1

                    # Escape HTML special characters so stray "<"/"&"/">" in the source
                    # text (OCR artifacts, "Tom & Jerry", etc.) can't break the markup.
                    def _escape_html(text):
                        return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

                    # Gutenberg's plain-text convention for italics: "_emphasized text_".
                    # Applied after escaping so the inserted <em> tags aren't re-escaped.
                    def _convert_italics(p):
                        return re.sub(r'_([^_\n]+)_', r'<em>\1</em>', p)

                    # Convert to simple HTML. Track whether each paragraph's raw
                    # (pre-strip) text started with a space/tab - used by
                    # _heading_run_length() to keep a long indented TOC listing from
                    # leaking into an adjacent real (non-indented) heading.
                    paragraphs = [
                        {'text': raw.strip(), 'indented': bool(re.match(r'^[ \t]', raw))}
                        for raw in cleaned.split('\n\n') if raw.strip()
                    ]
                    html_content = ""
                    for i, info in enumerate(paragraphs):
                        p = info['text']
                        # Three outcomes, not two: a real heading (<h2>), an ordinary
                        # paragraph (<p>, unchanged), or a recognized table-of-contents
                        # entry - dropped entirely rather than kept as a <p>. A demoted
                        # TOC entry has no reading value on its own, and keeping it as
                        # inert text is actively wrong when the TOC sits between two
                        # real headings rather than before all of them: the reader's
                        # chapter-splitter groups everything between consecutive <h2>s
                        # into one chapter, so a kept-but-demoted TOC block right after a
                        # real heading (e.g. a Preface followed by "Contents" before
                        # "Volume I") visibly leaks into that preceding chapter.
                        is_real_heading = False
                        is_toc_entry = False
                        if _is_squished_toc_block(p):
                            is_toc_entry = True
                        elif _is_heading_candidate(p):
                            # A genuine chapter break (or a short nested stack like
                            # BOOK+CHAPTER) is a short run of heading-candidates; a real
                            # table-of-contents listing (its entries as separate
                            # paragraphs rather than one squished block) is a much
                            # longer run.
                            if _heading_run_length(paragraphs, i) <= MAX_HEADING_RUN_LENGTH:
                                is_real_heading = True
                            else:
                                is_toc_entry = True
                        p = _convert_italics(_escape_html(p))

                        if is_real_heading:
                            html_content += f"<h2>{p}</h2>\n"
                        elif not is_toc_entry:
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
                    # Return the URL, we won't convert to base64 as it's royalty-free
                    return url
            except:
                continue
    
    return ""

async def seed_single_book(book_info: dict) -> dict:
    """Seed a single book to the database"""
    print(f"Processing: {book_info['title']} by {book_info['author']}")
    
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

async def seed_all_books(max_books: int = 300):
    """Seed all classic books to the database"""
    # Mark some books as featured
    featured_indices = [0, 1, 2, 3, 4, 5, 9, 14, 19, 24]  # First few popular ones
    
    for i, book in enumerate(CLASSIC_BOOKS[:max_books]):
        book['is_featured'] = i in featured_indices
        await seed_single_book(book)
        # Small delay to avoid rate limiting
        await asyncio.sleep(0.5)

async def main():
    print("Starting book seeding process...")
    print(f"Will seed {len(CLASSIC_BOOKS)} books")
    
    await seed_all_books(len(CLASSIC_BOOKS))
    
    print("\nSeeding complete!")

if __name__ == "__main__":
    asyncio.run(main())
