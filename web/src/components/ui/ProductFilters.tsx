import React from 'react';

interface ProductFiltersProps {
  brands: string[];
  productTypes: string[];
  selectedBrands: string[];
  selectedTypes: string[];
  onBrandChange: (brand: string) => void;
  onTypeChange: (type: string) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  brands,
  productTypes,
  selectedBrands,
  selectedTypes,
  onBrandChange,
  onTypeChange
}) => {
  return (
    <div className="space-y-6">
      {brands.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Brands</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map(brand => (
              <label key={brand} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onBrandChange(brand)}
                  className="mr-2 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {productTypes.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Product Types</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {productTypes.map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => onTypeChange(type)}
                  className="mr-2 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
