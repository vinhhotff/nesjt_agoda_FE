"use client";

import React, { useMemo, useState } from "react";
import { toast } from "@/src/lib/utils/toast";
import VoucherTable from "@/src/components/admin/Voucher/VoucherTable";
import {
  useCreateVoucher,
  useDeleteVoucher,
  useVouchersList,
} from "@/src/hooks/useVouchers";
import { AdminLayout } from "@/src/components/layout";
import AdminPageHeader from "@/src/components/admin/common/AdminPageHeader";
import ModalVoucherForm from "@/src/components/admin/Voucher/VoucherForm";
import { Ticket, Plus } from "lucide-react";

export default function AdminVouchersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, error, refresh } = useVouchersList(page, limit);
  const { create, loading: creating } = useCreateVoucher();
  const { remove, loading: removing } = useDeleteVoucher();
  const [open, setOpen] = useState(false);

  const items = useMemo(() => data?.items || [], [data]);

  const onCreate = async (payload: any) => {
    try {
      await toast.promise(
        create(payload),
        {
          pending: 'Creating voucher...',
          success: '✅ Voucher created successfully!',
          error: (err) => `❌ ${err?.response?.data?.message || err?.message || 'Failed to create voucher'}`
        }
      );
      setOpen(false);
      refresh();
    } catch (e: any) {
      // Error already handled by toast.promise
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this voucher?")) return;
    try {
      await toast.promise(
        remove(id),
        {
          pending: 'Deleting voucher...',
          success: '✅ Voucher deleted successfully!',
          error: (err) => `❌ ${err?.response?.data?.message || err?.message || 'Failed to delete voucher'}`
        }
      );
      refresh();
    } catch (e: any) {
      // Error already handled by toast.promise
    }
  };

  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="Voucher Management"
          description="Create and manage discount vouchers for your customers"
          icon={<Ticket className="w-6 h-6 text-white" />}
          action={
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-amber-600 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create Voucher
            </button>
          }
        />

        {isLoading ? (
          <div className="bg-white rounded-3xl shadow-xl border border-yellow-100 p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-200 border-t-yellow-500 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading vouchers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <p className="text-red-600 font-semibold text-lg">Failed to load vouchers</p>
                <p className="text-red-500 text-sm">Please try again later</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl shadow-xl border border-yellow-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-yellow-100 bg-gradient-to-r from-yellow-50 to-amber-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    🎟️ All Vouchers
                  </h3>
                  <span className="px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold border-2 border-yellow-200">
                    {items.length} {items.length === 1 ? 'voucher' : 'vouchers'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <VoucherTable items={items} onDelete={onDelete} />
              </div>
            </div>
            
            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-4">
                <button
                  className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-sm hover:shadow-md"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Previous
                </button>
                <span className="px-6 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl font-bold text-gray-700">
                  Page {data.page} / {data.totalPages}
                </span>
                <button
                  className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-sm hover:shadow-md"
                  disabled={page >= (data.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal Create Voucher */}
        <ModalVoucherForm
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={onCreate}
        />
      </div>
    </AdminLayout>
  );
}
