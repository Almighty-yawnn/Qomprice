# app/db.py
import os
import ssl
from typing import AsyncGenerator

from dotenv import load_dotenv, find_dotenv
from sqlalchemy.engine.url import make_url, URL
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData

# Load local .env for dev only; don't override Render/Railway env
dotenv_path = find_dotenv()
load_dotenv(dotenv_path=dotenv_path, verbose=False, override=False)

def _redact(url: str) -> str:
    try:
        u = make_url(url)
        return str(
            URL.create(
                drivername=u.drivername,
                username=u.username or "",
                password="***" if u.password else None,
                host=u.host,
                port=u.port,
                database=u.database,
                query=u.query,
            )
        )
    except Exception:
        return url

def build_async_url() -> str:
    raw = os.getenv("DATABASE_URL")
    print(f"DEBUG: DATABASE_URL (raw) -> '{_redact(raw or '')}'")
    if not raw:
        raise RuntimeError("❌ DATABASE_URL is not set")

    u = make_url(raw)

    # Always use async driver
    rebuilt = URL.create(
        drivername="postgresql+asyncpg",
        username=u.username,
        password=u.password,
        host=u.host,
        port=u.port or 5432,
        database=u.database,
        query={},  # drop sslmode etc.; we pass SSL via connect_args
    )
    print(f"DEBUG: DATABASE_URL (async) -> '{_redact(str(rebuilt))}'")
    return str(rebuilt)

ASYNC_DATABASE_URL = build_async_url()

metadata = MetaData()

# SSL for Render/Railway (works with asyncpg)
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args={"ssl": SSL_CTX},
)

AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
