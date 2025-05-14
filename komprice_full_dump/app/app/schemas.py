from pydantic import BaseModel, AnyHttpUrl
from typing import Optional, List

class PriceEntry(BaseModel):
    site_id: str
    price: float
    affiliate_url: AnyHttpUrl

class ProductOut(BaseModel):
    id: str
    title: str
    brand: Optional[str]
    model: Optional[str]
    category: str
    listings: List[PriceEntry]

    class Config:
        orm_mode = True

class CategoryOut(BaseModel):
    slug: str

    class Config:
        orm_mode = True
