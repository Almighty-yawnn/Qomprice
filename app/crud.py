# app/crud.py

from sqlalchemy import select, func
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
    """
    Search products by full-text query, optional category slugs (comma-sep),
    optional site_id (case-insensitive), and limit.
    If no results and query has multiple words, retry with only the first word.
    """
    # base SELECT + eager-load listings
    base_stmt = (
        select(Product)
        .options(selectinload(Product.listings))
    )

    def apply_filters(stmt, q: str):
        # 1) full-text match on title
        stmt = stmt.where(
            func.to_tsvector('english', Product.title)
                .match(q, postgresql_regconfig='english')
        )

        # 2) category filter if provided
        if category:
            slugs = category.split(',')
            stmt = (
                stmt
                .join(Category, Product.universal_category_id == Category.id)
                .where(Category.slug.in_(slugs))
            )

        # 3) site_id filter if provided (case-insensitive)
        if site_id_filter:
            stmt = (
                stmt
                .join(Product.listings)
                .where(func.lower(VendorListing.site_id) == site_id_filter.lower())
            )

        return stmt.limit(limit)

    # first attempt with the full query
    stmt = apply_filters(base_stmt, query)
    result = await session.execute(stmt)
    products = result.unique().scalars().all()

    # if nothing found & query was multiple words, retry with just the first term
    if not products and ' ' in query.strip():
        first_term = query.strip().split()[0]
        stmt2 = apply_filters(base_stmt, first_term)
        result2 = await session.execute(stmt2)
        products = result2.unique().scalars().all()

    return products


async def list_categories(session: AsyncSession) -> List[str]:
    """
    Return all Category.slug values in the database.
    """
    res = await session.execute(select(Category.slug))
    return [row[0] for row in res.fetchall()]


















# # app/crud.py

# from sqlalchemy import select, func # <<< 1. IMPORT func
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.orm import selectinload
# from typing import Optional, List
# from .models import Product, Category, VendorListing

# async def search_products(
#     session: AsyncSession,
#     query: str,
#     category: Optional[str] = None,
#     site_id_filter: Optional[str] = None,
#     limit: int = 100
# ) -> List[Product]:
#     stmt = (
#         select(Product)
#         .options(selectinload(Product.listings))
#     )

#     stmt = stmt.where(
#         func.to_tsvector('english', Product.title)
#             .match(query, postgresql_regconfig='english')
#     )

#     if category:
#         slugs = category.split(',')
#         stmt = stmt.join(Category, Product.universal_category_id == Category.id).where(Category.slug.in_(slugs))

#     if site_id_filter:
#         # <<< 2. THIS IS THE FIX >>>
#         # Convert the database column to lowercase before comparing
#         stmt = stmt.join(Product.listings).where(func.lower(VendorListing.site_id) == site_id_filter)

#     stmt = stmt.limit(limit)
#     result = await session.execute(stmt)
#     return result.unique().scalars().all()


# async def list_categories(session: AsyncSession) -> List[str]:
#     res = await session.execute(select(Category.slug))
#     return [row[0] for row in res.fetchall()]