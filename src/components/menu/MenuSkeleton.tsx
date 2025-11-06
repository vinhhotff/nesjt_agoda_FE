"use client";
import React from 'react';

interface MenuSkeletonProps {
  count?: number;
  className?: string;
}

const MenuSkeleton: React.FC<MenuSkeletonProps> = ({ count = 8, className = "" }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
          {/* Image skeleton */}
          <div className="h-48 bg-gray-700" />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="h-6 bg-gray-700 rounded w-3/4" />
            
            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-700 rounded w-2/3" />
            </div>
            
            {/* Info row */}
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-700 rounded w-20" />
              <div className="h-4 bg-gray-700 rounded w-16" />
            </div>
            
            {/* Tags */}
            <div className="flex gap-2">
              <div className="h-6 bg-gray-700 rounded-full w-16" />
              <div className="h-6 bg-gray-700 rounded-full w-12" />
            </div>
            
            {/* Price and button */}
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-gray-700 rounded w-20" />
              <div className="h-8 w-8 bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuSkeleton;
