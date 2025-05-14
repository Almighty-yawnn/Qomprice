from pydantic import BaseModel, AnyHttpUrl
from typing import Optional, List
from uuid import UUID


from datetime import datetime

class VendorListingOut(BaseModel):
    site_id: str
    site_category_id: str
    price: float
    currency: str
    affiliate_url: str
    image_url: str
    stock_status: bool
    scraped_at: Optional[datetime]

    class Config:
        from_attributes = True




class PriceEntry(BaseModel):
    site_id: str
    price: float
    affiliate_url: AnyHttpUrl

class ProductOut(BaseModel):
    id: UUID
    title: str
    listings: List[VendorListingOut]  # Use full listing serializer

    class Config:
        from_attributes = True

class CategoryOut(BaseModel):
    slug: str

    class Config:
        orm_mode = True
