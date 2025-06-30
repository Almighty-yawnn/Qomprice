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
    min_price: Optional[float] = None,      # ← added
    max_price: Optional[float] = None,      # ← added
    limit: int = 100
) -> List[Product]:
    """
    Search products by full-text query, optional category slugs (comma-sep),
    optional site_id (case-insensitive), optional min/max price,
    and limit. Falls back to first word if no matches on multi-word query.
    """
    # base SELECT + eager-load listings
    base_stmt = (
        select(Product)
        .options(selectinload(Product.listings))
    )

    def apply_filters(stmt, q: str):
        # 1) full-text match
        stmt = stmt.where(
            func.to_tsvector('english', Product.title)
                .match(q, postgresql_regconfig='english')
        )

        # 2) category filter
        if category:
            slugs = category.split(',')
            stmt = (
                stmt
                .join(Category, Product.universal_category_id == Category.id)
                .where(Category.slug.in_(slugs))
            )

        # 3) site_id filter (if present)
        if site_id_filter:
            site_ids = [s.strip().lower() for s in site_id_filter.split(",") if s.strip()]
            if site_ids:
                stmt = (
                    stmt
                    .join(Product.listings)
                    .where(func.lower(VendorListing.site_id).in_(site_ids))
                )

        # 4) price filters (if present)
        if min_price is not None or max_price is not None:
            # make sure we have a listing join
            stmt = stmt.join(Product.listings)
            if min_price is not None:
                stmt = stmt.where(VendorListing.price >= min_price)
            if max_price is not None:
                stmt = stmt.where(VendorListing.price <= max_price)

        return stmt.limit(limit)

    # first attempt
    stmt = apply_filters(base_stmt, query)
    result = await session.execute(stmt)
    products = result.unique().scalars().all()

    # fallback on first word if nothing found
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
