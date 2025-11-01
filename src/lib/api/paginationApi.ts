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
    console.log(`🔍 fetchPaginated called for ${endpoint}`);
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
    
    // Standard backend response format: { statusCode, message, data: { data: [...], meta: {...} }, timestamp }
    let data: T[] = [];
    let meta: any = {};

    if (responseData.data?.data && responseData.data?.meta) {
      // Extract data and meta from nested structure
      data = responseData.data.data;
      meta = responseData.data.meta;
    } else {
      console.warn(`⚠️ Unexpected response format for ${endpoint}. Expected { data: { data: [...], meta: {...} } }`);
      console.warn('Received:', responseData);
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
