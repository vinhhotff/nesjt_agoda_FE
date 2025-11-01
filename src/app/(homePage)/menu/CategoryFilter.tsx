import React, { memo } from "react";
import { ChefHat, Coffee, Cookie, Salad } from "lucide-react";
import styles from "./menu.module.css";

interface Props {
  categories: string[];
  selected: string[];
  toggleCategory: (name: string) => void;
  className?: string;
}

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Appetizers': <Salad size={16} />,
    'Main Course': <ChefHat size={16} />,
    'Desserts': <Cookie size={16} />,
    'Beverages': <Coffee size={16} />,
  };
  return iconMap[category] || <ChefHat size={16} />;
};

function CategoryFilter({ categories, selected, toggleCategory, className = "" }: Props) {
  if (!categories.length) {
    return (
      <div className={`${styles.filterBox} ${className}`}>
        <div className={styles.filterTitle}> CATEGORIES</div>
        <div className="text-gray-500 text-sm italic py-2">
          No categories available
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.filterBox} ${className}`}>
      <div className={styles.filterTitle}>CATEGORIES ({selected.length})</div>
      <div className="space-y-1">
        {categories.map((cat) => {
          const isActive = selected.includes(cat);
          return (
            <button
              key={cat}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-yellow-500 text-gray-900 font-medium'
                  : 'hover:bg-gray-700 text-gray-300 hover:text-yellow-400'
              }`}
              onClick={() => toggleCategory(cat)}
            >
              <span className={isActive ? 'text-gray-900' : 'text-gray-400'}>
                {getCategoryIcon(cat)}
              </span>
              <span className="flex-1">{cat}</span>
              {isActive && (
                <span className="text-xs bg-gray-900 bg-opacity-20 px-2 py-1 rounded-full">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {selected.length > 0 && (
        <button
          onClick={() => selected.forEach(cat => toggleCategory(cat))}
          className="w-full mt-2 text-xs text-gray-400 hover:text-red-400 transition-colors py-1"
        >
          Clear categories
        </button>
      )}
    </div>
  );
}

export default memo(CategoryFilter);