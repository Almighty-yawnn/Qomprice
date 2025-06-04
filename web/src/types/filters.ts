export interface FilterState {
  brands: string[];
  productTypes: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  [key: string]: unknown;
}
