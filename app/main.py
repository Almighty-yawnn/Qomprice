# app/main.py
from contextlib import asynccontextmanager
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import db, schemas
from app.crud import list_categories
from app.models import Product, Category
from app.api import products
from app.api.category_tree import router as cat_tree_router
from app.api import seed as seed_module

# Do NOT override env coming from Render
load_dotenv(override=False)

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Quick connectivity check so Render health check doesn't flap
#     async with db.engine.begin() as conn:
#         await conn.run_sync(lambda _: None)
#     yield
#     await db.engine.dispose()

app = FastAPI(title="Komprice API")#, lifespan=lifespan)

# ── CORS ───────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://qomprice.com",
    "https://*.vercel.app",  # preview deployments
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health check for Render ────────────────────────────────────────────────────
@app.get("/healthz")
def healthz():
    return {"status": "ok"}

# ── Public endpoints used by your frontend ─────────────────────────────────────
@app.get("/api/sites", response_model=List[schemas.MarketplaceInfo])
async def get_sites_endpoint():
    """Returns a list of available marketplace sites."""
    return [
        {"name": "Jumia", "site_id": "jumia"},
        {"name": "Telefonika", "site_id": "telefonika"},
        {"name": "MyGHMarket", "site_id": "myghmarket"},
        {"name": "Shopwice", "site_id": "shopwice"},
        {"name": "Istari", "site_id": "istari"},
    ]

# Note: Your frontend calls `${API}/categories` directly (no /api prefix),
# so keep this route at the root.
@app.get("/categories", response_model=List[schemas.CategoryOut])
async def categories_endpoint(session: AsyncSession = Depends(db.get_session)):
    slugs = await list_categories(session)
    return [{"slug": s} for s in slugs]

@app.get("/search", response_model=List[schemas.ProductOut])
async def search_endpoint(
    q: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 20,
    session: AsyncSession = Depends(db.get_session),
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

# Routers (these expose /api/products etc.)
app.include_router(products.router, prefix="/api")
app.include_router(seed_module.router)
app.include_router(cat_tree_router, prefix="/api")
#
