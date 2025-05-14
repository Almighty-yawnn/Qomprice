from sqlalchemy import select
from .models import Product
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Category

async def search_products(session: AsyncSession, query: str, limit: int = 20):
    stmt = (
        select(Product)
        .where(Product.title.ilike(f"%{query}%"))
        .limit(limit)
    )
    result = await session.execute(stmt)
    return result.scalars().all()



async def list_categories(session: AsyncSession):
    res = await session.execute(select(Category.slug))
    return [row[0] for row in res.all()]
