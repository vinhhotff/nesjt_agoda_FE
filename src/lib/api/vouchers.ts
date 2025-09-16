import { api } from '../api';
import { ApplyVoucherPayload, ApplyVoucherResponse, PaginatedVoucher, Voucher } from '@/src/Types';
import { fetchPaginated, PaginationQuery, PaginatedResult } from './paginationApi';

// Cập nhật để sử dụng chuẩn pagination mới
export async function listVouchers(
  page: number = 1, 
  limit: number = 10, 
  search: string = '',
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<PaginatedResult<Voucher>> {
  const query: PaginationQuery = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  if (search) {
    query.search = search;
  }

  return await fetchPaginated<Voucher>('/vouchers', query);
}

// Backward compatibility wrapper
export async function listVouchersLegacy(page: number = 1, limit: number = 10, qs: string = ''): Promise<PaginatedVoucher> {
  // Convert legacy qs to search parameter
  let search = '';
  if (qs) {
    // Parse legacy qs format if needed
    search = qs;
  }
  
  const result = await listVouchers(page, limit, search);
  
  return {
    items: result.items,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
}

export async function getVoucher(id: string): Promise<Voucher> {
  const res = await api.get(`/vouchers/${id}`);
  return res.data.data || res.data;
}

export async function createVoucher(payload: Partial<Voucher>): Promise<Voucher> {
  const res = await api.post('/vouchers', payload);
  return res.data.data || res.data;
}

export async function updateVoucher(id: string, payload: Partial<Voucher>): Promise<Voucher> {
  const res = await api.patch(`/vouchers/${id}`, payload);
  return res.data.data || res.data;
}

export async function deleteVoucher(id: string): Promise<void> {
  await api.delete(`/vouchers/${id}`);
}

export async function applyVoucher(payload: ApplyVoucherPayload): Promise<ApplyVoucherResponse> {
  const res = await api.post('/vouchers/apply', payload);
  return res.data.data || res.data;
}

