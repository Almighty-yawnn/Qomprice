# komprice/app/api/product.py

from typing import Optional, List

from fastapi import APIRouter, Query
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app import db, models, schemas
from app.models import Category

from app.crud import search_products

router = APIRouter()

@router.get("/products", response_model=List[schemas.ProductOut])
async def get_products(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(None, ge=1, le=1000),
):
    async with db.AsyncSessionLocal() as session:
        if q:
            return await search_products(session, q, category, limit)

        # fallback if no q
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

        # apply limit and execute for both cases
        stmt = stmt.limit(limit)
        result = await session.execute(stmt)
        return result.unique().scalars().all()
