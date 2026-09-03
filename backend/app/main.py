import sys
import os

# Ensure backend root is always on sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from app.config import settings
from app.api.v1.api import api_router
from app.db.session import engine
from app.db.base import Base

def auto_migrate_schema():
    """Ensure all required tables, columns, and foreign keys exist across SQLite, PostgreSQL, and Supabase."""
    try:
        # Create any tables that don't exist yet
        Base.metadata.create_all(bind=engine)
        inspector = inspect(engine)
        table_names = inspector.get_table_names()

        with engine.begin() as conn:
            # Users table migrations
            if "users" in table_names:
                user_cols = [c["name"] for c in inspector.get_columns("users")]
                if "gender" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN gender VARCHAR(20) DEFAULT NULL;"))
                if "country" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN country VARCHAR(100) DEFAULT 'India';"))
                if "country_code" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN country_code VARCHAR(10) DEFAULT '+91';"))
                if "phone_number" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) DEFAULT NULL;"))
                if "role" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';"))
                if "accepts_promotions" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN accepts_promotions BOOLEAN DEFAULT TRUE NOT NULL;"))

            # Restaurants table migrations
            if "restaurants" in table_names:
                rest_cols = [c["name"] for c in inspector.get_columns("restaurants")]
                if "owner_id" not in rest_cols:
                    conn.execute(text("ALTER TABLE restaurants ADD COLUMN owner_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL;"))

            # Menu items table migrations
            if "menu_items" in table_names:
                menu_cols = [c["name"] for c in inspector.get_columns("menu_items")]
                if "user_id" not in menu_cols:
                    conn.execute(text("ALTER TABLE menu_items ADD COLUMN user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL;"))

            # Review comments table migrations
            if "review_comments" in table_names:
                comment_cols = [c["name"] for c in inspector.get_columns("review_comments")]
                if "is_owner_response" not in comment_cols:
                    conn.execute(text("ALTER TABLE review_comments ADD COLUMN is_owner_response BOOLEAN DEFAULT FALSE;"))

        print("[OK] Database schema verified and synchronized successfully.")
    except Exception as e:
        print(f"Warning during schema auto-migration: {e}")

# Run schema auto-migration on server startup
auto_migrate_schema()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Robust CORS configuration supporting all local, cloud & production origins
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",  # Allows any origin regex for local dev, preview, and production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Request Validation Error Handler (Handles invalid emails, payload errors gracefully)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        raw_msg = err.get("msg", "Invalid input value")
        # Clean up pydantic prefix
        clean_msg = raw_msg.replace("Value error, ", "").replace("value is not a valid email address: ", "")
        if "email" in field.lower() or "email" in raw_msg.lower():
            error_messages.append(f"Invalid email address provided. Please check the email format (e.g. user@example.com).")
        elif field:
            error_messages.append(f"{field}: {clean_msg}")
        else:
            error_messages.append(clean_msg)

    friendly_detail = ". ".join(error_messages) if error_messages else "Invalid input provided. Please verify the form fields."
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": friendly_detail, "errors": exc.errors()},
    )

# Starlette HTTP Exception Handler
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail_msg = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": detail_msg},
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "online"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True, app_dir=backend_dir)
