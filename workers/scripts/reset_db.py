# worker/scripts/reset_db.py
import asyncio
from sqlalchemy import text
from app.db import AsyncSessionLocal

async def main():
    async with AsyncSessionLocal() as session:
        # truncate vendor_listing first (FK to product)
        await session.execute(text("TRUNCATE TABLE vendor_listing RESTART IDENTITY;"))
        # then truncate product (and cascade to any dependents)
        await session.execute(text("TRUNCATE TABLE product RESTART IDENTITY CASCADE;"))
        await session.commit()
    print("✅ All products and listings have been deleted.")

if __name__ == "__main__":
    asyncio.run(main())








# import asyncio
# from app.db import engine
# from app.models import Base

# async def reset():
#     async with engine.begin() as conn:
#         print("❗ Dropping all tables...")
#         await conn.run_sync(Base.metadata.drop_all)
#         print("✅ Creating all tables...")
#         await conn.run_sync(Base.metadata.create_all)
#         print("🚀 Database schema reset successfully.")

# if __name__ == "__main__":
#     asyncio.run(reset())
