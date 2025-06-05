// src/lib/api.ts

import type { Product } from "@/types/product";

// Assuming MarketplaceInfo is defined, e.g., in "@/types/product" or locally
interface MarketplaceInfo {
  site_id: string;
  name: string;
}

export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Corrected fetchCategories
// Explicitly declare the return type for clarity and to help TypeScript.
export async function fetchCategories(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API}/api/categories`, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error("❌ API fetchCategories failed", res.status);
      return []; // Return an empty array on failure, fulfilling the Promise<Array>
    }
    const data = await res.json();
    // Assuming your API directly returns the array of { slug: string }
    // If it's nested, e.g., data.categories, adjust accordingly.
    return data as { slug: string }[];
  } catch (error) {
    console.error("❌ API fetchCategories exception:", error);
    return []; // Return an empty array on exception
  }
}

interface SearchProductsParams {
  q?: string;
  category?: string | string[];
  limit?: number;
  page?: number;
  site_id?: string; // This should match the parameter name your backend API expects for filtering by store/site
  minPrice?: number;
  maxPrice?: number;
}

// searchProducts - This function looked mostly okay, but adding a try-catch for the fetch itself.
export async function searchProducts(params: SearchProductsParams): Promise<Product[]> {
  const queryParamsObject: Record<string, string> = {};

  if (params.q !== undefined && params.q.trim() !== "") queryParamsObject.q = params.q;
  if (params.category !== undefined) {
    const cat = Array.isArray(params.category) ? params.category.join(",") : params.category;
    if (cat.trim() !== "") queryParamsObject.category = cat;
  }
  if (params.limit !== undefined) queryParamsObject.limit = String(params.limit);
  if (params.page !== undefined) queryParamsObject.page = String(params.page);
  
  // Ensure site_id is used for the parameter if that's what your backend expects
  if (params.site_id !== undefined && params.site_id.trim() !== "") queryParamsObject.site_id = params.site_id;
  if (params.minPrice !== undefined) queryParamsObject.minPrice = String(params.minPrice);
  if (params.maxPrice !== undefined) queryParamsObject.maxPrice = String(params.maxPrice);

  const query = new URLSearchParams(queryParamsObject);
  const endpoint = `${API}/api/products?${query.toString()}`;
  console.log(`(Frontend API Call) Fetching: ${endpoint}`);

  try {
    const res = await fetch(endpoint, { cache: "no-store" });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ API searchProducts fetch failed:", res.status, errorText);
      return []; // Return empty array on HTTP error
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
        console.error("❌ API searchProducts response is not an array:", data);
        // If your API might also return { products: [], total: 0 } for no results, handle that here.
        // For now, assuming a direct array or an error.
        return [];
    }
    // IMPORTANT: If your API for products returns { products: Product[], total: number },
    // you need to change the return type of this function to reflect that,
    // e.g., Promise<{ products: Product[], total: number }>, and then return 'data'.
    return data as Product[];

  } catch (err) {
    console.error("❌ searchProducts() network/fetch exception:", err);
    return []; // Return empty array on fetch exception
  }
}

// Corrected fetchCategoryTree
export async function fetchCategoryTree(): Promise<Record<string, string[]>> {
  try {
    const res = await fetch(`${API}/api/category-tree`);
    if (!res.ok) {
      console.error("❌ API fetchCategoryTree failed", res.status);
      return {}; // Return an empty object on failure
    }
    // `await` the json parsing
    return await res.json();
  } catch (error) {
    console.error("❌ API fetchCategoryTree exception:", error);
    return {}; // Return an empty object on exception
  }
}

// fetchMarketplaces (as provided before, ensure it's robust)
export async function fetchMarketplaces(): Promise<MarketplaceInfo[]> {
  const endpoint = `${API}/api/sites`; // Example endpoint, adjust to your actual one

  try {
    console.log("API: Fetching marketplaces/sites from", endpoint);
    const res = await fetch(endpoint);
    if (!res.ok) {
      console.error("❌ API fetchMarketplaces failed", res.status);
      // You might want to throw an error or return a default/empty array
      // throw new Error(`Failed to fetch marketplaces: ${res.status}`);
      return []; // Return empty array on HTTP error
    }
    const data = await res.json();
    // Adjust data access based on your API response structure (e.g., data.sites, data.marketplaces, or data directly)
    const marketplaces = (data.sites || data.marketplaces || Array.isArray(data) ? data : []) as MarketplaceInfo[];
    
    // Sort by name for display consistency
    marketplaces.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return marketplaces;

  } catch (error) {
    console.error("❌ API fetchMarketplaces exception:", error);
    return []; // Return empty array on fetch exception
  }
}