"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Voucher } from "@/src/Types";

interface Props {
  open: boolean;
  initial?: Partial<Voucher>;
  onSubmit: (payload: Partial<Voucher>) => Promise<void> | void;
  onClose: () => void;
}

const ModalVoucherForm: React.FC<Props> = ({ open, initial, onSubmit, onClose }) => {
  const [form, setForm] = useState<Partial<Voucher>>({
    code: initial?.code || "",
    discountType: (initial?.discountType as any) || "percentage",
    discountValue: initial?.discountValue ?? 0,
    startDate: initial?.startDate || "",
    endDate: initial?.endDate || "",
    usageLimit: initial?.usageLimit,
    isActive: initial?.isActive ?? true,
    minOrderTotal: initial?.minOrderTotal ?? 0,
    maxDiscount: initial?.maxDiscount,
  });
  const [submitting, setSubmitting] = useState(false);

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
      const payload: Partial<Voucher> = {
        code: form.code?.trim().toUpperCase(),
        type: form.discountType === "fixed" ? "fixed_amount" : form.discountType,
        value: form.discountValue ?? 0,
        usageLimit: form.usageLimit ?? 1,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : "",
        endDate: form.endDate ? new Date(form.endDate).toISOString() : "",
        minOrderValue: form.minOrderTotal ?? 0,
        maxDiscount: form.maxDiscount,
        isActive: form.isActive,
      } as any;
  
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
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              {initial ? "Edit Voucher" : "Create Voucher"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium">Code</label>
                  <input
                    name="code"
                    value={form.code || ""}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium">Discount Type</label>
                  <select
                    name="discountType"
                    value={form.discountType as any}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-sm font-medium">Discount Value</label>
                  <input
                    type="number"
                    min={0}
                    name="discountValue"
                    value={form.discountValue ?? 0}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                  {form.discountType === "percentage" && (
                    <p className="text-xs text-gray-500 mt-1">Value is in percentage (0 - 100)</p>
                  )}
                </div>

                {/* Max Discount */}
                <div>
                  <label className="block text-sm font-medium">Max Discount (only for %)</label>
                  <input
                    type="number"
                    min={0}
                    name="maxDiscount"
                    value={form.maxDiscount ?? ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Optional"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium">Start Date</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={form.startDate ? new Date(form.startDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium">End Date</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={form.endDate ? new Date(form.endDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-sm font-medium">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    name="usageLimit"
                    value={form.usageLimit ?? ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Optional"
                  />
                </div>

                {/* Min Order Total */}
                <div>
                  <label className="block text-sm font-medium">Min Order Total</label>
                  <input
                    type="number"
                    min={0}
                    name="minOrderTotal"
                    value={form.minOrderTotal ?? 0}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    name="isActive"
                    checked={!!form.isActive}
                    onChange={handleChange}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white"
                >
                  {submitting ? "Saving..." : "Save"}
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
