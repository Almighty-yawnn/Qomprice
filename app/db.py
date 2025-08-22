# app/db.py

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData
from dotenv import load_dotenv, find_dotenv
import os, ssl
from sqlalchemy.engine.url import make_url, URL
from typing import AsyncGenerator # <<< 1. IMPORT AsyncGenerator

# Try to find the .env file first and print its path
dotenv_path = find_dotenv()
if dotenv_path:
    print(f"DEBUG: Found .env file at: {dotenv_path}")
else:
    print("DEBUG: No .env file found by find_dotenv()")

# Load the environment variables
load_dotenv(dotenv_path=dotenv_path, verbose=True, override=False)
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DEBUG: DATABASE_URL with override is -> '{DATABASE_URL}'")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL not found in environment variables")

print(f"DEBUG: DATABASE_URL is -> '{DATABASE_URL}'")


metadata = MetaData()
# engine = create_async_engine(DATABASE_URL, echo=False)
def normalize_db_url():
    raw = os.getenv("DATABASE_URL")
    if not raw:
        raise RuntimeError("DATABASE_URL is not set")

    url = make_url(raw)

    # force async driver
    drv = url.drivername.lower().replace("postgres", "postgresql")
    if not drv.endswith("+asyncpg"):
        drv = "postgresql+asyncpg"

    # rebuild without any unsupported query params (e.g., sslmode)
    return str(URL.create(
        drivername=drv,
        username=url.username,
        password=url.password,
        host=url.host,
        port=url.port or 5432,
        database=url.database,
        query={},  # drop sslmode or other params
    ))

ASYNC_DATABASE_URL = normalize_db_url()

# Render’s Postgres requires SSL — asyncpg expects ssl=...
SSL_CONTEXT = ssl.create_default_context()

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args={"ssl": SSL_CONTEXT},   # <-- correct for asyncpg
)
# AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass


async def get_session() -> AsyncGenerator[AsyncSession, None]: # <<< 2. UPDATE THE TYPE HINT
    """Dependency to get a new database session for each request."""
    async with AsyncSessionLocal() as session:
        yield session
