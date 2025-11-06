import { api } from '../lib/api';

// Types for Voucher entities based on backend DTOs

export interface UpdateVoucherDto extends Partial<CreateVoucherDto> {}
export interface CreateVoucherDto {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit: number;
  usageLimitPerUser?: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  allowedUsers?: string[];
  allowedCategories?: string[];
}
export interface ValidateVoucherDto {
  code: string;
  orderValue?: number;
  userId?: string;
}

export interface ApplyVoucherDto {
  code: string;
  orderValue: number;
  userId?: string;
  orderId: string;
}

export interface VoucherQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'expired' | 'used_up';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Voucher {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  usageLimitPerUser: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired' | 'used_up';
  isActive: boolean;
  allowedUsers?: string[];
  allowedCategories?: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedVoucher {
  items: Voucher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VoucherStats {
  totalVouchers: number;
  activeVouchers: number;
  expiredVouchers: number;
  totalUsage: number;
  totalDiscountGiven: number;
}

// Voucher API Functions
export const voucherApi = {
  // Create new voucher
  createVoucher: async (data: CreateVoucherDto): Promise<Voucher> => {
    try{
      
      // Check auth headers
      const token = localStorage.getItem('accessToken');
  
      
      const response = await api.post<Voucher>('/vouchers', data, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating voucher:', error);
      console.error('📋 Request details:', {
        url: '/vouchers',
        method: 'POST',
        data,
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
        responseData: (error as any)?.response?.data,
        headers: (error as any)?.config?.headers
      });
      throw error;
    }
  },

  // Get paginated vouchers with filters
  getVouchers: async (query: VoucherQueryDto = {}): Promise<PaginatedVoucher> => {
    try {
      const params = new URLSearchParams();
      
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.search) params.append('search', query.search);
      if (query.status) params.append('status', query.status);
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.sortOrder) params.append('sortOrder', query.sortOrder);

      const response = await api.get(`/vouchers?${params.toString()}`);

      // Handle standardized pagination response format
      if (response.data.data) {
        const { data: results, meta } = response.data;
        return {
          items: results || [],
          total: meta?.total || results?.length || 0,
          page: meta?.page || query.page || 1,
          limit: meta?.limit || query.limit || 10,
          totalPages: meta?.totalPages || Math.ceil((meta?.total || 0) / (query.limit || 10))
        };
      }

      // Handle legacy format
      return {
        items: response.data.vouchers || response.data || [],
        total: response.data.total || 0,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: response.data.totalPages || 0
      };
    } catch (error) {
      console.error('❌ Error fetching vouchers:', error);
      throw error;
    }
  },

  // Get active vouchers (public endpoint)
  getActiveVouchers: async (): Promise<Voucher[]> => {
    try {
      const response = await api.get('/vouchers/active');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('❌ Error fetching active vouchers:', error);
      throw error;
    }
  },

  // Get voucher by ID
  getVoucherById: async (id: string): Promise<Voucher> => {
    try {
      const response = await api.get<Voucher>(`/vouchers/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching voucher by ID:', error);
      throw error;
    }
  },

  // Get voucher by code
  getVoucherByCode: async (code: string): Promise<Voucher> => {
    try {
      const response = await api.get<Voucher>(`/vouchers/code/${code}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching voucher by code:', error);
      throw error;
    }
  },

  // Update voucher
  updateVoucher: async (id: string, data: UpdateVoucherDto): Promise<Voucher> => {
    try {
      const response = await api.patch<Voucher>(`/vouchers/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating voucher:', error);
      throw error;
    }
  },

  // Delete voucher
  deleteVoucher: async (id: string): Promise<void> => {
    try {
      await api.delete(`/vouchers/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Validate voucher before applying
  validateVoucher: async (data: ValidateVoucherDto): Promise<{
    valid: boolean;
    voucher?: Voucher;
    message?: string;
    discountAmount?: number;
  }> => {
    try {
      const response = await api.post('/vouchers/validate', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error validating voucher:', error);
      throw error;
    }
  },

  // Apply voucher to order
  applyVoucher: async (data: ApplyVoucherDto): Promise<{
    success: boolean;
    discountAmount: number;
    finalAmount: number;
    message?: string;
  }> => {
    try {
      const response = await api.post('/vouchers/apply', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error applying voucher:', error);
      throw error;
    }
  },

  // Use voucher (mark as used)
  useVoucher: async (code: string): Promise<{
    success: boolean;
    message: string;
    remainingUses?: number;
  }> => {
    try {
      const response = await api.post(`/vouchers/use/${code}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error using voucher:', error);
      throw error;
    }
  },

  // Get voucher statistics
  getVoucherStats: async (): Promise<VoucherStats> => {
    try {
      const response = await api.get('/vouchers/stats');
      return response.data.data || response.data || {
        totalVouchers: 0,
        activeVouchers: 0,
        expiredVouchers: 0,
        totalUsage: 0,
        totalDiscountGiven: 0
      };
    } catch (error) {
      console.error('❌ Error fetching voucher stats:', error);
      // Return default stats if API fails
      return {
        totalVouchers: 0,
        activeVouchers: 0,
        expiredVouchers: 0,
        totalUsage: 0,
        totalDiscountGiven: 0
      };
    }
  },

  // Update expired vouchers (admin function)
  updateExpiredVouchers: async (): Promise<{
    success: boolean;
    updated: number;
    message: string;
  }> => {
    try {
      const response = await api.post('/vouchers/update-expired');
      return response.data;
    } catch (error) {
      console.error('❌ Error updating expired vouchers:', error);
      throw error;
    }
  }
};

// Export individual functions for backward compatibility
export const {
  createVoucher,
  getVouchers,
  getActiveVouchers,
  getVoucherById,
  getVoucherByCode,
  updateVoucher,
  deleteVoucher,
  validateVoucher,
  applyVoucher,
  useVoucher,
  getVoucherStats,
  updateExpiredVouchers
} = voucherApi;

export default voucherApi;
