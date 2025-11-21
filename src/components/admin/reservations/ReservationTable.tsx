import React from 'react';
import { Reservation } from '@/src/lib/api/reservationApi';
import { Eye, Trash2, CheckCircle, UserCheck, XCircle } from 'lucide-react';
import AdminTable from '../common/AdminTable';

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  arrived: 'bg-purple-100 text-purple-800 border-purple-200',
  seated: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  no_show: 'bg-orange-100 text-orange-800 border-orange-200',
};

const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  arrived: 'Đã đến',
  seated: 'Đã ngồi',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  no_show: 'Không đến',
};

interface ReservationTableProps {
  reservations: Reservation[];
  onViewDetails: (reservation: Reservation) => void;
  onMarkArrived: (id: string) => void;
  onMarkSeated: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ReservationTable({
  reservations,
  onViewDetails,
  onMarkArrived,
  onMarkSeated,
  onDelete,
}: ReservationTableProps) {
  const headers = [
    'Khách hàng',
    'Bàn',
    'Ngày & Giờ',
    'Số khách',
    'Trạng thái',
    'Thao tác',
  ];

  const emptyState = (
    <div className="text-gray-400 mb-4">
      <svg
        className="w-16 h-16 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Chưa có đặt bàn
      </h3>
      <p className="text-gray-500">Các đặt bàn sẽ hiển thị ở đây</p>
    </div>
  );

  return (
    <AdminTable
      headers={headers}
      emptyState={reservations.length === 0 ? emptyState : undefined}
      className="rounded-2xl shadow-lg border border-gray-200"
    >
      {reservations.map((reservation) => (
        <tr key={reservation._id} className="hover:bg-gray-50">
          <td className="py-4 px-6">
            <div className="flex flex-col">
              <span className="font-medium">{reservation.customerName}</span>
              <span className="text-xs text-gray-500">
                {reservation.customerPhone}
              </span>
            </div>
          </td>
          <td className="py-4 px-6">
            <span className="font-medium text-gray-900">
              {reservation.table.tableName}
            </span>
            {reservation.table.location && (
              <span className="text-xs text-gray-500 block">
                {reservation.table.location}
              </span>
            )}
          </td>
          <td className="py-4 px-6">
            <div className="flex flex-col">
              <span className="text-sm">
                {new Date(reservation.reservationDate).toLocaleDateString('vi-VN')}
              </span>
              <span className="text-xs text-gray-500">
                {reservation.reservationTime}
              </span>
            </div>
          </td>
          <td className="py-4 px-6">
            <span className="text-gray-600">{reservation.numberOfGuests} người</span>
          </td>
          <td className="py-4 px-6">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                statusColors[reservation.status]
              }`}
            >
              {statusLabels[reservation.status]}
            </span>
          </td>
          <td className="py-4 px-6">
            <div className="flex items-center justify-center space-x-2">
              {reservation.status === 'pending' || reservation.status === 'confirmed' ? (
                <button
                  onClick={() => onMarkArrived(reservation._id)}
                  className="p-2 rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-200 shadow transition-colors"
                  title="Đánh dấu đã đến"
                >
                  <UserCheck className="w-4 h-4" />
                </button>
              ) : null}
              
              {reservation.status === 'arrived' ? (
                <button
                  onClick={() => onMarkSeated(reservation._id)}
                  className="p-2 rounded-lg text-green-600 bg-green-50 hover:bg-green-200 shadow transition-colors"
                  title="Đánh dấu đã ngồi"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              ) : null}

              <button
                onClick={() => onViewDetails(reservation)}
                className="p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-200 shadow transition-colors"
                title="Xem chi tiết"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(reservation._id)}
                className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-200 shadow transition-colors"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
