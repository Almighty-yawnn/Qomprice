from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class Category(Base):
    __tablename__ = "category"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True)
    parent_id = Column(Integer, ForeignKey("category.id"), nullable=True)

class Product(Base):
    __tablename__ = "product"
    id = Column(String, primary_key=True)  # UUID str
    title = Column(String, index=True)
    brand = Column(String, index=True)
    model = Column(String, index=True)
    universal_category_id = Column(Integer, ForeignKey("category.id"))
    attributes = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class VendorListing(Base):
    __tablename__ = "vendor_listing"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("product.id"))
    site_id = Column(String, index=True)
    site_category_id = Column(String)
    price = Column(Float)
    currency = Column(String(4), default="GHS")
    stock_status = Column(Boolean, default=True)
    scraped_at = Column(DateTime, default=datetime.utcnow, index=True)
    affiliate_url = Column(String)

class ScraperError(Base):
    __tablename__ = "scraper_error"
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("category.id"))
    site_id = Column(String)
    details = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
