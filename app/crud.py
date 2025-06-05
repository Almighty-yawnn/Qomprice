# app/crud.py

from sqlalchemy import select, func # <<< 1. IMPORT func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Optional, List
from .models import Product, Category, VendorListing

async def search_products(
    session: AsyncSession,
    query: str,
    category: Optional[str] = None,
    site_id_filter: Optional[str] = None,
    limit: int = 100
) -> List[Product]:
    stmt = (
        select(Product)
        .options(selectinload(Product.listings))
    )

    stmt = stmt.where(
        func.to_tsvector('english', Product.title)
            .match(query, postgresql_regconfig='english')
    )

    if category:
        slugs = category.split(',')
        stmt = stmt.join(Category, Product.universal_category_id == Category.id).where(Category.slug.in_(slugs))

    if site_id_filter:
        # <<< 2. THIS IS THE FIX >>>
        # Convert the database column to lowercase before comparing
        stmt = stmt.join(Product.listings).where(func.lower(VendorListing.site_id) == site_id_filter)

    stmt = stmt.limit(limit)
    result = await session.execute(stmt)
    return result.unique().scalars().all()


async def list_categories(session: AsyncSession) -> List[str]:
    res = await session.execute(select(Category.slug))
    return [row[0] for row in res.fetchall()]