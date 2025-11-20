"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Voucher } from "@/src/Types";

interface Props {
  open: boolean;
  initial?: Partial<Voucher>;
  onSubmit: (payload: Partial<Voucher>) => Promise<void> | void;
  onClose: () => void;
}

const ModalVoucherForm: React.FC<Props> = ({ open, initial, onSubmit, onClose }) => {
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

  // Map backend format to frontend form format
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

    // Backend returns: name, type, value, minOrderValue
    // Frontend form uses: discountType, discountValue, minOrderTotal
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

  const [form, setForm] = useState<Partial<Voucher>>(mapInitialToForm(initial));
  const [submitting, setSubmitting] = useState(false);

  // Update form when initial changes (for edit mode) or when modal opens
  useEffect(() => {
    if (open) {
      setForm(mapInitialToForm(initial));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    let val: any = value;
    if (type === "checkbox") val = checked;
    if (type === "number") val = value === "" ? undefined : Number(value);
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Map frontend form to backend DTO format
      const payload: any = {
        code: form.code?.trim().toUpperCase(),
        name: (form as any).name?.trim() || form.code?.trim().toUpperCase() || "Voucher", // Required by backend - use code as fallback if name not provided
        type: form.discountType === "fixed" ? "fixed_amount" : (form.discountType || "percentage"),
        value: form.discountValue ?? 0,
        usageLimit: form.usageLimit ?? 1,
        minOrderValue: form.minOrderTotal ?? 0, // Map minOrderTotal → minOrderValue
        maxDiscount: form.maxDiscount,
        isActive: form.isActive,
      };

      // Handle dates - convert datetime-local format to ISO string format required by backend
      if (form.startDate) {
        // datetime-local format: "YYYY-MM-DDTHH:mm"
        // Convert to ISO string: "YYYY-MM-DDTHH:mm:ss.sssZ"
        try {
          const date = new Date(form.startDate);
          if (!isNaN(date.getTime())) {
            payload.startDate = date.toISOString();
          } else {
            throw new Error("Invalid start date");
          }
        } catch (error) {
          console.error("Error converting startDate:", error);
          throw new Error("Invalid start date format");
        }
      }
      
      if (form.endDate) {
        try {
          const date = new Date(form.endDate);
          if (!isNaN(date.getTime())) {
            payload.endDate = date.toISOString();
          } else {
            throw new Error("Invalid end date");
          }
        } catch (error) {
          console.error("Error converting endDate:", error);
          throw new Error("Invalid end date format");
        }
      }
  
      await onSubmit(payload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };
  

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-yellow-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-8 py-6 border-b border-yellow-100">
              <h2 className="text-2xl font-bold text-gray-900">
                {initial ? "✏️ Edit Voucher" : "🎟️ Create Voucher"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {initial ? "Update voucher details below" : "Fill in the details to create a new voucher"}
              </p>
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

                {/* Name - Required by backend */}
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
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {initial ? "💾 Update Voucher" : "✨ Create Voucher"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalVoucherForm;
