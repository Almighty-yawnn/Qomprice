# app/schemas.py

from pydantic import BaseModel, AnyHttpUrl
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class VendorListingOut(BaseModel):
    site_id: str
    site_category_id: str
    price: float
    currency: str
    affiliate_url: str # Consider changing to AnyHttpUrl if it's always a full URL
    image_url: str     # Consider changing to AnyHttpUrl if it's always a full URL
    stock_status: bool
    scraped_at: Optional[datetime]

    class Config:
        from_attributes = True # Correct for Pydantic v2+

class PriceEntry(BaseModel): # This schema doesn't seem to be used by ProductOut directly
    site_id: str
    price: float
    affiliate_url: AnyHttpUrl

class ProductOut(BaseModel):
    id: UUID
    title: str
    listings: List[VendorListingOut]

    class Config:
        from_attributes = True # Correct for Pydantic v2+

class CategoryOut(BaseModel):
    slug: str

    class Config:
        # from_attributes = True is the Pydantic v2+ equivalent of orm_mode = True
        from_attributes = True

# --- ADDED MarketplaceInfo SCHEMA ---
class MarketplaceInfo(BaseModel):
    name: str
    site_id: str

    class Config:
        from_attributes = True
# --- END ---