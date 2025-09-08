import { api } from '@/utils/axiosClient';

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  price: number;
  available: boolean;
  category: string;
  preparationTime?: number;
  tag?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  createdBy?: {
    _id: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MenuPaginationResponse {
  results: MenuItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MenuFilters {
  category?: string;
  search?: string;
  tag?: string[];
  isVegan?: boolean;
  isVegetarian?: boolean;
  available?: boolean;
}

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  price: number;
  category: string;
  preparationTime?: number;
  tag?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  available?: boolean;
}

export interface UpdateMenuItemDto extends Partial<CreateMenuItemDto> {}

class MenuAPI {
  private baseUrl = '/menu-items';

  // Build query string from filters
  private buildQueryString(filters: MenuFilters): string {
    const queryParams: string[] = [];

    if (filters.category) {
      queryParams.push(`category=${encodeURIComponent(filters.category)}`);
    }

    if (filters.search) {
      queryParams.push(`search=${encodeURIComponent(filters.search)}`);
    }

    if (filters.tag && filters.tag.length > 0) {
      // For multiple tags, we can either:
      // 1. Send each tag separately: tag=tag1,tag=tag2
      // 2. Send as comma-separated: tag=tag1,tag2
      // Based on backend logic, using option 2
      queryParams.push(`tag=${encodeURIComponent(filters.tag.join(','))}`);
    }

    if (filters.isVegan !== undefined) {
      queryParams.push(`isVegan=${filters.isVegan}`);
    }

    if (filters.isVegetarian !== undefined) {
      queryParams.push(`isVegetarian=${filters.isVegetarian}`);
    }

    if (filters.available !== undefined) {
      queryParams.push(`available=${filters.available}`);
    }

    return queryParams.join(',');
  }

  // Get paginated menu items with filters
  async getMenuItems(
    page: number = 1,
    limit: number = 10,
    filters: MenuFilters = {}
  ): Promise<MenuPaginationResponse> {
    const qs = this.buildQueryString(filters);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (qs) {
      params.append('qs', qs);
    }

    const response = await api.get(`${this.baseUrl}/paginate?${params.toString()}`);
    return response.data;
  }

  // Get all menu items (no pagination)
  async getAllMenuItems(): Promise<MenuItem[]> {
    const response = await api.get(`${this.baseUrl}`);
    return response.data;
  }

  // Get single menu item
  async getMenuItem(id: string): Promise<MenuItem> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get menu items by category
  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    const response = await api.get(`${this.baseUrl}/category/${category}`);
    return response.data;
  }

  // Get all categories
  async getCategories(): Promise<string[]> {
    const response = await api.get(`${this.baseUrl}/categories`);
    return response.data;
  }

  // Get menu items count
  async getMenuItemsCount(): Promise<{ total: number }> {
    const response = await api.get(`${this.baseUrl}/count`);
    return response.data;
  }

  // Admin functions
  async createMenuItem(
    data: CreateMenuItemDto,
    images?: File[]
  ): Promise<MenuItem> {
    const formData = new FormData();
    
    // Add form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item.toString());
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add images
    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await api.post(`${this.baseUrl}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateMenuItem(
    id: string,
    data: UpdateMenuItemDto,
    images?: File[]
  ): Promise<MenuItem> {
    const formData = new FormData();
    
    // Add form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item.toString());
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add images
    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await api.patch(`${this.baseUrl}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateMenuItemAvailability(
    id: string,
    available: boolean
  ): Promise<MenuItem> {
    const response = await api.put(`${this.baseUrl}/${id}/availability`, {
      available,
    });
    return response.data;
  }

  async deleteMenuItem(id: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async addMenuItemImages(id: string, images: File[]): Promise<MenuItem> {
    const formData = new FormData();
    images.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post(`${this.baseUrl}/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async removeMenuItemImage(
    id: string,
    filename: string
  ): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}/images/${filename}`);
    return response.data;
  }

  // Utility functions
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }

  getImageUrl(imageUrl?: string): string {
    if (!imageUrl) return '/placeholder-food.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.NEXT_PUBLIC_API_URL}/${imageUrl}`;
  }

  getAvailableTags(menuItems: MenuItem[]): string[] {
    const tagsSet = new Set<string>();
    menuItems.forEach(item => {
      if (item.tag) {
        item.tag.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }

  getAvailableCategories(menuItems: MenuItem[]): string[] {
    const categoriesSet = new Set<string>();
    menuItems.forEach(item => {
      if (item.category) {
        categoriesSet.add(item.category);
      }
    });
    return Array.from(categoriesSet).sort();
  }
}

export const menuAPI = new MenuAPI();
