import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { ApplyVoucherPayload, ApplyVoucherResponse, PaginatedVoucher, Voucher } from '@/src/Types';
import { applyVoucher as applyVoucherApi, createVoucher, deleteVoucher, getVoucher, listVouchers, updateVoucher } from '@/src/lib/api/vouchers';

export function useVouchersList(page: number = 1, limit: number = 10, qs: string = '') {
  const key = [`/vouchers`, page, limit, qs].join(':');
  const { data, error, isLoading } = useSWR<PaginatedVoucher>(key, () => listVouchers(page, limit, qs));
  return {
    data,
    error,
    isLoading,
    refresh: () => mutate(key),
  };
}

export function useVoucherDetail(id?: string) {
  const key = id ? `/vouchers/${id}` : null;
  const { data, error, isLoading } = useSWR<Voucher>(key, () => getVoucher(id!));
  return { data, error, isLoading };
}

export function useCreateVoucher() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (payload: Partial<Voucher>) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createVoucher(payload);
      await mutate((key: string) => key?.startsWith('/vouchers'), undefined, { revalidate: true });
      return res;
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useUpdateVoucher() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (id: string, payload: Partial<Voucher>) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updateVoucher(id, payload);
      await mutate(`/vouchers/${id}`);
      await mutate((key: string) => key?.startsWith('/vouchers'), undefined, { revalidate: true });
      return res;
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

export function useDeleteVoucher() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const remove = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteVoucher(id);
      await mutate((key: string) => key?.startsWith('/vouchers'), undefined, { revalidate: true });
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
}

export function useApplyVoucher() {
  const [data, setData] = useState<ApplyVoucherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = async (payload: ApplyVoucherPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await applyVoucherApi(payload);
      setData(res);
      return res;
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'Failed to apply voucher';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => setData(null);

  return { data, loading, error, apply, clear };
}

