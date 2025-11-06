"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import VoucherForm from '@/src/components/admin/Voucher/VoucherForm';
import { useUpdateVoucher, useVoucherDetail } from '@/src/hooks/useVouchers';
import { toast } from 'react-toastify';

export default function EditVoucherPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data, isLoading, error } = useVoucherDetail(id);
  const { update, loading } = useUpdateVoucher();

  if (isLoading) return <div className="p-6">Loading voucher...</div>;
  if (error || !data) return <div className="p-6 text-red-600">Failed to load voucher</div>;

  const onSubmit = async (payload: any) => {
    try {
      await update(id, payload);
      toast.success('Voucher updated');
      router.push('/admin/vouchers');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to update voucher');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Edit Voucher</h1>
      <div className="p-4 border rounded bg-white">
        <VoucherForm 
          open={true} 
          initial={data} 
          onSubmit={onSubmit} 
          onClose={() => router.push('/admin/vouchers')} 
        />
      </div>
    </div>
  );
}

