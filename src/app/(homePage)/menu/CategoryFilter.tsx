import React, { memo } from "react";
import { ChefHat, Coffee, Cookie, Salad, UtensilsCrossed } from "lucide-react";

interface Props {
  categories: string[];
  selected: string[];
  toggleCategory: (name: string) => void;
  className?: string;
}

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Appetizers': <Salad size={18} />,
    'Main Course': <ChefHat size={18} />,
    'Desserts': <Cookie size={18} />,
    'Beverages': <Coffee size={18} />,
  };
  return iconMap[category] || <UtensilsCrossed size={18} />;
};

const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    'Appetizers': 'from-green-500 to-emerald-600',
    'Main Course': 'from-orange-500 to-red-600',
    'Desserts': 'from-pink-500 to-rose-600',
    'Beverages': 'from-blue-500 to-cyan-600',
  };
  return colorMap[category] || 'from-gray-500 to-gray-600';
};

function CategoryFilter({ categories, selected, toggleCategory, className = "" }: Props) {
  if (!categories.length) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-3">
          <ChefHat size={20} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Categories</h3>
        </div>
        <div className="text-gray-500 text-sm italic">
          No categories available
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ChefHat size={20} className="text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Categories
          </h3>
          {selected.length > 0 && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
              {selected.length}
            </span>
          )}
        </div>
        {selected.length > 0 && (
          <button
            onClick={() => selected.forEach(cat => toggleCategory(cat))}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => {
          const isActive = selected.includes(cat);
          return (
            <button
              key={cat}
              className={`group relative flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-r ${getCategoryColor(cat)} text-white shadow-lg scale-105`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
              onClick={() => toggleCategory(cat)}
            >
              <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {getCategoryIcon(cat)}
              </span>
              <span className="text-sm">{cat}</span>
              {isActive && (
                <span className="ml-1 text-xs">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(CategoryFilter);