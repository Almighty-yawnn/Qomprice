# app/db.py

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData
from dotenv import load_dotenv, find_dotenv
import os
from typing import AsyncGenerator # <<< 1. IMPORT AsyncGenerator

# Try to find the .env file first and print its path
dotenv_path = find_dotenv()
if dotenv_path:
    print(f"DEBUG: Found .env file at: {dotenv_path}")
else:
    print("DEBUG: No .env file found by find_dotenv()")

# Load the environment variables
load_dotenv(dotenv_path=dotenv_path, verbose=True, override=True)
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DEBUG: DATABASE_URL with override is -> '{DATABASE_URL}'")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL not found in environment variables")

print(f"DEBUG: DATABASE_URL is -> '{DATABASE_URL}'")

metadata = MetaData()
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass


async def get_session() -> AsyncGenerator[AsyncSession, None]: # <<< 2. UPDATE THE TYPE HINT
    """Dependency to get a new database session for each request."""
    async with AsyncSessionLocal() as session:
        yield session