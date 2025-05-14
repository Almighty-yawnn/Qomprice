from fastapi import FastAPI, Depends, HTTPException
from .db import AsyncSessionLocal, engine, Base
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from . import crud, schemas
from app.api import products 
from app.api import seed as seed_module
from sqlalchemy import select      #  ⬅️  add this line
from app.models import Product, Category
from fastapi.middleware.cors import CORSMiddleware



# from .crud import search_products, list_categories
# from .schemas import CategoryOut
from app.crud import list_categories           # ⬅ add this line
from app.schemas import CategoryOut            # ⬅ and this

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Komprice API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ✅ Add your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session





# …
@app.get("/categories", response_model=list[CategoryOut])
async def categories(session: AsyncSession = Depends(get_session)):
    slugs = await list_categories(session)
    return [{"slug": s} for s in slugs]




@app.get("/search", response_model=list[schemas.ProductOut])
async def search(
    q: str | None = None,                 # ⬅ was `q: str`
    category: str | None = None,
    limit: int = 20,
    session: AsyncSession = Depends(get_session),
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
app.include_router(seed_module.router)  # ✅ add this

