import { api } from '../api';
import { ApplyVoucherPayload, ApplyVoucherResponse, PaginatedVoucher, Voucher } from '@/src/Types';

export async function listVouchers(page: number = 1, limit: number = 10, qs: string = ''): Promise<PaginatedVoucher> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (qs) params.append('qs', qs);

  const res = await api.get(`/vouchers?${params.toString()}`);
  const data = res.data.data || res.data; // ResponseInterceptor may wrap data
  const results = data.results || data.items || [];
  const meta = data.meta || data.pagination || { total: results.length, page, limit, totalPages: 1 };

  return {
    items: results,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
    totalPages: meta.totalPages,
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

