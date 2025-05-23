import asyncio
from sqlalchemy import select
from app.db import engine, AsyncSessionLocal
from app.models import Category

CATEGORIES = [
    ("phones-tablets", None),
    ("electronics", None),
    ("groceries", None),
    ("fashion", None),
    ("beauty", None),
    ("home-appliances", None),
    ("baby-kids", None),
    ("sports-outdoor", None),
    ("kids-toys", None),
]

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Category.metadata.create_all)
    async with AsyncSessionLocal() as session:
        for slug, parent in CATEGORIES:
            exists = await session.scalar(
                select(Category).where(Category.slug == slug)
            )
            if not exists:
                session.add(Category(slug=slug, parent_id=parent))
        await session.commit()
    print("✔ Categories bootstrapped.")

if __name__ == "__main__":
    asyncio.run(main())

















# """
# Bootstrap Komprice reference data.

# Run inside the api container:

#     docker compose exec api python scripts/bootstrap_categories.py
# """

# import asyncio
# from sqlalchemy import select
# from app.db import engine, AsyncSessionLocal
# #from .app.db import engine, AsyncSessionLocal
# from app.models import Category

# # ---- master list of universal categories -------------------------------
# CATEGORIES = [
#     # slug              parent_id  (None = top-level)
#     ("phones-tablets",   None),
#     ("electronics",      None),
#     ("groceries",        None),
#     ("fashion",          None),
#     ("beauty",           None),
#     ("home-appliances",  None),
#     ("baby-kids",        None),
#     ("sports-outdoor",   None),
#     ("kids-toys",        None),
# ]
# # ------------------------------------------------------------------------


# async def main() -> None:
#     # 1) ensure tables exist
#     async with engine.begin() as conn:
#         await conn.run_sync(Category.metadata.create_all)

#     # 2) insert categories idempotently
#     async with AsyncSessionLocal() as session:
#         for slug, parent in CATEGORIES:
#             exists = await session.scalar(select(Category).where(Category.slug == slug))
#             if not exists:
#                 session.add(Category(slug=slug, parent_id=parent))
#         await session.commit()

#     print("✔  Categories bootstrapped.")


# if __name__ == "__main__":
#     asyncio.run(main())
