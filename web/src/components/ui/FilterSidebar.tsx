// src/components/ui/FilterSidebar.tsx
import React, { useState } from 'react'
import { Disclosure } from '@headlessui/react'
import {
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Range } from 'react-range'
import { FilterState } from '../../types/filters'

interface FilterSidebarProps {
  filters: FilterState
  availableBrands: string[]
  availableTypes: string[]
  priceRange: { min: number; max: number }
  onBrandChange: (brands: string[]) => void  // Changed from string to string[]
  onTypeChange: (types: string[]) => void    // Changed from string to string[]
  onPriceChange: (range: { min: number; max: number }) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  productCount: number
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
  productCount,
}) => {
  const [collapsed, setCollapsed] = useState(false)

  const [selectedBrands, setSelectedBrands] = useState(filters.brands);
  const [selectedTypes, setSelectedTypes] = useState(filters.productTypes);
  const [values, setValues] = useState<[number, number]>([
    filters.priceRange.min,
    filters.priceRange.max,
  ]);

  const handleApplyFilters = () => {
    onBrandChange(selectedBrands);  // Now passes array correctly
    onTypeChange(selectedTypes);    // Now passes array correctly
    onPriceChange({ min: values[0], max: values[1] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <aside className="relative flex">
      <div
        className={`flex flex-col bg-white shadow-lg transition-all duration-300 ${
          collapsed ? 'w-0 overflow-hidden' : 'w-72'
        }`}
        style={{ height: '100vh' }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold">Filters</h2>
            {hasActiveFilters && (
              <div className="ml-2 text-sm bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {filters.brands.length + filters.productTypes.length +
                (filters.priceRange.min !== priceRange.min ? 1 : 0) +
                (filters.priceRange.max !== priceRange.max ? 1 : 0)
                } active
              </div>
            )}
          </div>
          <button
              onClick={onClearFilters}
              className="flex items-center justify-center bg-red-100 text-red-700 font-semibold py-2 rounded-lg hover:bg-red-200 transition-all"
            >
              <XMarkIcon className="h-5 w-5 mr-2" />
              
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          <div className="text-sm text-gray-600">
            {productCount} products found
          </div>

          {/* Brands */}
          <Disclosure>
            {({ open }: { open: boolean }) => (
              <div className="flex flex-col">
                <Disclosure.Button className="w-full flex justify-between items-center py-2 border-b">
                  <span>Brands</span>
                  <ChevronDownIcon
                    className={`h-5 w-5 transform transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="pt-2 space-y-1">
                  {availableBrands.map((b) => (
                    <label
                      key={b}
                      className={`inline-flex items-center space-x-2 text-sm px-3 py-1.5 rounded-full border transition-all duration-150 cursor-pointer 
                        ${filters.brands.includes(b) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-emerald-50'}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b)}
                        onChange={() =>
                          setSelectedBrands((prev) =>
                            prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
                          )
                        }
                      />
                      <span>{b}</span>
                    </label>

                  ))}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>

          {/* Types */}
          <Disclosure>
            {({ open }: { open: boolean }) => (
              <div className="flex flex-col">
                <Disclosure.Button className="w-full flex justify-between items-center py-2 border-b">
                  <span>Product Types</span>
                  <ChevronDownIcon
                    className={`h-5 w-5 transform transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="pt-2 space-y-1">
                  {availableTypes.map((t) => (
                    <label
                      key={t}
                      className={`inline-flex items-center space-x-2 text-sm px-3 py-1.5 rounded-full border transition-all duration-150 cursor-pointer 
                        ${filters.productTypes.includes(t) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-emerald-50'}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(t)}
                        onChange={() =>
                          setSelectedTypes((prev) =>
                            prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                          )
                        }
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>

          {/* Price */}
          <div>
            <h3 className="text-sm font-medium mb-2">Price Range (GHS)</h3>
            <Range
              step={1}
              min={priceRange.min}
              max={priceRange.max}
              values={values}
              onChange={(v) => setValues([v[0], v[1]])}
              onFinalChange={(v) => onPriceChange({ min: v[0], max: v[1] })}
              renderTrack={({ props, children }) => {
                // extract key before spreading
                const { key, ...rest } = props as React.HTMLProps<HTMLDivElement> & { key: string };
                return (
                  <div
                    key={key}
                    {...rest}
                    className="h-2 bg-emerald-100 rounded-full relative overflow-hidden"
                  >
                    {children}
                  </div>
                );
              }}
              renderThumb={({ props }) => {
                const { key, ...rest } = props as React.HTMLProps<HTMLDivElement> & { key: string };
                return (
                  <div key={key} {...rest} className="h-5 w-5 bg-emerald-600 border-2 border-white rounded-full shadow-md transition-all duration-150" />
                );
              }}
            />

            <div className="mt-2 flex justify-between text-xs text-gray-600">
              <span>GHS {values[0]}</span>
              <span>GHS {values[1]}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <button
            onClick={handleApplyFilters}
            className="w-full mt-2 bg-emerald-500 text-white py-2 rounded-md hover:bg-emerald-600 transition"
            >
              Apply Filters
          </button>
        </div>
      </div>

      {/* COLLAPSE TAB */}
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Open sidebar"
          className="absolute top-1/3 -right-3 bg-emerald-600 p-2 rounded-full shadow-lg"
        >
          <ChevronRightIcon className="h-5 w-5 text-white" />
        </button>
      ) : null}
    </aside>
  )
}

export default FilterSidebar