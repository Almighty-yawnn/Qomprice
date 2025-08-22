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
# # Render’s Postgres requires SSL — asyncpg expects ssl=...
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

# engine = create_async_engine(
#     ASYNC_DATABASE_URL,
#     pool_pre_ping=True,
#     pool_size=5,
#     max_overflow=10,
#     connect_args={"ssl": SSL_CONTEXT},   # <-- correct for asyncpg
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"ssl": SSL_CTX}, 
)
# engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass


async def get_session() -> AsyncGenerator[AsyncSession, None]: # <<< 2. UPDATE THE TYPE HINT
    """Dependency to get a new database session for each request."""
    async with AsyncSessionLocal() as session:
        yield session