import { api } from './callApi';

export interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  favicon?: string;
  coverImage?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    zipCode?: string;
  };
  socialLinks?: Record<string, string>;
  businessHours?: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
  homepageTitle?: string;
  homepageSubtitle?: string;
  homepageDescription?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  payment?: {
    currency: string;
    currencySymbol: string;
    taxRate: number;
    serviceCharge: number;
  };
  features?: {
    enableReservation: boolean;
    enableDelivery: boolean;
    enableQROrder: boolean;
    enableLoyalty: boolean;
  };
  domain?: string;
  subdomain?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const restaurantAPI = {
  // Get default restaurant settings
  getDefault: async (): Promise<Restaurant> => {
    const response = await api.get<Restaurant>('/restaurants/default');
    return response.data;
  },

  // Get restaurant by ID
  getById: async (id: string): Promise<Restaurant> => {
    const response = await api.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  },

  // Get restaurant by domain
  getByDomain: async (domain: string): Promise<Restaurant> => {
    const response = await api.get<Restaurant>('/restaurants', {
      params: { domain },
    });
    return response.data;
  },

  // Get restaurant by subdomain
  getBySubdomain: async (subdomain: string): Promise<Restaurant> => {
    const response = await api.get<Restaurant>('/restaurants', {
      params: { subdomain },
    });
    return response.data;
  },

  // Get all restaurants
  getAll: async (): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>('/restaurants');
    return response.data;
  },

  // Create restaurant
  create: async (data: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.post<Restaurant>('/restaurants', data);
    return response.data;
  },

  // Update restaurant
  update: async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.patch<Restaurant>(`/restaurants/${id}`, data);
    return response.data;
  },

  // Delete restaurant
  delete: async (id: string): Promise<void> => {
    await api.delete(`/restaurants/${id}`);
  },
};

