// src/types/product.ts

export interface VendorListing {
  site_id: string;
  price: number; // Price is here
  currency: string;
  affiliate_url?: string;
  image_url?: string;
  store_name?: string;
  site_category_id?: string;
  stock_status?: boolean;
  title?: string; // Listing-specific title
}

export interface Product {
  name: string;
  price: number | undefined;
  id: string;
  title: string;           // This is the primary name. 'name' should NOT be a separate required field here.
  listings: VendorListing[];
  imageUrl?: string;      // For ProductCard's main image (camelCase)
  seller?: string;        // Optional top-level seller information

  // CRITICAL: Ensure 'name' and 'price' are NOT defined here as top-level required properties
  // unless that's truly your data model (but based on ProductCard, price comes from listings).
}

// Other types like Category, DynamicFilterOption, AvailableDynamicFilters, SelectedDynamicFilters
// can remain as they were in the previous complete file I sent.
export interface Category {
  label: string;
  slug: string;
}

export interface DynamicFilterOption {
  label: string;
  value: string;
}

export interface AvailableDynamicFilters {
  site_id?: DynamicFilterOption[];
}

export interface SelectedDynamicFilters {
  site_id?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
}