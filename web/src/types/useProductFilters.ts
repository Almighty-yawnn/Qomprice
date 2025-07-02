import { useState, useMemo } from 'react';
import { FilterState, Product } from '../types/filters';

export const useProductFilters = (products: Product[]) => {
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    productTypes: [],
    priceRange: { min: 0, max: 100000 }
  });

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(product => {
      const productName = product.name?.toLowerCase() || '';
      // Extract brands from product names
      ['apple', 'samsung', 'huawei', 'xiaomi', 'oppo', 'vivo', 'infinix', 'tecno'].forEach(brand => {
        if (productName.includes(brand)) {
          brands.add(brand.charAt(0).toUpperCase() + brand.slice(1));
        }
      });
    });
    return Array.from(brands).sort();
  }, [products]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    products.forEach(product => {
      const productName = product.name?.toLowerCase() || '';
      ['phone', 'laptop', 'tablet', 'watch', 'earbuds', 'headphones', 'speaker'].forEach(type => {
        if (productName.includes(type)) {
          types.add(type.charAt(0).toUpperCase() + type.slice(1));
        }
      });
    });
    return Array.from(types).sort();
  }, [products]);

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 };
    const prices = products.map(p => p.price || 0);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const productName = product.name?.toLowerCase() || '';
      
      // Brand filter
      if (filters.brands.length > 0) {
        const hasMatchingBrand = filters.brands.some(brand => 
          productName.includes(brand.toLowerCase())
        );
        if (!hasMatchingBrand) return false;
      }

      // Product type filter
      if (filters.productTypes.length > 0) {
        const hasMatchingType = filters.productTypes.some(type => 
          productName.includes(type.toLowerCase())
        );
        if (!hasMatchingType) return false;
      }

      // Price filter
      const price = product.price || 0;
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  const updateFilter = (
    filterType: keyof FilterState,
    value: string[] | { min: number; max: number }
  ) => {
    setFilters(prev => {
      if (filterType === 'brands' || filterType === 'productTypes') {
        // Only handle string[] values for brands and productTypes
        if (Array.isArray(value)) {
          return { ...prev, [filterType]: value };
        }
        // If value is not an array, do not update
        return prev;
      }
      // For priceRange, value should be { min: number; max: number }
      if (
        filterType === 'priceRange' &&
        typeof value === 'object' &&
        value !== null &&
        typeof (value as { min: number; max: number }).min === 'number' &&
        typeof (value as { min: number; max: number }).max === 'number'
      ) {
        return { ...prev, priceRange: value as { min: number; max: number } };
      }
      // If value is not the correct type, do not update
      return prev;
    });
  };

  const clearFilters = () => {
    setFilters({
      brands: [],
      productTypes: [],
      priceRange: priceRange
    });
  };

  return {
    filters,
    filteredProducts,
    availableBrands,
    availableTypes,
    priceRange,
    updateFilter,
    clearFilters,
    hasActiveFilters: filters.brands.length > 0 || filters.productTypes.length > 0 || 
      filters.priceRange.min !== priceRange.min || filters.priceRange.max !== priceRange.max
  };
};
