"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, X, RotateCcw, History, CheckCircle, XCircle } from 'lucide-react';
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
import { cancelConfirmedReservation, confirmWithoutDeposit } from '@/src/lib/api/reservationApprovalApi';
import { toast } from '@/src/lib/utils/toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  pending_approval: 'Chờ phê duyệt',
  confirmed: 'Đã xác nhận',
  arrived: 'Đã đến',
  seated: 'Đã ngồi',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  no_show: 'Không đến',
};

const refundStatusLabels: Record<string, string> = {
  not_applicable: '-',
  pending: 'Chờ hoàn tiền',
  processing: 'Đang hoàn tiền',
  completed: 'Đã hoàn tiền',
  failed: 'Hoàn tiền thất bại',
  not_requested: 'Không hoàn tiền',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [detailModal, setDetailModal] = useState<{ visible: boolean; reservation: Reservation | null }>({ visible: false, reservation: null });
  const [cancelModal, setCancelModal] = useState<{ visible: boolean; reservation: Reservation | null }>({ visible: false, reservation: null });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelRefund, setCancelRefund] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Approve / Reject modals
  const [rejectModal, setRejectModal] = useState<{ visible: boolean; reservation: Reservation | null }>({ visible: false, reservation: null });
  const [rejectReason, setRejectReason] = useState('');
  const [approvalActionLoading, setApprovalActionLoading] = useState(false);

  const fetchReservations = async () => {
    console.log('[DEBUG] fetchReservations called — statusFilter:', statusFilter, 'dateFilter:', dateFilter);
    try {
      setLoading(true);
      console.log('[DEBUG] calling getReservations...');
      const result = await getReservations(
        1,
        100,
        statusFilter === 'all' ? undefined : statusFilter,
        dateFilter || undefined
      );
      console.log('[DEBUG] getReservations raw result:', JSON.stringify(result, null, 2));
      console.log('[DEBUG] items count:', result.items?.length, 'total:', result.total);
      setReservations(result.items);
      console.log('[DEBUG] setReservations done, items:', result.items.length);
    } catch (error: any) {
      console.error('[DEBUG] fetchReservations ERROR:', error?.response?.status, error?.response?.data, error?.message);
      toast.error('Không thể tải danh sách đặt bàn: ' + (error?.response?.data?.message || error.message));
    } finally {
      console.log('[DEBUG] fetchReservations finally — loading=false');
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
    setDetailModal({ visible: true, reservation });
  };

  const handleOpenCancelModal = (reservation: Reservation) => {
    setCancelReason('');
    setCancelRefund(true);
    setCancelModal({ visible: true, reservation });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.reservation) return;
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }
    setCancelLoading(true);
    try {
      await cancelConfirmedReservation(cancelModal.reservation._id, {
        reason: cancelReason,
        requestRefund: cancelRefund,
      });
      toast.success('Đã hủy đặt bàn và thông báo cho khách');
      setCancelModal({ visible: false, reservation: null });
      fetchReservations();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể hủy đặt bàn');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleConfirmWithoutDeposit = async (reservationId: string, adminNotes?: string) => {
    if (!confirm(`Xác nhận đặt bàn này mà không cần đặt cọc qua PayOS?`)) return;
    setApprovalActionLoading(true);
    try {
      await confirmWithoutDeposit(reservationId, adminNotes);
      toast.success('Đã xác nhận đặt bàn (không đặt cọc)');
      setDetailModal({ visible: false, reservation: null });
      fetchReservations();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xác nhận đặt bàn');
    } finally {
      setApprovalActionLoading(false);
    }
  };

  const handleApprove = async (reservationId: string, adminNotes?: string) => {
    if (!confirm('Đồng ý đơn đặt bàn này?')) return;
    setApprovalActionLoading(true);
    try {
      await confirmWithoutDeposit(reservationId, adminNotes);
      toast.success('Đã đồng ý đơn đặt bàn');
      setDetailModal({ visible: false, reservation: null });
      fetchReservations();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể đồng ý đơn đặt bàn');
    } finally {
      setApprovalActionLoading(false);
    }
  };

  const handleOpenRejectModal = (reservation: Reservation) => {
    setRejectReason('');
    setRejectModal({ visible: true, reservation });
  };

  const handleReject = async () => {
    if (!rejectModal.reservation) return;
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setApprovalActionLoading(true);
    try {
      const { rejectReservation } = await import('@/src/lib/api/reservationApprovalApi');
      await rejectReservation(rejectModal.reservation._id, rejectReason);
      toast.success('Đã từ chối đơn đặt bàn');
      setRejectModal({ visible: false, reservation: null });
      setDetailModal({ visible: false, reservation: null });
      fetchReservations();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể từ chối đơn đặt bàn');
    } finally {
      setApprovalActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Đang tải..." />
      </AdminLayout>
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
                <option value="pending_approval">Chờ phê duyệt</option>
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
            onCancelConfirmed={handleOpenCancelModal}
          />
        </div>
      </div>

      {/* ========== Detail Modal ========== */}
      {detailModal.visible && detailModal.reservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold">Chi tiết đặt bàn</h2>
              </div>
              <button
                onClick={() => setDetailModal({ visible: false, reservation: null })}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Khách hàng</p>
                  <p className="font-medium">{detailModal.reservation.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Số điện thoại</p>
                  <p className="font-medium">{detailModal.reservation.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="font-medium">{detailModal.reservation.customerEmail || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Số khách</p>
                  <p className="font-medium">{detailModal.reservation.numberOfGuests} người</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Ngày đặt</p>
                  <p className="font-medium">
                    {format(new Date(detailModal.reservation.reservationDate), 'dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Giờ đặt</p>
                  <p className="font-medium">{detailModal.reservation.reservationTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Bàn</p>
                  <p className="font-medium">{detailModal.reservation.table?.tableName || 'Chưa chọn'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Trạng thái</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                    detailModal.reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    detailModal.reservation.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                    detailModal.reservation.status === 'pending_approval' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {statusLabels[detailModal.reservation.status] || detailModal.reservation.status}
                  </span>
                </div>
              </div>

              {/* Payment info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-700">Thông tin thanh toán</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Tổng giá trị</p>
                    <p className="font-semibold text-green-600">
                      {(detailModal.reservation?.totalAmount ?? 0).toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Đặt cọc yêu cầu</p>
                    <p className="font-medium">
                      {(detailModal.reservation?.depositAmount ?? 0).toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Đặt cọc đã thanh toán</p>
                    <p className="font-medium">
                      {detailModal.reservation?.isDepositPaid ? (
                        <span className="text-green-600">
                          {(detailModal.reservation?.depositPaid ?? 0).toLocaleString('vi-VN')} VNĐ
                        </span>
                      ) : (
                        <span className="text-red-500">Chưa thanh toán</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trạng thái hoàn tiền</p>
                    <p className="font-medium">
                      {refundStatusLabels[detailModal.reservation?.refundStatus || 'not_applicable']}
                    </p>
                  </div>
                </div>
              </div>

              {/* Refund details */}
              {detailModal.reservation?.refundStatus && detailModal.reservation.refundStatus !== 'not_applicable' && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">Chi tiết hoàn tiền</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Số tiền hoàn</p>
                      <p className="font-medium">
                        {(detailModal.reservation?.refundAmount || 0).toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Lý do</p>
                      <p className="font-medium">{detailModal.reservation?.refundReason || '-'}</p>
                    </div>
                    {detailModal.reservation?.refundNotes && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Ghi chú</p>
                        <p className="font-medium text-sm">{detailModal.reservation?.refundNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Menu items */}
              {(detailModal.reservation?.items?.length ?? 0) > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">Danh sách món ăn</h3>
                  <div className="space-y-2">
                    {(detailModal.reservation?.items ?? []).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span>
                          <span className="font-medium">{item.quantity} x </span>
                          {item.menuItemName || `Món #${idx + 1}`}
                        </span>
                        <span className="text-gray-600">
                          {item.subtotal.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status history */}
              {(detailModal.reservation?.statusHistory?.length ?? 0) > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">Lịch sử thay đổi</h3>
                  <div className="space-y-2">
                    {[...(detailModal.reservation?.statusHistory ?? [])].reverse().map((entry, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5" />
                          {idx < (detailModal.reservation?.statusHistory?.length ?? 0) - 1 && (
                            <div className="w-px h-full bg-gray-200" />
                          )}
                        </div>
                        <div className="pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {statusLabels[entry.status] || entry.status}
                            </span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500">{entry.changedByName || entry.changedBy}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {format(new Date(entry.timestamp), 'HH:mm dd/MM/yyyy', { locale: vi })}
                          </p>
                          {entry.reason && (
                            <p className="text-xs text-gray-600 mt-0.5">Lý do: {entry.reason}</p>
                          )}
                          {entry.note && (
                            <p className="text-xs text-gray-500 mt-0.5">Ghi chú: {entry.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection reason */}
              {detailModal.reservation?.rejectedReason && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold mb-1 text-gray-700">Lý do từ chối</h3>
                  <p className="text-sm text-red-600">{detailModal.reservation?.rejectedReason}</p>
                </div>
              )}

              {/* Special requests */}
              {detailModal.reservation?.specialRequests && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold mb-1 text-gray-700">Yêu cầu đặc biệt</h3>
                  <p className="text-sm text-gray-600">{detailModal.reservation?.specialRequests}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="border-t border-gray-200 pt-4 mt-4 flex flex-wrap gap-3 justify-end">
                {/* Reject button — for pending / pending_approval */}
                {(detailModal.reservation?.status === 'pending' ||
                  detailModal.reservation?.status === 'pending_approval') && (
                  <button
                    onClick={() => handleOpenRejectModal(detailModal.reservation!)}
                    disabled={approvalActionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Từ chối
                  </button>
                )}

                {/* Approve button — for pending / pending_approval */}
                {(detailModal.reservation?.status === 'pending' ||
                  detailModal.reservation?.status === 'pending_approval') && (
                  <button
                    onClick={() => handleApprove(detailModal.reservation?._id!)}
                    disabled={approvalActionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Đồng ý
                  </button>
                )}

                {/* Confirm without deposit button */}
                {!detailModal.reservation?.isDepositPaid &&
                  (detailModal.reservation?.status === 'pending' ||
                    detailModal.reservation?.status === 'pending_approval') && (
                    <button
                      onClick={() => handleConfirmWithoutDeposit(detailModal.reservation?._id!)}
                      disabled={approvalActionLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Xác nhận không đặt cọc
                    </button>
                  )}

                {/* Cancel confirmed button */}
                {detailModal.reservation?.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      const r = detailModal.reservation;
                      setDetailModal({ visible: false, reservation: null });
                      if (r) setCancelModal({ visible: true, reservation: r });
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Hủy đặt bàn
                  </button>
                )}

                <button
                  onClick={() => setDetailModal({ visible: false, reservation: null })}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== Cancel Confirmed Modal ========== */}
      {cancelModal.visible && cancelModal.reservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold">Hủy đặt bàn đã xác nhận</h2>
              </div>
              <button
                onClick={() => setCancelModal({ visible: false, reservation: null })}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-800">
                  <strong>Cảnh báo:</strong> Đặt bàn này đã được xác nhận và khách đã đặt cọc{' '}
                  <strong>{(cancelModal.reservation?.depositPaid ?? 0).toLocaleString('vi-VN')} VNĐ</strong>.
                  Việc hủy sẽ ảnh hưởng đến khách hàng.
                </p>
              </div>

              {/* Customer info summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-sm">
                  <span className="text-gray-500">Khách hàng: </span>
                  <span className="font-medium">{cancelModal.reservation?.customerName}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Điện thoại: </span>
                  <span className="font-medium">{cancelModal.reservation?.customerPhone}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Ngày giờ: </span>
                  <span className="font-medium">
                    {cancelModal.reservation?.reservationDate
                      ? format(new Date(cancelModal.reservation.reservationDate), 'dd/MM/yyyy', { locale: vi })
                      : '-'}{' '}
                    {cancelModal.reservation?.reservationTime}
                  </span>
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do hủy <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy đặt bàn (khách hàng sẽ được thông báo)..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                />
              </div>

              {/* Refund option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hoàn tiền</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="refund"
                      checked={cancelRefund === true}
                      onChange={() => setCancelRefund(true)}
                      className="accent-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium">Hoàn tiền đặt cọc</p>
                      <p className="text-xs text-gray-500">
                        Khách sẽ nhận lại {(cancelModal.reservation?.depositPaid ?? 0).toLocaleString('vi-VN')} VNĐ qua PayOS
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="refund"
                      checked={cancelRefund === false}
                      onChange={() => setCancelRefund(false)}
                      className="accent-orange-500"
                    />
                    <div>
                      <p className="text-sm font-medium">Không hoàn tiền</p>
                      <p className="text-xs text-gray-500">
                        Khách không nhận lại tiền đặt cọc (cần có lý do chính đáng)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setCancelModal({ visible: false, reservation: null })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {cancelLoading ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Xác nhận hủy đặt bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Reject Modal ========== */}
      {rejectModal.visible && rejectModal.reservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold">Từ chối đơn đặt bàn</h2>
              </div>
              <button
                onClick={() => setRejectModal({ visible: false, reservation: null })}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer info summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-sm">
                  <span className="text-gray-500">Khách hàng: </span>
                  <span className="font-medium">{rejectModal.reservation?.customerName}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Điện thoại: </span>
                  <span className="font-medium">{rejectModal.reservation?.customerPhone}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Ngày giờ: </span>
                  <span className="font-medium">
                    {rejectModal.reservation?.reservationDate
                      ? format(new Date(rejectModal.reservation.reservationDate), 'dd/MM/yyyy', { locale: vi })
                      : '-'}{' '}
                    {rejectModal.reservation?.reservationTime}
                  </span>
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối đơn đặt bàn (khách hàng sẽ được thông báo)..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setRejectModal({ visible: false, reservation: null })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={approvalActionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {approvalActionLoading ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
