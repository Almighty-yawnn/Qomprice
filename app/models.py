from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from .db import Base  # ✅ use this Base

class Category(Base):
    __tablename__ = "category"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True)
    parent_id = Column(Integer, ForeignKey("category.id"), nullable=True)

class Product(Base):
    __tablename__ = "product"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    universal_category_id = Column(ForeignKey("category.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship("VendorListing", back_populates="product")

class VendorListing(Base):
    __tablename__ = "vendor_listing"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("product.id"))
    site_id = Column(String)
    site_category_id = Column(String)
    price = Column(Float)
    currency = Column(String, default="GHS")
    affiliate_url = Column(String)
    image_url = Column(String)
    stock_status = Column(Boolean, default=True)
    scraped_at = Column(DateTime)

    product = relationship("Product", back_populates="listings")

class ScraperError(Base):
    __tablename__ = "scraper_error"
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("category.id"))
    site_id = Column(String)
    details = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
