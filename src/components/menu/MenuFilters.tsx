"use client";
import React from 'react';
import SearchInput from '../common/SearchInput';
import FilterChips from '../common/FilterChips';

interface MenuFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  className?: string;
}

const MenuFilters: React.FC<MenuFiltersProps> = ({
  search,
  onSearchChange,
  categories,
  selectedCategories,
  onCategoryToggle,
  tags,
  selectedTags,
  onTagToggle,
  className = ""
}) => {
  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0 || search.length > 0;

  const clearAllFilters = () => {
    onSearchChange('');
    selectedCategories.forEach(cat => onCategoryToggle(cat));
    selectedTags.forEach(tag => onTagToggle(tag));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Search Menu</h3>
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search for dishes..."
        />
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">
              Active Filters ({selectedCategories.length + selectedTags.length + (search ? 1 : 0)})
            </h4>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear All
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {search && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm dark:bg-blue-900 dark:text-blue-200">
                Search: "{search}"
              </span>
            )}
            {selectedCategories.map(cat => (
              <span key={cat} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm dark:bg-green-900 dark:text-green-200">
                Category: {cat}
              </span>
            ))}
            {selectedTags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm dark:bg-purple-900 dark:text-purple-200">
                Tag: {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories Filter */}
      <FilterChips
        title="Categories"
        items={categories}
        selectedItems={selectedCategories}
        onToggle={onCategoryToggle}
        emptyMessage="No categories available"
      />

      {/* Tags Filter */}
      <FilterChips
        title="Dietary & Tags"
        items={tags}
        selectedItems={selectedTags}
        onToggle={onTagToggle}
        emptyMessage="No tags available"
      />
    </div>
  );
};

export default MenuFilters;
