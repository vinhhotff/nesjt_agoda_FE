"use client";
import React from 'react';

interface FilterChipsProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  className?: string;
  emptyMessage?: string;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  title,
  items,
  selectedItems,
  onToggle,
  className = "",
  emptyMessage = "No items available"
}) => {
  if (items.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm ${className}`}>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm ${className}`}>
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={`
              px-3 py-1 rounded-full text-sm font-medium transition-all duration-200
              ${selectedItems.includes(item)
                ? 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }
            `}
          >
            {item}
            {selectedItems.includes(item) && (
              <span className="ml-1">✓</span>
            )}
          </button>
        ))}
      </div>
      {selectedItems.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => selectedItems.forEach(item => onToggle(item))}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear all ({selectedItems.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterChips;
