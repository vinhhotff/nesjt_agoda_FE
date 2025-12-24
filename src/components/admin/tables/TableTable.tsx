'use client';

import { Table } from '@/src/Types';
import { Pencil, Trash2, Eye, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { toast } from 'react-toastify';
import AdminTable from '../common/AdminTable';

interface Props {
  tables: Table[];
  onEdit: (table: Table) => void;
  onDelete: (id: string) => void;
  onView: (table: Table) => void;
}

function ActionButton({
  onClick,
  children,
  hoverColor,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  hoverColor: string;
  title?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors duration-200 ${hoverColor} flex items-center justify-center`}
    >
      {children}
    </motion.button>
  );
}

const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-800 border-green-300',
  occupied: 'bg-red-100 text-red-800 border-red-300',
  reserved: 'bg-amber-100 text-amber-800 border-amber-300',
  maintenance: 'bg-gray-100 text-gray-800 border-gray-300',
};

const statusLabels: Record<string, string> = {
  available: 'Trống',
  occupied: 'Đang dùng',
  reserved: 'Đã đặt',
  maintenance: 'Bảo trì',
};

export default function TableTable({ tables, onEdit, onDelete, onView }: Props) {
  const [localTables, setLocalTables] = React.useState<Table[]>(Array.isArray(tables) ? tables : []);

  React.useEffect(() => {
    setLocalTables(Array.isArray(tables) ? tables : []);
  }, [tables]);

  const handleDelete = (id: string, tableName: string) => {
    const toastId = toast.info(
      <div className="flex flex-col gap-2">
        <span>Bạn có chắc muốn xóa bàn {tableName}?</span>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => toast.dismiss(toastId)}
          >
            Hủy
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={async () => {
              toast.dismiss(toastId);
              try {
                await onDelete(id);
                setLocalTables((prev) => prev.filter((table) => table._id !== id));
                toast.success('Xóa thành công!');
              } catch (err: any) {
                toast.error(err?.message || 'Xóa thất bại!');
              }
            }}
          >
            Xóa
          </button>
        </div>
      </div>,
      { 
        toastId: `delete-${id}`,
        autoClose: false,
        closeButton: false
      }
    );
  };

  const headers = ['Tên bàn', 'Vị trí', 'Trạng thái', 'Thao tác'];

  const emptyState = (
    <div className="text-center py-12">
      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có bàn nào</h3>
      <p className="text-gray-500">Hãy tạo bàn mới để bắt đầu.</p>
    </div>
  );

  // Ensure localTables is always an array
  const safeTables = Array.isArray(localTables) ? localTables : [];

  return (
    <AdminTable
      headers={headers}
      emptyState={safeTables.length === 0 ? emptyState : undefined}
      className="rounded-2xl shadow-lg border border-gray-200"
    >
      <AnimatePresence>
        {safeTables.length === 0 ? null : (
          safeTables.map((table, index) => (
            <motion.tr
              key={table._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              layout
              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <td className="py-4 px-6">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">{table.tableName}</span>
                  <span className="text-xs text-gray-500">ID: {table._id.slice(-8)}</span>
                </div>
              </td>
              <td className="py-4 px-6">
                <span className="text-gray-700">
                  {typeof table.location === 'string' 
                    ? table.location 
                    : table.location 
                      ? `(${table.location.x}, ${table.location.y})`
                      : 'Chưa có'}
                </span>
              </td>
              <td className="py-4 px-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    statusColors[table.status] || statusColors.available
                  }`}
                >
                  {statusLabels[table.status] || table.status}
                </span>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <ActionButton
                    onClick={() => onView(table)}
                    hoverColor="hover:bg-blue-50"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-5 h-5 text-blue-600" />
                  </ActionButton>
                  <ActionButton
                    onClick={() => onEdit(table)}
                    hoverColor="hover:bg-amber-50"
                    title="Sửa bàn"
                  >
                    <Pencil className="w-5 h-5 text-amber-600" />
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleDelete(table._id, table.tableName)}
                    hoverColor="hover:bg-red-50"
                    title="Xóa bàn"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </ActionButton>
                </div>
              </td>
            </motion.tr>
          ))
        )}
      </AnimatePresence>
    </AdminTable>
  );
}

