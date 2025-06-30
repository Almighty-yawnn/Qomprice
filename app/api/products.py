# app/api/products.py

from typing import Optional, List
from fastapi import APIRouter, Query, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app import db, models, schemas
from app.models import Category, VendorListing
from app.crud import search_products

router = APIRouter()

@router.get("/products", response_model=List[schemas.ProductOut])
async def get_products(
    session: AsyncSession = Depends(db.get_session),
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    site_id: Optional[str] = Query(None, alias="site_id"),
    minPrice: Optional[float] = Query(None, ge=0, description="Minimum price"),
    maxPrice: Optional[float] = Query(None, ge=0, description="Maximum price"),
    limit: int = Query(5000, ge=1, le=10000),
):
    
    # Define list of site IDs from comma-separated input (after param is defined)
    site_ids = site_id.split(",") if site_id else []
    # if there's a search term, use the full-text + filters helper
    if q is not None:
        return await search_products(
            session=session,
            query=q,
            category=category,
            site_id_filter=site_id,
            min_price=minPrice,   # ← pass through
            max_price=maxPrice,   # ← pass through
            limit=limit
        )

    # otherwise, plain list (still with category, site_id, but _without_ text search)
    stmt = (
        select(models.Product)
        .options(joinedload(models.Product.listings))
    )

    if category:
        slugs = category.split(",")
        stmt = stmt.join(
            Category,
            models.Product.universal_category_id == Category.id
        ).where(Category.slug.in_(slugs))

    if site_ids:
        stmt = stmt.join(models.Product.listings).where(
            func.lower(VendorListing.site_id).in_([s.lower() for s in site_ids])
        )

    # **also** apply price filters in the no-text path:
    if minPrice is not None or maxPrice is not None:
        stmt = stmt.join(models.Product.listings)
        if minPrice is not None:
            stmt = stmt.where(VendorListing.price >= minPrice)
        if maxPrice is not None:
            stmt = stmt.where(VendorListing.price <= maxPrice)

    stmt = stmt.limit(limit)
    result = await session.execute(stmt)
    return result.unique().scalars().all()
