'use client';

import React from 'react';
import { Reservation, ReservationStatus } from '@/src/lib/api/reservationsApi';
import { Eye, Trash2, Calendar, Users, Phone, Mail, Clock } from 'lucide-react';
import AdminTable from '../admin/common/AdminTable';

const statusColors: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  completed: 'bg-blue-100 text-blue-800 border-blue-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const statusIcons: Record<ReservationStatus, string> = {
  pending: '⏳',
  confirmed: '✅',
  completed: '🍽️',
  cancelled: '❌',
};

interface ReservationTableProps {
  reservations?: Reservation[];
  loading?: boolean;
  onStatusChange: (reservationId: string, status: ReservationStatus) => void;
  onCancel: (reservationId: string) => void;
  onView: (reservation: Reservation) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function ReservationTable({
  reservations = [],
  loading,
  onStatusChange,
  onCancel,
  onView,
}: ReservationTableProps) {
  const headers = ['Khách hàng', 'Thông tin liên hệ', 'Số người', 'Thời gian', 'Trạng thái', 'Thao tác'];

  const formatDateTime = (dateString: string, timeString?: string) => {
    try {
      const date = new Date(dateString);
      if (timeString) {
        const [hours, minutes] = timeString.split(':');
        date.setHours(parseInt(hours) || 0, parseInt(minutes) || 0);
      }
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const emptyState = (
    <div className="text-center py-12">
      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có đặt bàn nào</h3>
      <p className="text-gray-500">Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm.</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Ensure reservations is always an array
  const safeReservations = Array.isArray(reservations) ? reservations : [];

  if (safeReservations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable 
        headers={headers} 
        emptyState={undefined} 
        className="rounded-2xl shadow-lg border border-gray-200"
      >
        {safeReservations.map((reservation) => (
          <tr key={reservation._id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
            <td className="py-4 px-6">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 mb-1">{reservation.customerName}</span>
                <span className="text-xs text-gray-500">
                  ID: {reservation._id.slice(-8)}
                </span>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-3 h-3" />
                  <span>{reservation.customerPhone}</span>
                </div>
                {reservation.customerEmail && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="w-3 h-3" />
                    <span>{reservation.customerEmail}</span>
                  </div>
                )}
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 font-medium">
                  {(reservation as any).numberOfGuests || reservation.partySize || 0} người
                </span>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{formatDateTime(reservation.reservationDate, reservation.reservationTime)}</span>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="relative inline-block">
                <select
                  value={reservation.status || ReservationStatus.PENDING}
                  onChange={(e) => onStatusChange(reservation._id, e.target.value as ReservationStatus)}
                  className={`appearance-none text-xs font-semibold px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                    statusColors[reservation.status] || 'bg-gray-100 text-gray-800 border-gray-300'
                  } hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                  <option value={ReservationStatus.PENDING}>
                    {statusIcons.pending} Chờ xác nhận
                  </option>
                  <option value={ReservationStatus.CONFIRMED}>
                    {statusIcons.confirmed} Đã xác nhận
                  </option>
                  <option value={ReservationStatus.COMPLETED}>
                    {statusIcons.completed} Hoàn thành
                  </option>
                  <option value={ReservationStatus.CANCELLED}>
                    {statusIcons.cancelled} Đã hủy
                  </option>
                </select>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView(reservation)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition hover:scale-110"
                  title="Xem chi tiết"
                >
                  <Eye className="w-5 h-5" />
                </button>
                {reservation.status !== ReservationStatus.CANCELLED && (
                  <button
                    onClick={() => onCancel(reservation._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition hover:scale-110"
                    title="Hủy đặt bàn"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
