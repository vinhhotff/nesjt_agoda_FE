'use client';

import { Table, Zone } from '@/src/Types';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getZones } from '@/src/lib/api/zoneApi';

interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { tableName: string; location: string; status: "available" | "occupied" | "reserved" | "maintenance"; width?: number; height?: number }) => void;
  initialData?: Table | null;
  loading?: boolean;
}

export default function TableFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: TableFormModalProps) {
  const [formData, setFormData] = useState<{
    tableName: string;
    location: string;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    width: number;
    height: number;
  }>({
    tableName: '',
    location: '',
    status: 'available',
    width: 1,
    height: 1,
  });
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadZones();
    }
  }, [isOpen]);

  async function loadZones() {
    try {
      const zonesData = await getZones();
      setZones(Array.isArray(zonesData) ? zonesData : []);
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  }

  useEffect(() => {
    if (initialData) {
      setFormData({
        tableName: initialData.tableName || '',
        location: (initialData as any).location || '',
        status: (initialData.status as any) || 'available',
        width: initialData.width || 1,
        height: initialData.height || 1,
      });
    } else {
      setFormData({
        tableName: '',
        location: '',
        status: 'available',
        width: 1,
        height: 1,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Sửa bàn' : 'Tạo bàn mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên bàn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.tableName}
              onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="VD: Bàn 1, T1, A1..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khu vực <span className="text-red-500">*</span>
            </label>
            {zones.length > 0 ? (
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              >
                <option value="">-- Chọn khu --</option>
                {zones.map((zone) => (
                  <option key={zone._id} value={zone.name}>
                    {zone.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="VD: Khu A, Khu B, VIP..."
                  required
                />
                <p className="text-xs text-gray-500">
                  Chưa có khu nào. Nhập tên khu hoặc tạo khu mới ở trang Layout.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            >
              <option value="available">Trống</option>
              <option value="occupied">Đang dùng</option>
              <option value="reserved">Đã đặt</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chiều rộng (số ô) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.width}
                onChange={(e) =>
                  setFormData({ ...formData, width: parseInt(e.target.value) || 1 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="VD: 1, 2, 3..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">Số ô chiếm theo chiều ngang</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chiều dài (số ô) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: parseInt(e.target.value) || 1 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="VD: 1, 2, 3..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">Số ô chiếm theo chiều dọc</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

