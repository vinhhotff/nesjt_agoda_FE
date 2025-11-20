'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { restaurantAPI, Restaurant } from '@/src/lib/api/restaurantApi';
import { LoadingSpinner } from '@/src/components/ui';

interface RestaurantContextType {
  restaurant: Restaurant | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType>({
  restaurant: null,
  loading: true,
  refresh: async () => {},
});

export const useRestaurant = () => useContext(RestaurantContext);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const data = await restaurantAPI.getDefault();
      setRestaurant(data);
      
      // Apply CSS variables for colors
      if (data.colors) {
        const root = document.documentElement;
        root.style.setProperty('--agoda-primary', data.colors.primary);
        root.style.setProperty('--agoda-secondary', data.colors.secondary);
        root.style.setProperty('--agoda-accent', data.colors.accent);
        root.style.setProperty('--agoda-background', data.colors.background);
      }
    } catch (error) {
      console.error('Error loading restaurant:', error);
      // Set default values if error
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurant();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        loading,
        refresh: loadRestaurant,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

