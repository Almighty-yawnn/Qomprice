# komprice/app/api/product.py

from typing import Optional, List
from fastapi import APIRouter, Query, Depends
from sqlalchemy import select, func # <<< 1. IMPORT func
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
    limit: int = Query(5000, ge=1, le=10000),
):
    if q:
        return await search_products(
            session=session,
            query=q,
            category=category,
            site_id_filter=site_id,
            limit=limit
        )

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

    if site_id:
        # <<< 2. THIS IS THE FIX >>>
        # Convert the database column to lowercase before comparing
        stmt = stmt.join(models.Product.listings).where(func.lower(VendorListing.site_id) == site_id)

    stmt = stmt.limit(limit)
    result = await session.execute(stmt)
    return result.unique().scalars().all()