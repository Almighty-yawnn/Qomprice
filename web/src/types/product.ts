// src/types/product.ts

export interface VendorListing {
  site_id: string;
  site_category_id: string;
  price: number;
  currency: string;
  affiliate_url: string;
  image_url: string;
  stock_status: boolean;
  scraped_at?: string;
  categorySlug: string; // Assuming this is specific to the vendor's categorization
}

export interface Category { // <-- ADD THIS EXPORTED INTERFACE
  label: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string; // Ideally not 'any'
  title: string;
  description?: string; // Ideally not 'any'
  price: number;
  imageUrl?: string; // If you have a main product image
  inStock: boolean;
  onSale: boolean;
  brand?: string; // Ideally not 'any'
  seller?: string; // Ideally not 'any'
  // category: string; // General category name (you might use this or the slug)
  categorySlug: string; // For filtering, matches slug in MOCK_CATEGORIES / Category type
  listings: VendorListing[];
}