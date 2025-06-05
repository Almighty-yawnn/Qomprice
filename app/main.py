# app/main.py

from fastapi import FastAPI, Depends, HTTPException
from typing import List
from .db import AsyncSession # Removed AsyncSessionLocal as it's not directly used here
from contextlib import asynccontextmanager
from . import crud, schemas, db # <<< IMPORT 'db' TO ACCESS get_session
from app.api import products 
from app.api.category_tree import router as cat_tree_router
from app.api import seed as seed_module
from sqlalchemy import select
from app.models import Product, Category
from fastapi.middleware.cors import CORSMiddleware

from app.crud import list_categories
from app.schemas import CategoryOut, MarketplaceInfo # <<< IMPORT MarketplaceInfo

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with db.engine.begin() as conn: # Use db.engine
        await conn.run_sync(db.Base.metadata.create_all) # Use db.Base
    yield

app = FastAPI(title="Komprice API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The 'get_session' function has been MOVED to app/db.py and is DELETED from this file.


# --- /api/sites endpoint ---
@app.get("/api/sites", response_model=List[schemas.MarketplaceInfo])
async def get_sites_endpoint():
    """
    Returns a list of available marketplace sites.
    """
    return [
        {"name": "Jumia", "site_id": "jumia"},
        {"name": "Telefonika", "site_id": "telefonika"},
        {"name": "MyGHMarket", "site_id": "myghmarket"},
        {"name": "Shopwice", "site_id": "shopwice"},
        {"name": "Istari", "site_id": "istari"},
    ]


@app.get("/categories", response_model=List[CategoryOut])
async def categories_endpoint(session: AsyncSession = Depends(db.get_session)): # <<< UPDATED
    slugs = await list_categories(session)
    return [{"slug": s} for s in slugs]


@app.get("/search", response_model=List[schemas.ProductOut])
async def search_endpoint(
    q: str | None = None,
    category: str | None = None,
    limit: int = 20,
    session: AsyncSession = Depends(db.get_session), # <<< UPDATED
):
    stmt = select(Product)

    if q:
        stmt = stmt.where(Product.title.ilike(f"%{q}%"))

    if category:
        stmt = (
            stmt.join(Category, Product.universal_category_id == Category.id)
                .where(Category.slug == category)
        )

    result = await session.execute(stmt.limit(limit))
    return result.scalars().all()


app.include_router(products.router, prefix="/api")
app.include_router(seed_module.router)
app.include_router(cat_tree_router, prefix="/api")