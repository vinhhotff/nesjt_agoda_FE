'use client';

import { useState, useEffect } from 'react';
import { reservationsAPI, type Reservation, type ReservationStats, ReservationStatus } from '@/src/lib/api/reservationsApi';
import ReservationStatsCards from '@/src/components/reservations/ReservationStatsCards';
import ReservationTable from '@/src/components/reservations/ReservationTable';
import ReservationFilters from '@/src/components/reservations/ReservationFilters';
import CreateReservationModal from '@/src/components/reservations/CreateReservationModal';
import '@/src/styles/modules.css';

export default function ReservationsPage() {
  // State management
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  
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
      
      setReservations(response.items);
    } catch (err) {
      setError('Không thể tải danh sách đặt bàn');
      console.error('Error fetching reservations:', err);
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
      fetchReservations();
      fetchStats();
    } catch (err) {
      console.error('Error updating reservation status:', err);
      setError('Không thể cập nhật trạng thái đặt bàn');
    }
  };

  const handleCreateReservation = async (reservationData: any) => {
    try {
      await reservationsAPI.createReservation(reservationData);
      setShowCreateModal(false);
      fetchReservations();
      fetchStats();
    } catch (err) {
      console.error('Error creating reservation:', err);
      throw err; // Let the modal handle the error
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đặt bàn này?')) {
      return;
    }

    try {
      await reservationsAPI.adminCancelReservation(reservationId);
      fetchReservations();
      fetchStats();
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setError('Không thể hủy đặt bàn');
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

  return (
    <div className="module-container">
      {/* Header */}
      <div className="module-header">
        <h1 className="module-title">
          🍽️ Quản lý đặt bàn
        </h1>
        <p className="module-subtitle">
          Theo dõi và quản lý tất cả đặt bàn của nhà hàng
        </p>
      </div>

      {/* Stats Cards */}
      {stats && <ReservationStatsCards stats={stats} />}

      {/* Main Content */}
      <div className="data-table-container">
        <div className="data-table-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="data-table-title">Danh sách đặt bàn</h2>
            <button 
              className="btn primary"
              onClick={() => setShowCreateModal(true)}
            >
              ➕ Tạo đặt bàn mới
            </button>
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
          <div style={{ 
            padding: 'var(--spacing-lg)', 
            background: 'color-mix(in srgb, var(--status-cancelled) 10%, white)',
            color: 'var(--status-cancelled)',
            borderLeft: '4px solid var(--status-cancelled)',
            margin: 'var(--spacing-md)'
          }}>
            {error}
            <button 
              onClick={() => setError(null)}
              style={{ 
                float: 'right',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--font-lg)'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Reservations Table */}
        <ReservationTable
          reservations={reservations}
          loading={loading}
          onStatusChange={handleStatusChange}
          onCancel={handleCancelReservation}
          onView={setSelectedReservation}
          currentPage={currentPage}
          totalPages={Math.ceil(reservations.length / pageSize)}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateReservationModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateReservation}
        />
      )}

      {selectedReservation && (
        <div className="modal-overlay" onClick={() => setSelectedReservation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Chi tiết đặt bàn</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedReservation(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid two-columns">
                <div className="form-group">
                  <label className="form-label">Tên khách hàng</label>
                  <p>{selectedReservation.customerName}</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <p>{selectedReservation.customerPhone}</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <p>{selectedReservation.customerEmail || 'Không có'}</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Số người</label>
                  <p>{selectedReservation.partySize} người</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Thời gian</label>
                  <p>{reservationsAPI.formatReservationDateTime(selectedReservation)}</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <div className={`status-badge ${selectedReservation.status.replace('_', '-')}`}>
                    {reservationsAPI.getStatusText(selectedReservation.status)}
                  </div>
                </div>
                {selectedReservation.specialRequests && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Yêu cầu đặc biệt</label>
                    <p>{selectedReservation.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn ghost"
                onClick={() => setSelectedReservation(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
