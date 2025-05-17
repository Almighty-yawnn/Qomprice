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
}

export interface Product {
  category: string;
  name: any;
  description: any;
  price: number;
  inStock: boolean;
  onSale: boolean;
  brand: any;
  seller: any;
  id: string;
  title: string;
  listings: VendorListing[];
}
