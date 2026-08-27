import os
import sys
import urllib.parse
from urllib.parse import urlparse

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.config import settings
from app.db.base import Base
from app.db.session import engine
from app.seed import seed_database

def initialize_database():
    db_url = settings.get_database_url()
    print(f"Connecting to database: {db_url.split('@')[-1] if '@' in db_url else db_url}")

    if db_url.startswith("postgresql"):
        try:
            import psycopg2
            parsed = urlparse(db_url)
            user = parsed.username or "postgres"
            # Unquote password for psycopg2 direct connection
            password = urllib.parse.unquote_plus(parsed.password) if parsed.password else ""
            host = parsed.hostname or "localhost"
            port = parsed.port or 5432
            target_db = parsed.path.lstrip("/") or "tastecraft_db"

            print(f"Checking PostgreSQL server on {host}:{port}...")
            # Connect to default maintenance database to ensure target DB exists
            conn = psycopg2.connect(
                dbname="postgres",
                user=user,
                password=password,
                host=host,
                port=port
            )
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (target_db,))
            exists = cur.fetchone()
            if not exists:
                cur.execute(f'CREATE DATABASE "{target_db}";')
                print(f"Successfully created PostgreSQL database: '{target_db}'")
            else:
                print(f"PostgreSQL database '{target_db}' already exists.")
            cur.close()
            conn.close()
        except Exception as e:
            print(f"Note on PostgreSQL database check: {e}")

    print("Dropping existing tables to migrate schema cleanly...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables in PostgreSQL schema...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

    print("Seeding sample restaurants, menus, dishes, and multi-criteria reviews...")
    seed_database()
    print("\nPostgreSQL Database initialization complete!")

if __name__ == "__main__":
    initialize_database()
