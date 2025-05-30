# app/crud.py
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from .models import Product, Category

async def search_products(
    session: AsyncSession,
    query: str,
    category: str | None = None,
    limit: int = 20
):
    # 1️⃣ Initialize the SELECT and eager-load listings
    stmt = (
        select(Product)
        .options(selectinload(Product.listings))
    )

    # 2️⃣ Full-text search on title
    stmt = stmt.where(
        func.to_tsvector('english', Product.title)
            .match(query, postgresql_regconfig='english')
    )

    # 3️⃣ Optional category filter
    if category:
        stmt = (
            stmt
            .join(Category, Product.universal_category_id == Category.id)
            .where(Category.slug == category)
        )

    # 4️⃣ Limit & execute
    stmt = stmt.limit(limit)
    result = await session.execute(stmt)
    return result.unique().scalars().all()



async def list_categories(session: AsyncSession):
    res = await session.execute(select(Category.slug))
    return [row[0] for row in res.all()]





# from sqlalchemy import select
# from .models import Product
# from sqlalchemy.ext.asyncio import AsyncSession

# from .models import Category

# async def search_products(session: AsyncSession, query: str, limit: int = 20):
#     stmt = (
#         select(Product)
#         .where(Product.title.ilike(f"%{query}%"))
#         .limit(limit)
#     )
#     result = await session.execute(stmt)
#     return result.scalars().all()


