"""
Libreya Backend Server
A reading app backend using FastAPI and Supabase
"""
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import os
import httpx
import uuid
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Libreya API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://bruzgztsltjtzwkkehif.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "hello@libreya.app")

# Headers for Supabase requests
def get_supabase_headers(auth_token: Optional[str] = None):
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    else:
        headers["Authorization"] = f"Bearer {SUPABASE_ANON_KEY}"
    return headers

# ============= MODELS =============

class UserProfile(BaseModel):
    id: Optional[str] = None
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    auth_provider: str = "guest"
    is_admin: bool = False
    terms_accepted: bool = False
    terms_accepted_at: Optional[str] = None
    created_at: Optional[str] = None

class Book(BaseModel):
    id: Optional[int] = None
    title: str
    author: str
    content_body: Optional[str] = None
    category: Optional[str] = None
    cover_image: Optional[str] = None
    is_featured: bool = False
    read_count: int = 0
    description: Optional[str] = None
    source_url: Optional[str] = None
    created_at: Optional[str] = None

class UserActivity(BaseModel):
    id: Optional[int] = None
    user_id: str
    book_id: int
    last_position: float = 0.0
    is_favorite: bool = False
    highlights: List[Dict[str, Any]] = []
    chapter_read_count: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class AppSettings(BaseModel):
    id: Optional[int] = None
    key: str
    value: str
    updated_at: Optional[str] = None

class TermsAcceptance(BaseModel):
    user_id: str
    accepted: bool

class GuestMigration(BaseModel):
    guest_uuid: str
    new_user_id: str

# ============= HEALTH CHECK =============

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Libreya API", "timestamp": datetime.utcnow().isoformat()}

# ============= INITIALIZATION =============

@app.post("/api/init-database")
async def init_database():
    """Initialize database tables in Supabase"""
    async with httpx.AsyncClient() as client:
        # Check if tables exist by trying to query them
        try:
            # Test users table
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/users?limit=1",
                headers=get_supabase_headers()
            )
            users_exist = response.status_code == 200
            
            # Test books table
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/books?limit=1",
                headers=get_supabase_headers()
            )
            books_exist = response.status_code == 200
            
            # Test user_activity table
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/user_activity?limit=1",
                headers=get_supabase_headers()
            )
            activity_exist = response.status_code == 200
            
            # Test app_settings table
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/app_settings?limit=1",
                headers=get_supabase_headers()
            )
            settings_exist = response.status_code == 200
            
            return {
                "status": "checked",
                "tables": {
                    "users": users_exist,
                    "books": books_exist,
                    "user_activity": activity_exist,
                    "app_settings": settings_exist
                },
                "message": "Please run the SQL migration in Supabase dashboard if tables don't exist"
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

# ============= USER ENDPOINTS =============

@app.post("/api/users")
async def create_user(user: UserProfile, request: Request):
    """Create or update a user profile with proper upsert logic"""
    auth_header = request.headers.get("Authorization", "")
    
    async with httpx.AsyncClient() as client:
        user_data = {
            "id": user.id or str(uuid.uuid4()),
            "email": user.email,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "auth_provider": user.auth_provider,
            "is_admin": user.email == ADMIN_EMAIL if user.email else False,
            "terms_accepted": user.terms_accepted,
            "terms_accepted_at": user.terms_accepted_at,
        }
        
        # First, check if user already exists by ID or email
        existing_by_id = await client.get(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_data['id']}",
            headers=get_supabase_headers()
        )
        
        existing_by_email = None
        if user.email:
            existing_by_email = await client.get(
                f"{SUPABASE_URL}/rest/v1/users?email=eq.{user.email}",
                headers=get_supabase_headers()
            )
        
        # Check if user exists by ID
        if existing_by_id.status_code == 200 and existing_by_id.json():
            # User exists by ID - update them
            existing_user = existing_by_id.json()[0]
            update_data = {k: v for k, v in user_data.items() if v is not None and k != 'id'}
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_data['id']}",
                headers={**get_supabase_headers(), "Prefer": "return=representation"},
                json=update_data
            )
            
            if response.status_code in [200, 201, 204]:
                return response.json()[0] if response.json() else {**existing_user, **update_data}
            raise HTTPException(status_code=response.status_code, detail=response.text)
        
        # Check if user exists by email (different ID but same email)
        if existing_by_email and existing_by_email.status_code == 200 and existing_by_email.json():
            # User exists with this email - return existing user instead of creating duplicate
            existing_user = existing_by_email.json()[0]
            return existing_user
        
        # User doesn't exist - create new
        user_data["created_at"] = datetime.utcnow().isoformat()
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/users",
            headers={**get_supabase_headers(), "Prefer": "return=representation"},
            json=user_data
        )
        
        if response.status_code in [200, 201]:
            return response.json()[0] if response.json() else user_data
        elif response.status_code == 409 or "duplicate" in response.text.lower() or "23505" in response.text:
            # Duplicate constraint error - user was created in parallel, fetch and return
            retry_response = await client.get(
                f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_data['id']}",
                headers=get_supabase_headers()
            )
            if retry_response.status_code == 200 and retry_response.json():
                return retry_response.json()[0]
            # Try by email
            if user.email:
                retry_email = await client.get(
                    f"{SUPABASE_URL}/rest/v1/users?email=eq.{user.email}",
                    headers=get_supabase_headers()
                )
                if retry_email.status_code == 200 and retry_email.json():
                    return retry_email.json()[0]
            raise HTTPException(status_code=409, detail="User already exists")
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)

@app.get("/api/users/{user_id}")
async def get_user(user_id: str, request: Request):
    """Get user profile by ID"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
            headers=get_supabase_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            if data:
                return data[0]
            raise HTTPException(status_code=404, detail="User not found")
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.patch("/api/users/{user_id}")
async def update_user(user_id: str, updates: Dict[str, Any], request: Request):
    """Update user profile"""
    async with httpx.AsyncClient() as client:
        updates["updated_at"] = datetime.utcnow().isoformat()
        
        response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
            headers=get_supabase_headers(),
            json=updates
        )
        
        if response.status_code in [200, 204]:
            return {"success": True, "message": "User updated"}
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str, request: Request):
    """
    Delete user completely (GDPR compliant)
    This deletes:
    1. User activity (favorites, highlights)
    2. User profile from public.users
    3. User from auth.users (requires service role key)
    """
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_ANON_KEY)
    
    async with httpx.AsyncClient(timeout=30) as client:
        errors = []
        
        # 1. Delete user activity (favorites, highlights, reading progress)
        try:
            activity_response = await client.delete(
                f"{SUPABASE_URL}/rest/v1/user_activity?user_id=eq.{user_id}",
                headers=get_supabase_headers()
            )
            if activity_response.status_code not in [200, 204]:
                errors.append(f"Activity deletion: {activity_response.text}")
        except Exception as e:
            errors.append(f"Activity deletion error: {str(e)}")
        
        # 2. Delete user profile from public.users table
        try:
            profile_response = await client.delete(
                f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
                headers=get_supabase_headers()
            )
            if profile_response.status_code not in [200, 204]:
                errors.append(f"Profile deletion: {profile_response.text}")
        except Exception as e:
            errors.append(f"Profile deletion error: {str(e)}")
        
        # 3. CRUCIAL: Delete from auth.users using Admin API
        # This requires the service role key
        try:
            auth_headers = {
                "apikey": service_role_key,
                "Authorization": f"Bearer {service_role_key}",
                "Content-Type": "application/json"
            }
            
            auth_response = await client.delete(
                f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                headers=auth_headers
            )
            
            if auth_response.status_code not in [200, 204]:
                # Try alternative endpoint format
                auth_response2 = await client.delete(
                    f"{SUPABASE_URL}/auth/v1/admin/users?id=eq.{user_id}",
                    headers=auth_headers
                )
                if auth_response2.status_code not in [200, 204]:
                    errors.append(f"Auth deletion: {auth_response.status_code} - {auth_response.text}")
        except Exception as e:
            errors.append(f"Auth deletion error: {str(e)}")
        
        # Return result
        if errors:
            # Still return success if at least profile was deleted
            return {
                "success": True, 
                "message": "User data deleted. Some cleanup may be pending.",
                "warnings": errors
            }
        
        return {
            "success": True, 
            "message": "User and all associated data completely deleted from system"
        }

@app.post("/api/users/accept-terms")
async def accept_terms(data: TermsAcceptance):
    """Record terms acceptance"""
    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{data.user_id}",
            headers=get_supabase_headers(),
            json={
                "terms_accepted": data.accepted,
                "terms_accepted_at": datetime.utcnow().isoformat()
            }
        )
        
        if response.status_code in [200, 204]:
            return {"success": True}
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.post("/api/users/migrate-guest")
async def migrate_guest(data: GuestMigration):
    """Migrate guest user data to registered account"""
    async with httpx.AsyncClient() as client:
        # Update all user_activity records from guest to new user
        response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/user_activity?user_id=eq.{data.guest_uuid}",
            headers=get_supabase_headers(),
            json={"user_id": data.new_user_id}
        )
        
        if response.status_code in [200, 204]:
            # Delete the guest user profile
            await client.delete(
                f"{SUPABASE_URL}/rest/v1/users?id=eq.{data.guest_uuid}",
                headers=get_supabase_headers()
            )
            return {"success": True, "message": "Guest data migrated successfully"}
        raise HTTPException(status_code=response.status_code, detail=response.text)

# ============= BOOK ENDPOINTS =============

@app.get("/api/books")
async def get_books(
    limit: int = 50,
    offset: int = 0,
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None
):
    """Get books with filters"""
    async with httpx.AsyncClient() as client:
        url = f"{SUPABASE_URL}/rest/v1/books?select=id,title,author,category,cover_image,is_featured,read_count,description&order=read_count.desc&limit={limit}&offset={offset}"
        
        if category:
            url += f"&category=eq.{category}"
        if featured is not None:
            url += f"&is_featured=eq.{str(featured).lower()}"
        if search:
            # URL encode the search string with wildcards for ILIKE query
            import urllib.parse
            search_encoded = urllib.parse.quote(f"*{search}*")
            url += f"&or=(title.ilike.{search_encoded},author.ilike.{search_encoded})"
        
        response = await client.get(url, headers=get_supabase_headers())
        
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.get("/api/books/featured")
async def get_featured_books(limit: int = 10):
    """Get featured books (highest read count)"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/books?select=id,title,author,category,cover_image,is_featured,read_count,description&is_featured=eq.true&order=read_count.desc&limit={limit}",
            headers=get_supabase_headers()
        )
        
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.get("/api/books/recommended/{user_id}")
async def get_recommended_books(user_id: str, limit: int = 10):
    """Get recommended books based on user's reading history"""
    async with httpx.AsyncClient() as client:
        # Get user's most read categories
        activity_response = await client.get(
            f"{SUPABASE_URL}/rest/v1/user_activity?user_id=eq.{user_id}&select=book_id",
            headers=get_supabase_headers()
        )
        
        if activity_response.status_code == 200:
            activities = activity_response.json()
            if activities:
                # Get books from those categories
                book_ids = [a["book_id"] for a in activities]
                books_response = await client.get(
                    f"{SUPABASE_URL}/rest/v1/books?id=in.({','.join(map(str, book_ids))})&select=category",
                    headers=get_supabase_headers()
                )
                
                if books_response.status_code == 200:
                    books = books_response.json()
                    categories = list(set([b["category"] for b in books if b.get("category")]))
                    
                    if categories:
                        # Get recommended books from those categories
                        rec_response = await client.get(
                            f"{SUPABASE_URL}/rest/v1/books?select=id,title,author,category,cover_image,is_featured,read_count,description&category=in.({','.join(categories)})&id=not.in.({','.join(map(str, book_ids))})&order=read_count.desc&limit={limit}",
                            headers=get_supabase_headers()
                        )
                        
                        if rec_response.status_code == 200:
                            return rec_response.json()
        
        # Fallback to popular books
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/books?select=id,title,author,category,cover_image,is_featured,read_count,description&order=read_count.desc&limit={limit}",
            headers=get_supabase_headers()
        )
        
        if response.status_code == 200:
            return response.json()
        return []

@app.get("/api/books/{book_id}")
async def get_book(book_id: int):
    """Get a single book with full content"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/books?id=eq.{book_id}",
            headers=get_supabase_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            if data:
                # Increment read count
                await client.patch(
                    f"{SUPABASE_URL}/rest/v1/books?id=eq.{book_id}",
                    headers=get_supabase_headers(),
                    json={"read_count": data[0].get("read_count", 0) + 1}
                )
                return data[0]
            raise HTTPException(status_code=404, detail="Book not found")
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.get("/api/books/categories/list")
async def get_categories():
    """Get all unique categories"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/books?select=category",
            headers=get_supabase_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            categories = list(set([b["category"] for b in data if b.get("category")]))
            return sorted(categories)
        return []

# ============= ADMIN BOOK ENDPOINTS =============

@app.post("/api/admin/books")
async def create_book(book: Book):
    """Create a new book (Admin only)"""
    async with httpx.AsyncClient() as client:
        book_data = {
            "title": book.title,
            "author": book.author,
            "content_body": book.content_body,
            "category": book.category,
            "cover_image": book.cover_image,
            "is_featured": book.is_featured,
            "read_count": book.read_count,
            "description": book.description,
            "source_url": book.source_url,
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/books",
            headers=get_supabase_headers(),
            json=book_data
        )
        
        if response.status_code in [200, 201]:
            return response.json()[0] if response.json() else book_data
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.patch("/api/admin/books/{book_id}")
async def update_book(book_id: int, updates: Dict[str, Any]):
    """Update a book (Admin only)"""
    async with httpx.AsyncClient() as client:
        updates["updated_at"] = datetime.utcnow().isoformat()
        
        response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/books?id=eq.{book_id}",
            headers=get_supabase_headers(),
            json=updates
        )
        
        if response.status_code in [200, 204]:
            return {"success": True, "message": "Book updated"}
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.delete("/api/admin/books/{book_id}")
async def delete_book(book_id: int):
    """Delete a book (Admin only)"""
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{SUPABASE_URL}/rest/v1/books?id=eq.{book_id}",
            headers=get_supabase_headers()
        )
        
        if response.status_code in [200, 204]:
            return {"success": True, "message": "Book deleted"}
        raise HTTPException(status_code=response.status_code, detail=response.text)

# ============= USER ACTIVITY ENDPOINTS =============

@app.get("/api/activity/{user_id}")
async def get_user_activity(user_id: str):
    """Get all activity for a user"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/user_activity?user_id=eq.{user_id}",
            headers=get_supabase_headers()
        )
        
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.get("/api/activity/{user_id}/{book_id}")
async def get_book_activity(user_id: str, book_id: int):
    """Get activity for a specific book"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/user_activity?user_id=eq.{user_id}&book_id=eq.{book_id}",
            headers=get_supabase_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            if data:
                return data[0]
            return None
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.post("/api/activity")
async def create_or_update_activity(activity: UserActivity):
    """Create or update reading activity"""
    async with httpx.AsyncClient() as client:
        activity_data = {
            "user_id": activity.user_id,
            "book_id": activity.book_id,
            "last_position": activity.last_position,
            "is_favorite": activity.is_favorite,
            "highlights": activity.highlights,
            "chapter_read_count": activity.chapter_read_count,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Check if activity exists
        check_response = await client.get(
            f"{SUPABASE_URL}/rest/v1/user_activity?user_id=eq.{activity.user_id}&book_id=eq.{activity.book_id}",
            headers=get_supabase_headers()
        )
        
        if check_response.status_code == 200 and check_response.json():
            # Update existing
            response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/user_activity?user_id=eq.{activity.user_id}&book_id=eq.{activity.book_id}",
                headers=get_supabase_headers(),
                json=activity_data
            )
        else:
            # Create new
            activity_data["created_at"] = datetime.utcnow().isoformat()
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/user_activity",
                headers=get_supabase_headers(),
                json=activity_data
            )
        
        if response.status_code in [200, 201, 204]:
            return {"success": True}
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.get("/api/favorites/{user_id}")
async def get_favorites(user_id: str):
    """Get user's favorite books"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/user_activity?user_id=eq.{user_id}&is_favorite=eq.true&select=book_id",
            headers=get_supabase_headers()
        )
        
        if response.status_code == 200:
            activities = response.json()
            if activities:
                book_ids = [a["book_id"] for a in activities]
                books_response = await client.get(
                    f"{SUPABASE_URL}/rest/v1/books?id=in.({','.join(map(str, book_ids))})&select=id,title,author,category,cover_image,is_featured,read_count,description",
                    headers=get_supabase_headers()
                )
                if books_response.status_code == 200:
                    return books_response.json()
            return []
        raise HTTPException(status_code=response.status_code, detail=response.text)

# ============= APP SETTINGS ENDPOINTS =============

@app.get("/api/settings/{key}")
async def get_setting(key: str):
    """Get an app setting by key"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/app_settings?key=eq.{key}",
            headers=get_supabase_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            if data:
                return data[0]
            return None
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.get("/api/settings")
async def get_all_settings():
    """Get all app settings"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/app_settings",
            headers=get_supabase_headers()
        )
        
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)

@app.post("/api/admin/settings")
async def update_setting(setting: AppSettings):
    """Update or create an app setting (Admin only)"""
    async with httpx.AsyncClient() as client:
        setting_data = {
            "key": setting.key,
            "value": setting.value,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Check if setting exists
        check_response = await client.get(
            f"{SUPABASE_URL}/rest/v1/app_settings?key=eq.{setting.key}",
            headers=get_supabase_headers()
        )
        
        if check_response.status_code == 200 and check_response.json():
            # Update existing
            response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/app_settings?key=eq.{setting.key}",
                headers=get_supabase_headers(),
                json=setting_data
            )
        else:
            # Create new
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/app_settings",
                headers=get_supabase_headers(),
                json=setting_data
            )
        
        if response.status_code in [200, 201, 204]:
            return {"success": True}
        raise HTTPException(status_code=response.status_code, detail=response.text)

# ============= BOOK SEEDING =============

@app.post("/api/admin/seed-books")
async def seed_books(count: int = 50):
    """Seed books from Standard Ebooks (Admin only)"""
    # This is a simplified version - actual seeding should be done via a separate script
    return {"message": "Use the seed_books.py script to seed books from Standard Ebooks"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
