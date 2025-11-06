"use client";
import React from 'react';
import { Label } from '@/src/components/ui/label';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import Input from '@/src/components/ui/Input';
import { Switch } from '@/src/components/ui/switch';
import { Search, X, Filter, Leaf, Carrot } from 'lucide-react';

interface MenuFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory?: string;
  onCategoryChange: (category: string | undefined) => void;
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  isVegan?: boolean;
  onVeganChange: (value: boolean) => void;
  isVegetarian?: boolean;
  onVegetarianChange: (value: boolean) => void;
  availableOnly?: boolean;
  onAvailableOnlyChange: (value: boolean) => void;
  onClearFilters: () => void;
  className?: string;
}

const MenuFilters: React.FC<MenuFiltersProps> = ({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  tags,
  selectedTags,
  onTagToggle,
  isVegan = false,
  onVeganChange,
  isVegetarian = false,
  onVegetarianChange,
  availableOnly = true,
  onAvailableOnlyChange,
  onClearFilters,
  className = ""
}) => {
  const hasActiveFilters = 
    !!selectedCategory || 
    selectedTags.length > 0 || 
    search.length > 0 || 
    isVegan || 
    isVegetarian || 
    !availableOnly;

  const activeFilterCount = 
    (selectedCategory ? 1 : 0) +
    selectedTags.length +
    (search ? 1 : 0) +
    (isVegan ? 1 : 0) +
    (isVegetarian ? 1 : 0) +
    (!availableOnly ? 1 : 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Search Menu</h3>
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search dishes, ingredients..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-4 pr-10"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-800">
                Active Filters ({activeFilterCount})
              </h4>
            </div>
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge className="bg-blue-100 text-blue-800">
                Search: "{search.length > 20 ? search.substring(0, 20) + '...' : search}"
                <button onClick={() => onSearchChange('')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategory && (
              <Badge className="bg-green-100 text-green-800">
                Category: {selectedCategory}
                <button onClick={() => onCategoryChange(undefined)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedTags.map(tag => (
              <Badge key={tag} className="bg-purple-100 text-purple-800">
                {tag}
                <button onClick={() => onTagToggle(tag)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {isVegan && (
              <Badge className="bg-green-100 text-green-800">
                <Leaf className="h-3 w-3 mr-1" />
                Vegan
                <button onClick={() => onVeganChange(false)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {isVegetarian && (
              <Badge className="bg-orange-100 text-orange-800">
                <Carrot className="h-3 w-3 mr-1" />
                Vegetarian
                <button onClick={() => onVegetarianChange(false)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {!availableOnly && (
              <Badge className="bg-gray-100 text-gray-800">
                Show All Items
                <button onClick={() => onAvailableOnlyChange(true)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Categories Filter */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="category-all"
              name="category"
              checked={!selectedCategory}
              onChange={() => onCategoryChange(undefined)}
              className="text-blue-600"
            />
            <label htmlFor="category-all" className="text-sm text-gray-600">
              All Categories
            </label>
          </div>
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`category-${category}`}
                name="category"
                checked={selectedCategory === category}
                onChange={() => onCategoryChange(category)}
                className="text-blue-600"
              />
              <label htmlFor={`category-${category}`} className="text-sm text-gray-700">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                onClick={() => onTagToggle(tag)}
                className="text-xs"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Dietary Preferences */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-3">Dietary Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" />
              <Label htmlFor="vegan-switch" className="text-sm font-medium">
                Vegan Only
              </Label>
            </div>
            <Switch
              id="vegan-switch"
              checked={isVegan}
              onChange={(e) => onVeganChange((e.target as HTMLInputElement).checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Carrot className="h-4 w-4 text-orange-600" />
              <Label htmlFor="vegetarian-switch" className="text-sm font-medium">
                Vegetarian Only
              </Label>
            </div>
            <Switch
              id="vegetarian-switch"
              checked={isVegetarian}
              onChange={(e) => onVegetarianChange((e.target as HTMLInputElement).checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="available-switch" className="text-sm font-medium">
              Available Only
            </Label>
            <Switch
              id="available-switch"
              checked={availableOnly}
              onChange={(e) => onAvailableOnlyChange((e.target as HTMLInputElement).checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuFilters;
