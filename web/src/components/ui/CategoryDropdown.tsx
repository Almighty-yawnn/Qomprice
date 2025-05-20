// src/components/ui/CategoryDropdown.tsx
import React from 'react';
import type { Category } from '@/types/product'; // Assuming Category type is here or adjust path
import Link from 'next/link'; // If you want to use Link for direct navigation,
                             // but here we'll use a callback for filtering on the same page.

interface CategoryDropdownProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
  onViewAllClick?: () => void; // Optional: if you want a "View All" to open the main modal
  className?: string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categories,
  onSelectCategory,
  onViewAllClick,
  className = '',
}) => {
  // Filter out "All Categories" if it's the first item and has an empty slug,
  // as the dropdown is usually for specific categories.
  const displayCategories = categories.filter(cat => cat.slug !== "" || categories.length === 1);

  if (!displayCategories.length && !onViewAllClick) {
    return null;
  }

  return (
    <div
      className={`absolute top-full right-0 mt-1 w-64 bg-white rounded-md shadow-xl z-[55] border border-gray-200 overflow-hidden ${className}`}
      // z-[55] to be above sticky header (z-50) but below main modal (z-[60])
    >
      <ul className="max-h-72 overflow-y-auto py-1">
        {displayCategories.map((category) => (
          <li key={category.slug}>
            <button
              onClick={() => onSelectCategory(category.slug)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-150"
            >
              {category.label}
            </button>
          </li>
        ))}
        {onViewAllClick && displayCategories.length > 0 && ( // Show separator if there are categories listed
          <li><hr className="my-1 border-gray-200" /></li>
        )}
        {onViewAllClick && (
          <li>
            <button
              onClick={onViewAllClick}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-100 transition-colors duration-150"
            >
              View All Categories
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default CategoryDropdown;