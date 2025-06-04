import React from 'react';

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  min: number;
  max: number;
  onPriceChange: (range: { min: number; max: number }) => void;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  minPrice,
  maxPrice,
  min,
  max,
  onPriceChange
}) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice - 1);
    onPriceChange({ min: value, max: maxPrice });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + 1);
    onPriceChange({ min: minPrice, max: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Price Range</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>₵{minPrice}</span>
          <span>₵{maxPrice}</span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            value={minPrice}
            onChange={handleMinChange}
            className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            title="Minimum price range"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={maxPrice}
            onChange={handleMaxChange}
            className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            title="Maximum price range"
          />
        </div>
      </div>
      
      <div className="flex space-x-2">
        <input
          type="number"
          value={minPrice}
          onChange={(e) => onPriceChange({ min: Number(e.target.value), max: maxPrice })}
          className="w-full px-2 py-1 text-sm border rounded"
          placeholder="Min"
        />
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => onPriceChange({ min: minPrice, max: Number(e.target.value) })}
          className="w-full px-2 py-1 text-sm border rounded"
          placeholder="Max"
        />
      </div>
    </div>
  );
};

export default PriceRangeFilter;
