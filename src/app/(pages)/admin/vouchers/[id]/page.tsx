"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUpdateVoucher, useVoucherDetail } from '@/src/hooks/useVouchers';
import { toast } from '@/src/lib/utils/toast';
import { AdminLayout } from '@/src/components/layout';
import { ArrowLeft, Calendar, Users, TrendingUp } from 'lucide-react';
import { Voucher } from '@/src/Types';

export default function EditVoucherPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data, isLoading, error } = useVoucherDetail(id);
  const { update, loading } = useUpdateVoucher();

  // Helper to convert ISO date to datetime-local format
  const isoToDatetimeLocal = (isoString: string): string => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const mapInitialToForm = (data?: Partial<Voucher>) => {
    if (!data) {
      return {
        code: "",
        name: "",
        discountType: "percentage" as any,
        discountValue: 0,
        startDate: "",
        endDate: "",
        usageLimit: 1,
        isActive: true,
        minOrderTotal: 0,
        maxDiscount: undefined,
      };
    }

    const backendType = (data as any).type || data.discountType;
    const discountType = backendType === "fixed_amount" ? "fixed" : (backendType || "percentage");
    
    return {
      code: data.code || "",
      name: (data as any).name || "",
      discountType: discountType as any,
      discountValue: (data as any).value ?? data.discountValue ?? 0,
      startDate: data.startDate ? (data.startDate.includes('T') ? isoToDatetimeLocal(data.startDate) : data.startDate) : "",
      endDate: data.endDate ? (data.endDate.includes('T') ? isoToDatetimeLocal(data.endDate) : data.endDate) : "",
      usageLimit: data.usageLimit ?? 1,
      isActive: data.isActive ?? true,
      minOrderTotal: (data as any).minOrderValue ?? data.minOrderTotal ?? 0,
      maxDiscount: data.maxDiscount,
    };
  };

  const [form, setForm] = useState<Partial<Voucher>>(mapInitialToForm(data));

  useEffect(() => {
    if (data) {
      setForm(mapInitialToForm(data));
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    let val: any = value;
    if (type === "checkbox") val = checked;
    if (type === "number") val = value === "" ? undefined : Number(value);
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        code: form.code?.trim().toUpperCase(),
        name: (form as any).name?.trim() || form.code?.trim().toUpperCase() || "Voucher",
        type: form.discountType === "fixed" ? "fixed_amount" : (form.discountType || "percentage"),
        value: form.discountValue ?? 0,
        usageLimit: form.usageLimit ?? 1,
        minOrderValue: form.minOrderTotal ?? 0,
        maxDiscount: form.maxDiscount,
        isActive: form.isActive,
      };

      if (form.startDate) {
        const date = new Date(form.startDate);
        if (!isNaN(date.getTime())) {
          payload.startDate = date.toISOString();
        }
      }
      
      if (form.endDate) {
        const date = new Date(form.endDate);
        if (!isNaN(date.getTime())) {
          payload.endDate = date.toISOString();
        }
      }

      await toast.promise(
        update(id, payload),
        {
          pending: 'Updating voucher...',
          success: '✅ Voucher updated successfully!',
          error: (err) => `❌ ${err?.response?.data?.message || err?.message || 'Failed to update voucher'}`
        }
      );
      router.push('/admin/vouchers');
    } catch (e: any) {
      // Error already handled by toast.promise
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-200 border-t-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading voucher...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <p className="text-red-600 font-semibold">Failed to load voucher</p>
            <button
              onClick={() => router.push('/admin/vouchers')}
              className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/vouchers')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">✏️ Edit Voucher</h1>
            <p className="text-gray-600 mt-1">Update voucher details below</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-yellow-100 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-8 py-6 border-b border-yellow-100">
            <h2 className="text-xl font-bold text-gray-900">Voucher Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Voucher Code <span className="text-red-500">*</span>
                </label>
                <input
                  name="code"
                  value={form.code || ""}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none font-mono uppercase"
                  placeholder="e.g., SUMMER2024"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={(form as any).name || ""}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none"
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={form.discountType as any}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none bg-white"
                >
                  <option value="percentage">💯 Percentage</option>
                  <option value="fixed">💵 Fixed Amount</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Value
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={form.discountType === "percentage" ? 1 : 0.01}
                    name="discountValue"
                    value={form.discountValue ?? 0}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none"
                  />
                  {form.discountType === "percentage" && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">%</span>
                  )}
                </div>
                {form.discountType === "percentage" && (
                  <p className="text-xs text-gray-500 mt-1.5">💡 Value is in percentage (0 - 100)</p>
                )}
              </div>

              {/* Max Discount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Discount <span className="text-gray-400 text-xs">(for % only)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  name="maxDiscount"
                  value={form.maxDiscount ?? ""}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none"
                  placeholder="Optional"
                  disabled={form.discountType !== "percentage"}
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate || ""}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate || ""}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none"
                />
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Usage Limit <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  name="usageLimit"
                  value={form.usageLimit ?? ""}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none"
                  placeholder="e.g., 100"
                />
              </div>

              {/* Min Order Total */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Order Total
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  name="minOrderTotal"
                  value={form.minOrderTotal ?? 0}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none"
                />
              </div>

              {/* Active Checkbox */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-300 transition-all cursor-pointer bg-gray-50">
                  <input
                    id="isActive"
                    type="checkbox"
                    name="isActive"
                    checked={!!form.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-200"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Active Status</span>
                    <p className="text-xs text-gray-500">Enable this voucher for customer use</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin/vouchers')}
                className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "💾 Update Voucher"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

