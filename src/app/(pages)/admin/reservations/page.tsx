'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/src/Context/AuthContext';
import { useRouter } from 'next/navigation';
import { reservationsAPI, type Reservation, type ReservationStats, ReservationStatus } from '@/src/lib/api/reservationsApi';
import ReservationStatsCards from '@/src/components/reservations/ReservationStatsCards';
import ReservationTable from '@/src/components/reservations/ReservationTable';
import ReservationFilters from '@/src/components/reservations/ReservationFilters';
import CreateReservationModal from '@/src/components/reservations/CreateReservationModal';
import { AdminLayout } from '@/src/components/layout';
import AdminPageHeader from '@/src/components/admin/common/AdminPageHeader';
import AdminPagination from '@/src/components/admin/common/AdminPagination';
import { LoadingSpinner } from '@/src/components/ui';
import { Filter } from 'lucide-react';

export default function ReservationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State management
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || (typeof user.role === 'string' ? user.role : (user.role as any)?.name)?.toLowerCase() !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  // Data fetching
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reservationsAPI.getReservations(
        currentPage,
        pageSize,
        selectedStatus,
        selectedDate
      );
      
      // API now returns { items: [], totalPages, total, ... }
      setReservations(Array.isArray(response.items) ? response.items : []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
    } catch (err) {
      setError('Không thể tải danh sách đặt bàn');
      console.error('Error fetching reservations:', err);
      toast.error('Không thể tải danh sách đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await reservationsAPI.getReservationStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching reservation stats:', err);
    }
  };

  // Effects
  useEffect(() => {
    fetchReservations();
  }, [currentPage, selectedStatus, selectedDate]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Event handlers
  const handleStatusChange = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      await reservationsAPI.updateReservationStatus(reservationId, { status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      fetchReservations();
      fetchStats();
    } catch (err: any) {
      console.error('Error updating reservation status:', err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái đặt bàn');
    }
  };

  const handleCreateReservation = async (reservationData: any) => {
    try {
      console.log('Creating reservation with data:', reservationData);
      await reservationsAPI.createReservation(reservationData);
      toast.success('Tạo đặt bàn thành công');
      setShowCreateModal(false);
      await fetchReservations();
      await fetchStats();
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tạo đặt bàn';
      toast.error(errorMessage);
      throw err; // Let the modal handle the error
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đặt bàn này?')) {
      return;
    }

    try {
      await reservationsAPI.adminCancelReservation(reservationId);
      toast.success('Hủy đặt bàn thành công');
      fetchReservations();
      fetchStats();
    } catch (err: any) {
      console.error('Error cancelling reservation:', err);
      toast.error(err.response?.data?.message || 'Không thể hủy đặt bàn');
    }
  };

  const handleFilterChange = (filters: {
    status?: ReservationStatus;
    date?: string;
    search?: string;
  }) => {
    setSelectedStatus(filters.status);
    setSelectedDate(filters.date || '');
    setSearchQuery(filters.search || '');
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (authLoading || (loading && (!reservations || reservations.length === 0))) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Đang tải..." className="min-h-screen" />
      </AdminLayout>
    );
  }

  if (!user || (typeof user.role === 'string' ? user.role : (user.role as any)?.name)?.toLowerCase() !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="Quản lý đặt bàn"
          description="Theo dõi và quản lý tất cả đặt bàn của nhà hàng"
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium"
            >
              ➕ Tạo đặt bàn mới
            </button>
          }
        />

        {/* Stats Cards */}
        {stats && (
          <div className="mt-6 mb-6">
            <ReservationStatsCards stats={stats} />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
          </div>
          <ReservationFilters
            onFilterChange={handleFilterChange}
            selectedStatus={selectedStatus}
            selectedDate={selectedDate}
            searchQuery={searchQuery}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Reservations Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách đặt bàn ({Array.isArray(reservations) ? reservations.length : 0})
            </h3>
          </div>
          <ReservationTable
            reservations={reservations || []}
            loading={loading}
            onStatusChange={handleStatusChange}
            onCancel={handleCancelReservation}
            onView={setSelectedReservation}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateReservationModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateReservation}
        />
      )}

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedReservation(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Chi tiết đặt bàn</h3>
              <button
                onClick={() => setSelectedReservation(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên khách hàng</label>
                  <p className="text-gray-900">{selectedReservation.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <p className="text-gray-900">{selectedReservation.customerPhone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900">{selectedReservation.customerEmail || 'Không có'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số người</label>
                  <p className="text-gray-900">{selectedReservation.partySize || 0} người</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian</label>
                  <p className="text-gray-900">{reservationsAPI.formatReservationDateTime(selectedReservation)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedReservation.status === ReservationStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                    selectedReservation.status === ReservationStatus.CONFIRMED ? 'bg-green-100 text-green-800' :
                    selectedReservation.status === ReservationStatus.COMPLETED ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {reservationsAPI.getStatusText(selectedReservation.status)}
                  </span>
                </div>
                {selectedReservation.specialRequests && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yêu cầu đặc biệt</label>
                    <p className="text-gray-900">{selectedReservation.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedReservation(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
