import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ProductFilters from './ProductFilters';
import PriceRangeFilter from './PriceRangeFilter';
import { FilterState } from '../../types/filters';

interface FilterSidebarProps {
  filters: FilterState;
  availableBrands: string[];
  availableTypes: string[];
  priceRange: { min: number; max: number };
  onBrandChange: (brand: string) => void;
  onTypeChange: (type: string) => void;
  onPriceChange: (range: { min: number; max: number }) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  productCount: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  availableBrands,
  availableTypes,
  priceRange,
  onBrandChange,
  onTypeChange,
  onPriceChange,
  onClearFilters,
  hasActiveFilters,
  productCount
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-80'}`}>
        <div className="sticky top-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {!isCollapsed && (
              <>
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <div className="flex items-center space-x-2">
                  {hasActiveFilters && (
                    <button
                      onClick={onClearFilters}
                      className="text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-5 h-5" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {!isCollapsed && (
            <div className="p-4 space-y-6">
              <div className="text-sm text-gray-600">
                {productCount} products found
              </div>

              <ProductFilters
                brands={availableBrands}
                productTypes={availableTypes}
                selectedBrands={filters.brands}
                selectedTypes={filters.productTypes}
                onBrandChange={onBrandChange}
                onTypeChange={onTypeChange}
              />

              <PriceRangeFilter
                minPrice={filters.priceRange.min}
                maxPrice={filters.priceRange.max}
                min={priceRange.min}
                max={priceRange.max}
                onPriceChange={onPriceChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-12 left-3 z-50">
        <div className="relative bottom-20 bg-white border border-gray-200 rounded-lg shadow-sm">
        <button
          className="fixed bottom-10 left-2 sm:bottom-12 sm:left-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg z-40 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 opacity-100 translate-y-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          Filters
          {hasActiveFilters && (
        <span className="flex items-center">
          <span className="ml-1 bg-red-500 text-xs px-1 rounded">•</span>
          <button
            onClick={onClearFilters}
            className="ml-2 text-sm text-emerald-300 hover:text-emerald-400 filter-clear-btn"
          >
            Clear All
          </button>
        </span>
          )}
        </button>
        

        {!isCollapsed && (
          <div className="p-3 space-y-5">
            <div className="text-sm text-gray-600">
              {productCount} products found
            </div>
            <ProductFilters
                brands={availableBrands}
                productTypes={availableTypes}
                selectedBrands={filters.brands}
                selectedTypes={filters.productTypes}
                onBrandChange={onBrandChange}
                onTypeChange={onTypeChange}
              />

              <PriceRangeFilter
                minPrice={filters.priceRange.min}
                maxPrice={filters.priceRange.max}
                min={priceRange.min}
                max={priceRange.max}
                onPriceChange={onPriceChange}
              />
          </div>
        )}
        </div>
        </div>
    </>
  );
};

export default FilterSidebar;




