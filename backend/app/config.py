import os
import urllib.parse
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TasteCraft API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "dev-secret-key-tastecraft-restaurant-reviews-super-secure-jwt-key-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Explicit connection parameters (safe with special characters in passwords)
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_HOST: Optional[str] = None
    POSTGRES_PORT: Optional[int] = None
    POSTGRES_DB: Optional[str] = None

    # Raw database URL
    DATABASE_URL: Optional[str] = None
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    def get_database_url(self) -> str:
        # If explicit parts are provided, format and quote password safely
        if self.POSTGRES_USER and self.POSTGRES_PASSWORD is not None:
            user = self.POSTGRES_USER
            pwd = urllib.parse.quote_plus(self.POSTGRES_PASSWORD)
            host = self.POSTGRES_HOST or "localhost"
            port = self.POSTGRES_PORT or 5432
            db = self.POSTGRES_DB or "tastecraft_db"
            return f"postgresql://{user}:{pwd}@{host}:{port}/{db}"
        
        if self.DATABASE_URL:
            raw = self.DATABASE_URL.strip()
            # If multiple @ in URL (e.g. postgresql://postgres:p%40ssword@localhost:5432/tastecraft_db)
            if raw.startswith("postgresql://") or raw.startswith("postgres://"):
                prefix, remainder = raw.split("://", 1)
                if remainder.count("@") > 1:
                    last_at = remainder.rfind("@")
                    user_pass_part = remainder[:last_at]
                    host_db_part = remainder[last_at + 1:]
                    if ":" in user_pass_part:
                        u, p = user_pass_part.split(":", 1)
                        p_quoted = urllib.parse.quote_plus(p)
                        return f"postgresql://{u}:{p_quoted}@{host_db_part}"
            return raw
            
        return "postgresql://postgres:postgres@localhost:5432/tastecraft_db"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
