# komprice/app/api/product.py

from typing import Optional, List

from fastapi import APIRouter, Query
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app import db, models, schemas
from app.models import Category

router = APIRouter()


@router.get(
    "/products",
    response_model=List[schemas.ProductOut],
)
async def get_products(
    q: Optional[str] = Query(None, description="search term"),
    category: Optional[str] = Query(None, description="category slug to filter by"),
    limit: Optional[int] = Query(None, ge=1, le=1000, description="maximum number of items to return"),
):
    async with db.AsyncSessionLocal() as session:
        # 1️⃣  Base query
        stmt = select(models.Product).options(joinedload(models.Product.listings))

        # 2️⃣  Filter by title if q provided
        if q:
            stmt = stmt.where(models.Product.title.ilike(f"%{q}%"))

        # 3️⃣  Join & filter by Category.slug if category provided
        if category:
            stmt = (
                stmt
                .join(Category, models.Product.universal_category_id == Category.id)
                .where(Category.slug == category)
            )

        # 4️⃣  Apply limit if set
        if limit:
            stmt = stmt.limit(limit)

        result = await session.execute(stmt)
        return result.unique().scalars().all()













# komprice/app/api/product.py

# from typing import Optional, List

# from fastapi import APIRouter, Query
# from sqlalchemy import select
# from sqlalchemy.orm import joinedload

# from app import db, models, schemas
# from app.models import Category

# router = APIRouter()


# @router.get(
#     "/products",
#     response_model=List[schemas.ProductOut],
# )
# async def get_products(
#     q: Optional[str] = Query(None, description="search term"),
#     category: Optional[str] = Query(None, description="category slug to filter by"),
#     limit: Optional[int] = Query(None, ge=1, description="maximum number of items to return"),
# ):
#     async with db.AsyncSessionLocal() as session:
#         # 1️⃣ base select + eager-load listings
#         stmt = select(models.Product).options(joinedload(models.Product.listings))

#         # 2️⃣ text search on title
#         if q:
#             stmt = stmt.where(models.Product.title.ilike(f"%{q}%"))

#         # 3️⃣ join & filter by Category.slug
#         if category:
#             stmt = (
#                 stmt
#                 .join(Category, models.Product.universal_category_id == Category.id)
#                 .where(Category.slug == category)
#             )

#         # 4️⃣ apply limit only if provided
#         if limit:
#             stmt = stmt.limit(limit)

#         result = await session.execute(stmt)
#         # .unique() ensures we don’t get duplicate Product rows after the JOIN
#         return result.unique().scalars().all()

























# # komprice/app/api/product.py

# from typing import Optional, List
# from fastapi import APIRouter, Query
# from sqlalchemy import select
# from sqlalchemy.orm import joinedload

# from app import db, models, schemas

# router = APIRouter()

# @router.get(
#     "/products",
#     response_model=List[schemas.ProductOut],
#     # now accept q and category also
# )
# async def get_products(
#     q: Optional[str] = Query(None, description="search term"),
#     category: Optional[str] = Query(None),
#     limit: int = Query(500, ge=1, le=1000),
# ):
#     async with db.AsyncSessionLocal() as session:
#         stmt = select(models.Product).options(joinedload(models.Product.listings))

#         if q:
#             stmt = stmt.where(models.Product.title.ilike(f"%{q}%"))

#         if category:
#             stmt = stmt.where(models.Product.category_slug == category)

#         stmt = stmt.limit(limit)
#         result = await session.execute(stmt)
#         return result.unique().scalars().all()
