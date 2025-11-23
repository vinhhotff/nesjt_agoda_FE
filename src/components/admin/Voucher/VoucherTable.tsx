"use client";
import React from 'react';
import Link from 'next/link';
import { Voucher } from '@/src/Types';
import { Pencil, Trash2, Calendar, Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  items: Voucher[];
  onDelete: (id: string) => void;
}

const VoucherTable: React.FC<Props> = ({ items, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-3xl shadow-xl border border-yellow-100/50 bg-white/80 backdrop-blur-sm">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50">
            <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700">
              🎟️ Code
            </th>
            <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700">
              Type
            </th>
            <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700">
              Value
            </th>
            <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700">
              Status
            </th>
            <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700">
              Usage
            </th>
            <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700">
              Valid Period
            </th>
            <th className="px-6 py-4 text-center font-bold text-xs uppercase tracking-wider text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <AnimatePresence>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-12 text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">🎟️</span>
                    </div>
                    <p className="font-semibold">No vouchers found</p>
                    <p className="text-sm">Create a new voucher to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((v, index) => (
                <motion.tr
                  key={v._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-gradient-to-r hover:from-yellow-50 hover:to-transparent transition-all duration-300"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-900 bg-yellow-100 px-3 py-1.5 rounded-lg border-2 border-yellow-200">
                      {v.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      v.discountType === 'percentage' 
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
                        : 'bg-green-100 text-green-700 border-2 border-green-200'
                    }`}>
                      {v.discountType === 'percentage' ? '💯 Percentage' : '💵 Fixed'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                        {v.discountType === 'percentage' ? `${v.discountValue}%` : `$${v.discountValue}`}
                      </span>
                      {v.maxDiscount && (
                        <span className="text-xs text-gray-500">max ${v.maxDiscount}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {v.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-100 text-green-700 border-2 border-green-200 shadow-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 border-2 border-gray-200 shadow-sm">
                        <span className="w-2 h-2 bg-gray-500 rounded-full" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {v.usedCount}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">
                        {v.usageLimit ?? '∞'}
                      </span>
                    </div>
                    {v.usageLimit && (
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-amber-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(((v.usedCount || 0) / v.usageLimit) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-green-500" />
                        <span>{v.startDate ? new Date(v.startDate).toLocaleDateString() : '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-red-500" />
                        <span>{v.endDate ? new Date(v.endDate).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link 
                        href={`/admin/vouchers/${v._id}`}
                        className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-600 transition-all hover:scale-110 shadow-sm hover:shadow-md"
                        title="Edit voucher"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => onDelete(v._id)}
                        className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 transition-all hover:scale-110 shadow-sm hover:shadow-md"
                        title="Delete voucher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default VoucherTable;

