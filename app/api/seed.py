from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import AsyncSessionLocal
from app.models import Product, Category, VendorListing
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/seed")
async def seed_data():
    async with AsyncSessionLocal() as session:
        # ✅ Create and flush category to get ID
        category = Category(slug="phones")
        session.add(category)
        await session.flush()  # gets category.id

        # ✅ Create product and assign real category.id
        product = Product(
            id=uuid.uuid4(),
            title="Test Product",
            universal_category_id=category.id,
            created_at=datetime.utcnow()
        )
        session.add(product)
        await session.flush()

        # ✅ Add vendor listing
        listing = VendorListing(
            product_id=product.id,
            site_id="jumia",
            site_category_id="123",
            price=999.99,
            currency="GHS",
            affiliate_url="https://jumia.com.gh/product/123",
            stock_status=True,
            scraped_at=datetime.utcnow()
        )
        session.add(listing)

        await session.commit()

    return {"message": "Seeded successfully"}
