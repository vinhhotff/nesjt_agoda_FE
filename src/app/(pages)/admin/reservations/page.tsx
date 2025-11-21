"use client";
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { AdminLayout } from '@/src/components/layout';
import AdminPageHeader from '@/src/components/admin/common/AdminPageHeader';
import ReservationTable from '@/src/components/admin/reservations/ReservationTable';
import { LoadingSpinner } from '@/src/components/ui';
import {
  getReservations,
  markReservationAsArrived,
  markReservationAsSeated,
  deleteReservation,
  Reservation,
} from '@/src/lib/api/reservationApi';
import { toast } from '@/src/lib/utils/toast';

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const result = await getReservations(
        1,
        100,
        statusFilter === 'all' ? undefined : statusFilter,
        dateFilter || undefined
      );
      setReservations(result.items);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Không thể tải danh sách đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, dateFilter]);

  const handleMarkArrived = async (id: string) => {
    try {
      await markReservationAsArrived(id);
      toast.success('Đã đánh dấu khách đến');
      fetchReservations();
    } catch (error: any) {
      console.error('Error marking as arrived:', error);
      toast.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleMarkSeated = async (id: string) => {
    try {
      await markReservationAsSeated(id);
      toast.success('Đã đánh dấu khách ngồi vào bàn');
      fetchReservations();
    } catch (error: any) {
      console.error('Error marking as seated:', error);
      toast.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa đặt bàn này?')) return;

    try {
      await deleteReservation(id);
      toast.success('Đã xóa đặt bàn');
      fetchReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Không thể xóa đặt bàn');
    }
  };

  const handleViewDetails = (reservation: Reservation) => {
    // TODO: Implement details modal
    console.log('View details:', reservation);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" text="Đang tải..." className="min-h-screen" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="Quản lý đặt bàn"
          description="Quản lý và theo dõi các đặt bàn của khách hàng"
          icon={<Calendar className="w-6 h-6 text-white" />}
        />

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="arrived">Đã đến</option>
                <option value="seated">Đã ngồi</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
                <option value="no_show">Không đến</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setDateFilter('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <ReservationTable
            reservations={reservations}
            onViewDetails={handleViewDetails}
            onMarkArrived={handleMarkArrived}
            onMarkSeated={handleMarkSeated}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReservationsPage;
