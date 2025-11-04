"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
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
      await create(payload);
      toast.success("Voucher created");
      setOpen(false); // đóng modal sau khi tạo
      refresh();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to create voucher"
      );
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this voucher?")) return;
    try {
      await remove(id);
      toast.success("Voucher deleted");
      refresh();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to delete voucher"
      );
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create Voucher
            </button>
          }
        />

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600">Loading vouchers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-6">
            <p className="text-red-600 font-medium">Failed to load vouchers</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Vouchers ({items.length})
                </h3>
              </div>
              <div className="p-6">
                <VoucherTable items={items} onDelete={onDelete} />
              </div>
            </div>
            
            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-3">
                <button
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-100 rounded-lg font-medium text-gray-700">
                  Page {data.page} / {data.totalPages}
                </span>
                <button
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  disabled={page >= (data.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
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
