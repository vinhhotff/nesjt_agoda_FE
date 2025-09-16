import { api } from './callApi';

// Standard pagination query interface
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: any; // Additional filters
}

// Standard pagination response interface
export interface PaginationResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Standard frontend pagination result interface
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Standard pagination API call following the API specification:
 * 
 * Query format: ?page=2&limit=20&search=abc&sortBy=createdAt&sortOrder=desc
 * Response format: { data: [...], meta: { total, page, limit, totalPages } }
 * 
 * @param endpoint - API endpoint (e.g., '/user', '/orders', '/vouchers')
 * @param query - Pagination query parameters
 * @returns Promise<PaginatedResult<T>>
 */
export async function fetchPaginated<T = any>(
  endpoint: string, 
  query: PaginationQuery = {}
): Promise<PaginatedResult<T>> {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      ...filters
    } = query;

    // Build query parameters
    const params: Record<string, any> = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    // Add search parameter if provided
    if (search) {
      params.search = search;
    }

    // Add additional filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params[key] = filters[key];
      }
    });


    const response = await api.get(endpoint, { params });
    const responseData = response.data;
    // Handle different response formats
    let data: T[] = [];
    let meta: any = {};

    if (responseData.data && responseData.meta) {
      // Standard format: { data: [...], meta: { total, page, limit, totalPages } }
      data = responseData.data;
      meta = responseData.meta;
    } else if (responseData.data && responseData.data.data !== undefined) {
      // Current nested format: { statusCode, message, data: { data: [...], total, page, ... } }
      const nestedData = responseData.data;
      data = nestedData.data || [];
      
      // Extract pagination metadata - try different possible fields
      meta = {
        total: nestedData.total || nestedData.totalCount || data.length,
        page: nestedData.page || nestedData.currentPage || page,
        limit: nestedData.limit || nestedData.pageSize || limit,
        totalPages: nestedData.totalPages || Math.ceil((nestedData.total || data.length) / limit),
      };
      
    } else if (responseData.data && !responseData.data.data && (responseData.data.total !== undefined || Array.isArray(responseData.data))) {
      // Current User API format: { statusCode, message, data: [...] } - data directly contains users
      if (Array.isArray(responseData.data)) {
        data = responseData.data;
        meta = {
          total: responseData.total || data.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil((responseData.total || data.length) / limit),
        };
      } else {
        // Handle case where data is object with users info but users are at root level
        data = [];
        meta = {
          total: responseData.data.total || 0,
          page: responseData.data.page || page,
          limit: responseData.data.limit || limit,
          totalPages: responseData.data.totalPages || 0,
        };
      }
    } else if (responseData.data && responseData.data.roles) {
      // Special case for roles API: { statusCode, message, data: { roles: [...] } }
      data = responseData.data.roles || [];
      meta = {
        total: responseData.data.total || data.length,
        page: page,
        limit: limit,
        totalPages: responseData.data.totalPages || Math.ceil(data.length / limit),
      };
    } else if (responseData.orders) {
      // Legacy Order API format: { orders: [...], total, totalPages }
      data = responseData.orders;
      meta = {
        total: responseData.total || 0,
        page: page,
        limit: limit,
        totalPages: responseData.totalPages || 0,
      };
    } else if (Array.isArray(responseData)) {
      // Direct array response
      data = responseData;
      meta = {
        total: data.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(data.length / limit),
      };
    } else {
      // Fallback
      console.warn(`⚠️ Unexpected response format for ${endpoint}:`, responseData);
    }

    const result: PaginatedResult<T> = {
      items: data,
      total: meta.total || 0,
      page: meta.page || page,
      limit: meta.limit || limit,
      totalPages: meta.totalPages || 0,
    };

    return result;
  } catch (error) {
    console.error(`❌ Error fetching paginated data from ${endpoint}:`, error);
    return {
      items: [],
      total: 0,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: 0,
    };
  }
}

/**
 * Generic CRUD operations following the API specification
 */
export async function createItem<T = any>(endpoint: string, data: any): Promise<T> {
  const response = await api.post(endpoint, data);
  return response.data;
}

export async function updateItem<T = any>(endpoint: string, id: string, data: any): Promise<T> {
  const response = await api.patch(`${endpoint}/${id}`, data);
  return response.data;
}

export async function deleteItem(endpoint: string, id: string): Promise<void> {
  await api.delete(`${endpoint}/${id}`);
}

export async function getItem<T = any>(endpoint: string, id: string): Promise<T> {
  const response = await api.get(`${endpoint}/${id}`);
  return response.data;
}
