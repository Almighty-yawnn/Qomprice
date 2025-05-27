// src/lib/api.ts (Corrected)

import type { Product } from "@/types/product"; // Ensure Product type matches the items in the array

export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchCategories() {
  const res = await fetch(`${API}/api/categories`, { next: { revalidate: 60 } });
  if (!res.ok) {
    console.error("❌ API fetchCategories failed", res.status);
    return [];
  }
  return res.json() as Promise<{ slug: string }[]>;
}

interface SearchProductsParams {
  q?: string;
  category?: string;
  limit?: number;
  page?: number;
  site_id?: string;
  minPrice?: number;
  maxPrice?: number;
}

// This function now directly returns what the API sends for products,
// which appears to be Product[] based on your screenshot.
// IMPORTANT: This means 'total' and 'allAvailableSiteIds' are NOT part of this direct API response.
export async function searchProducts(params: SearchProductsParams): Promise<Product[]> {
  const queryParamsObject: Record<string, string> = {};

  if (params.q !== undefined) queryParamsObject.q = params.q;
  if (params.category !== undefined) queryParamsObject.category = params.category;
  if (params.limit !== undefined) queryParamsObject.limit = String(params.limit);
  if (params.page !== undefined) queryParamsObject.page = String(params.page);
  
  if (params.site_id !== undefined) queryParamsObject.site_id = params.site_id;
  if (params.minPrice !== undefined) queryParamsObject.minPrice = String(params.minPrice);
  if (params.maxPrice !== undefined) queryParamsObject.maxPrice = String(params.maxPrice);

  const query = new URLSearchParams(queryParamsObject);
  const endpoint = `${API}/api/products?${query.toString()}`;
  console.log(`(Frontend API Call) Fetching: ${endpoint}`);

  try {
    const res = await fetch(endpoint, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ API searchProducts fetch failed:", res.status, errorText);
      return []; // Return empty array on failure
    }

    const data = await res.json(); // data is now expected to be Product[]

    // Ensure data is an array
    if (!Array.isArray(data)) {
        console.error("❌ API searchProducts response is not an array:", data);
        return [];
    }
    return data as Product[]; // Assuming items in array match Product type

  } catch (err) {
    console.error("❌ searchProducts() exception:", err);
    return [];
  }
}