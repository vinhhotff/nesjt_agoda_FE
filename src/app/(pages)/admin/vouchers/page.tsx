"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import VoucherTable from "@/src/components/admin/Voucher/VoucherTable";
import {
  useCreateVoucher,
  useDeleteVoucher,
  useVouchersList,
} from "@/src/hooks/useVouchers";
import Aside from "@/src/components/admin/Aside";
import ModalVoucherForm from "@/src/components/admin/Voucher/VoucherForm";

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
    <div className="flex h-screen">
      {/* Aside */}
      <Aside />

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Voucher Management</h1>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded bg-emerald-600 text-white"
          >
            Create Voucher
          </button>
        </div>

        {isLoading ? (
          <p>Loading vouchers...</p>
        ) : error ? (
          <p className="text-red-600">Failed to load vouchers</p>
        ) : (
          <>
            <VoucherTable items={items} onDelete={onDelete} />
            {/* Simple pagination */}
            <div className="flex justify-end items-center gap-2 mt-4">
              <button
                className="px-3 py-1 border rounded"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <span>
                Page {data?.page} / {data?.totalPages}
              </span>
              <button
                className="px-3 py-1 border rounded"
                disabled={!!data && page >= (data.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Modal Create Voucher */}
        <ModalVoucherForm
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={onCreate}
        />
      </main>
    </div>
  );
}
