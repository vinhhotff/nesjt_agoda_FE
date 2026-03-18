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

// Default restaurant values to avoid blocking UI
const defaultRestaurant: Restaurant = {
  _id: '',
  name: 'Restaurant',
  description: '',
  isActive: true,
  createdAt: '',
  updatedAt: '',
  homepageTitle: 'Welcome to Foodies',
  homepageSubtitle: 'Fine Dining',
  homepageDescription: 'Experience exceptional dining with our carefully curated menu and outstanding service.',
  contact: {
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
  },
  colors: {
    primary: '#f59e0b',
    secondary: '#10b981',
    accent: '#3b82f6',
    background: '#ffffff'
  }
};

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(defaultRestaurant);
  const [loading, setLoading] = useState(true);

  const loadRestaurant = async () => {
    try {
      const data = await restaurantAPI.getDefault();
      setRestaurant(data);
      
      if (data.colors) {
        const root = document.documentElement;
        root.style.setProperty('--agoda-primary', data.colors.primary);
        root.style.setProperty('--agoda-secondary', data.colors.secondary);
        root.style.setProperty('--agoda-accent', data.colors.accent);
        root.style.setProperty('--agoda-background', data.colors.background);
      }
    } catch (error) {
      console.error('Error loading restaurant:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurant();
  }, []);

  // Non-blocking: always render children, don't show loading spinner
  return (
    <RestaurantContext.Provider value={{ restaurant, loading, refresh: loadRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}

// Server-side function to fetch restaurant data (for use in Server Components)
export async function getRestaurantData(): Promise<Restaurant | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/restaurants/default`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching restaurant data:', error);
    return null;
  }
}
