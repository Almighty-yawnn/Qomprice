import type { Product } from "@/types/product";


export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchCategories() {
  const res = await fetch(`${API}/categories`, { next: { revalidate: 60 } });
  return res.json() as Promise<{ slug: string }[]>;
}


export async function searchProducts(params: {
  q?: string;
  category?: string;
  limit?: number;
}): Promise<Product[]> {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as any
  );

  try {
    const res = await fetch(`${API}/api/products?${query.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("❌ API fetch failed", res.status);
      return [];
    }

    const data = await res.json();
    return data; // ✅ NOT data.products
  } catch (err) {
    console.error("❌ searchProducts() failed:", err);
    return [];
  }
}
