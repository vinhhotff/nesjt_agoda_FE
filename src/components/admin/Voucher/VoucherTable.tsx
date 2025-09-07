"use client";
import React from 'react';
import Link from 'next/link';
import { Voucher } from '@/src/Types';

interface Props {
  items: Voucher[];
  onDelete: (id: string) => void;
}

const VoucherTable: React.FC<Props> = ({ items, onDelete }) => {
  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Code</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Value</th>
            <th className="px-4 py-2 text-left">Active</th>
            <th className="px-4 py-2 text-left">Used/Limit</th>
            <th className="px-4 py-2 text-left">Valid</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((v) => (
            <tr key={v._id}>
              <td className="px-4 py-2 font-mono">{v.code}</td>
              <td className="px-4 py-2">{v.discountType}</td>
              <td className="px-4 py-2">
                {v.discountType === 'percentage' ? `${v.discountValue}%` : `${v.discountValue}`}
                {v.maxDiscount ? ` (max ${v.maxDiscount})` : ''}
              </td>
              <td className="px-4 py-2">{v.isActive ? 'Yes' : 'No'}</td>
              <td className="px-4 py-2">{v.usedCount}/{v.usageLimit ?? '∞'}</td>
              <td className="px-4 py-2">
                {v.startDate ? new Date(v.startDate).toLocaleString() : '—'}
                {' → '}
                {v.endDate ? new Date(v.endDate).toLocaleString() : '—'}
              </td>
              <td className="px-4 py-2 space-x-2">
                <Link href={`/admin/vouchers/${v._id}`} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</Link>
                <button onClick={() => onDelete(v._id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VoucherTable;

