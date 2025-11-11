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

    console.log(`🔍 fetchPaginated - Making API call to ${endpoint} with params:`, params);

    const response = await api.get(endpoint, { params });
    
    console.log(`🔍 fetchPaginated - API response status:`, response.status);
    const responseData = response.data;
    
    console.log(`🔍 fetchPaginated response for ${endpoint}:`, {
      hasData: !!responseData,
      hasDataData: !!responseData?.data,
      hasDataDataData: !!responseData?.data?.data,
      hasDataDataMeta: !!responseData?.data?.meta,
      statusCode: responseData?.statusCode,
      responseKeys: responseData ? Object.keys(responseData) : [],
      dataType: typeof responseData?.data,
      dataDataType: typeof responseData?.data?.data,
      isDataArray: Array.isArray(responseData?.data?.data),
      dataLength: responseData?.data?.data?.length,
    });
    
    // Standard backend response format: { statusCode, message, data: { data: [...], meta: {...} }, timestamp }
    let data: T[] = [];
    let meta: any = {};

    // Check response structure: { statusCode, message, data: { data: [...], meta: {...} }, timestamp }
    // Backend returns: { statusCode: 200, data: { data: [...], meta: {...} } }
    
    // Priority 1: Standard format with both data.data and data.meta
    if (responseData?.data?.data && Array.isArray(responseData.data.data) && responseData.data?.meta) {
      // Extract data and meta from nested structure
      data = responseData.data.data;
      meta = responseData.data.meta;
      console.log(`✅ Extracted ${data.length} items from standard format, total: ${meta.total}, page: ${meta.page}`);
    } 
    // Priority 2: Has statusCode and data.data array (meta might be missing)
    else if (responseData?.statusCode === 200 && responseData?.data?.data && Array.isArray(responseData.data.data)) {
      // Handle case where response has statusCode wrapper but meta might be missing
      data = responseData.data.data;
      meta = responseData.data.meta || {
        total: data.length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil(data.length / (params.limit || 10)),
      };
      console.log(`✅ Extracted ${data.length} items from statusCode wrapper, total: ${meta.total}, page: ${meta.page}`);
    }
    // Priority 3: Direct data array (no nesting)
    else if (responseData?.data && Array.isArray(responseData.data)) {
      // Fallback: direct array in data
      data = responseData.data;
      meta = {
        total: data.length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil(data.length / (params.limit || 10)),
      };
      console.log(`⚠️ Using fallback format: ${data.length} items`);
    } else {
      console.warn(`⚠️ Unexpected response format for ${endpoint}. Expected { data: { data: [...], meta: {...} } }`);
      console.warn('Received:', JSON.stringify(responseData, null, 2));
    }

    const result: PaginatedResult<T> = {
      items: data,
      total: meta.total || 0,
      page: meta.page || page,
      limit: meta.limit || limit,
      totalPages: meta.totalPages || 0,
    };

    console.log(`✅ fetchPaginated - Successfully parsed result:`, {
      itemsCount: result.items.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });

    return result;
  } catch (error: any) {
    console.error(`❌ Error fetching paginated data from ${endpoint}:`, error);
    console.error('❌ Error details:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      config: {
        url: error?.config?.url,
        method: error?.config?.method,
        params: error?.config?.params,
      },
    });
    
    // Throw error instead of returning empty result to allow proper error handling
    throw error;
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
