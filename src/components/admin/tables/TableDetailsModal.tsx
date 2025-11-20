'use client';

import { Table, Guest } from '@/src/Types';
import { X, Users, Clock, MapPin, Phone, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getGuests } from '@/src/lib/api';

interface TableDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
}

export default function TableDetailsModal({
  isOpen,
  onClose,
  table,
}: TableDetailsModalProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && table) {
      loadGuests();
    }
  }, [isOpen, table]);

  const loadGuests = async () => {
    if (!table) return;
    setLoading(true);
    try {
      const allGuests = await getGuests({ tableName: table.tableName });
      setGuests(allGuests || []);
    } catch (error) {
      console.error('Error loading guests:', error);
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !table) return null;

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    reserved: 'bg-amber-100 text-amber-800',
    maintenance: 'bg-gray-100 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    available: 'Trống',
    occupied: 'Đang dùng',
    reserved: 'Đã đặt',
    maintenance: 'Bảo trì',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết bàn</h2>
            <p className="text-sm text-gray-500 mt-1">Thông tin bàn và khách hàng</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Table Info */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Tên bàn</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{table.tableName}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Vị trí</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {table.location || 'Chưa có'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Trạng thái</span>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[table.status] || statusColors.available
                  }`}
                >
                  {statusLabels[table.status] || table.status}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Số khách</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{guests.length} khách</p>
              </div>
            </div>
          </div>

          {/* Guests List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Danh sách khách ({guests.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Đang tải...</p>
              </div>
            ) : guests.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">Chưa có khách nào ở bàn này</p>
              </div>
            ) : (
              <div className="space-y-3">
                {guests.map((guest) => (
                  <div
                    key={guest._id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{guest.guestName}</h4>
                          {guest.isPaid && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Đã thanh toán
                            </span>
                          )}
                        </div>
                        {guest.guestPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Phone className="w-4 h-4" />
                            <span>{guest.guestPhone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Tham gia: {new Date(guest.joinedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        {guest.orders && guest.orders.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            Đã đặt {guest.orders.length} đơn
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

