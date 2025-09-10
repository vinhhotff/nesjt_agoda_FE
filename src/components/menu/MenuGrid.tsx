"use client";
import React from 'react';
import Image from 'next/image';
import { MenuItem, menuAPI } from '@/src/services/menuApi';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Clock, Leaf, Carrot } from 'lucide-react';
import { toast } from 'react-toastify';

interface MenuGridProps {
  items: MenuItem[];
  className?: string;
  onAddToCart?: (item: MenuItem) => void;
  loading?: boolean;
}

const MenuGrid: React.FC<MenuGridProps> = ({ 
  items, 
  className = "",
  onAddToCart,
  loading = false
}) => {
  const handleAddToCart = (item: MenuItem) => {
    if (!item.available) {
      toast.error(`${item.name} is currently unavailable`);
      return;
    }
    if (onAddToCart) {
      onAddToCart(item);
    } else {
      toast.success(`Added ${item.name} to favorites!`);
    }
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
              <div className="h-8 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No dishes found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {items.map((item) => (
        <div
          key={item._id}
          className={`
            bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300
            border border-gray-200 dark:border-gray-700 overflow-hidden group
            ${!item.available ? 'opacity-60' : ''}
          `}
        >
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src={item.images?.[0] || '/default-dish.jpg'}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {!item.available && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Unavailable
                </span>
              </div>
            )}
            {/* Dietary badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {item.isVegan && (
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                  Vegan
                </span>
              )}
              {item.isVegetarian && !item.isVegan && (
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Vegetarian
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 flex-1">
                {item.name}
              </h3>
              <div className="ml-3 text-right">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {item.price.toLocaleString()} VND
                </p>
              </div>
            </div>
            
            {item.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                {item.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{item.category}</span>
                {item.preparationTime && (
                  <>
                    <span>•</span>
                    <span>{item.preparationTime} min</span>
                  </>
                )}
              </div>
              
              <button
                onClick={() => handleAddToCart(item)}
                disabled={!item.available}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${item.available
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {item.available ? 'Add to Cart' : 'Unavailable'}
              </button>
            </div>

            {/* Tags */}
            {item.tag && item.tag.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {item.tag.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {item.tag.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                    +{item.tag.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuGrid;
