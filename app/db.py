# app/db.py
import os
import ssl
from typing import AsyncGenerator

from dotenv import load_dotenv, find_dotenv
from sqlalchemy.engine.url import make_url, URL
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData

# ── .env (for local dev) — DO NOT override Render env vars ─────────────────────
dotenv_path = find_dotenv()
if dotenv_path:
    print(f"DEBUG: Found .env file at: {dotenv_path}")
else:
    print("DEBUG: No .env file found by find_dotenv()")

load_dotenv(dotenv_path=dotenv_path, verbose=True, override=False)

# ── Build an asyncpg URL from whatever DATABASE_URL we get ─────────────────────
def _redact(url: str) -> str:
    try:
        u = make_url(url)
        redacted = URL.create(
            drivername=u.drivername,
            username=u.username or "",
            password="***" if u.password else None,
            host=u.host,
            port=u.port,
            database=u.database,
            query=u.query,
        )
        return str(redacted)
    except Exception:
        return url

def build_async_url() -> str:
    raw = os.getenv("DATABASE_URL")
    print(f"DEBUG: DATABASE_URL (raw) -> '{_redact(raw or '')}'")
    if not raw:
        raise RuntimeError("❌ DATABASE_URL is not set")

    u = make_url(raw)

    # Always use the async driver explicitly.
    driver = "postgresql+asyncpg"

    # Re-create URL cleanly (drop query params like sslmode, which asyncpg doesn't use)
    rebuilt = URL.create(
        drivername=driver,
        username=u.username,
        password=u.password,
        host=u.host,
        port=u.port or 5432,
        database=u.database,
        query={},  # <- drop sslmode and others; we'll pass SSL via connect_args
    )
    print(f"DEBUG: DATABASE_URL (async) -> '{_redact(str(rebuilt))}'")
    return str(rebuilt)

ASYNC_DATABASE_URL = build_async_url()

# ── SQLAlchemy async engine/session ─────────────────────────────────────────────
metadata = MetaData()

# Render Postgres requires SSL; asyncpg expects an SSLContext via connect_args.
# Create an SSL context that does NOT verify the server cert.
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args={"ssl": SSL_CTX},  # asyncpg expects an SSLContext object
)

engines = create_engine("postgresql://komprice_postgres_user:SW2lj9xZs85vrCIOWGLfn4MN7TBNglI6@dpg-d2ieqe0dl3ps73ccpeg0-a.oregon-postgres.render.com/komprice_postgres")
with engines.connect() as conn:
    result = conn.execute("SELECT 1")
    print(result.scalar())  # should print 1 if connected successfully

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency to provide a new async session per request."""
    async with AsyncSessionLocal() as session:
        yield session