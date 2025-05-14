# create_tables.py
import asyncio
from app.db import engine, Base
# import your models so they get registered on Base.metadata
import app.models  # noqa: F401

async def main():
    # open a connection and run the create_all in sync
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ All tables created")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
