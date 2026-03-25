import { api } from './index';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ReservationItem {
  _id: string;
  menuItemId: string;
  menuItemName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  note?: string;
}

export interface Reservation {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  specialRequests?: string;
  status: 'pending' | 'pending_approval' | 'confirmed' | 'completed' | 'cancelled';
  tableNumber?: string;
  table?: {
    _id: string;
    tableName: string;
    location?: string;
  };
  bookingType: 'TABLE_ONLY' | 'FULL_BOOKING';
  items?: ReservationItem[];
  totalAmount: number;
  depositAmount: number;
  depositPaid: number;
  isDepositPaid: boolean;
  depositPaymentMethod?: string;
  depositPaidAt?: string;
  usageDate?: string;
  // Approval fields
  requiresApproval?: boolean;
  approvalStatus?: 'not_applicable' | 'pending' | 'approved' | 'rejected' | 'expired';
  approvalRequestedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  approvalNotes?: {
    adminNotes?: string;
    kitchenNotes?: string;
  };
  approvalExpiresAt?: string;
  // Refund fields
  refundStatus?: 'not_applicable' | 'pending' | 'processing' | 'completed' | 'failed' | 'not_requested';
  refundAmount?: number;
  refundRequestedAt?: string;
  refundProcessedAt?: string;
  refundReason?: string;
  refundNotes?: string;
  refundTransactionId?: string;
  // Audit trail
  statusHistory?: Array<{
    status: string;
    changedBy?: string;
    changedByName?: string;
    reason?: string;
    note?: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFullBookingData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  specialRequests?: string;
  tableId?: string;
  items?: Array<{
    menuItemId: string;
    quantity: number;
    note?: string;
  }>;
  usageDate?: string;
}

export interface ApprovalSettings {
  minItemsThreshold: number;
  minValueThreshold: number;
  autoExpireHours: number;
}

export interface ApprovalStats {
  pending: number;
  approvedToday: number;
  rejectedToday: number;
  expiredToday: number;
  totalValuePending: number;
}

export interface PendingApprovalsResponse {
  reservations: Reservation[];
  total: number;
  totalPages: number;
  stats: {
    pending: number;
    expiringSoon: number;
  };
}

export interface FullBookingResponse {
  success: boolean;
  reservation?: Reservation;
  message: string;
  requiresDeposit?: boolean;
  depositAmount?: number;
  requiresApproval?: boolean;
  approvalExpiresAt?: string;
}

const reservationApi = {
  // Get all reservations with pagination
  getReservations: async (params: PaginationParams & { status?: string; date?: string }) => {
    const response = await api.get('/reservations', { params });
    return response.data;
  },

  // Get single reservation
  getReservation: async (id: string) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  // Create full booking
  createFullBooking: async (data: CreateFullBookingData): Promise<FullBookingResponse> => {
    const response = await api.post('/reservations/full-booking', data);
    return response.data;
  },

  // Check table availability
  checkTableAvailability: async (date: string, time: string, guests: number) => {
    const response = await api.get('/reservations/available-tables', {
      params: { date, time, guests },
    });
    return response.data;
  },

  // Get available time slots
  getAvailableTimeSlots: async (date: string, guests: number) => {
    const response = await api.get('/reservations/time-slots', {
      params: { date, guests },
    });
    return response.data;
  },

  // Confirm deposit
  confirmDeposit: async (id: string, paymentMethod: string) => {
    const response = await api.post(`/reservations/${id}/confirm-deposit`, {
      paymentMethod,
    });
    return response.data;
  },

  // Get my bookings (by phone)
  getMyBookings: async (phone: string) => {
    const response = await api.get('/reservations/my-bookings', {
      params: { phone },
    });
    return response.data;
  },

  // Cancel full booking
  cancelFullBooking: async (id: string) => {
    const response = await api.patch(`/reservations/${id}/cancel-full`);
    return response.data;
  },

  // ========== Approval Endpoints ==========

  // Get pending approvals
  getPendingApprovals: async (params?: PaginationParams): Promise<PendingApprovalsResponse> => {
    const response = await api.get('/reservations/pending-approvals', { params });
    return response.data;
  },

  // Get approval stats
  getApprovalStats: async (): Promise<ApprovalStats> => {
    const response = await api.get('/reservations/approval-stats');
    return response.data;
  },

  // Approve reservation
  approveReservation: async (id: string, data?: { adminNotes?: string; kitchenNotes?: string }) => {
    const response = await api.post(`/reservations/${id}/approve`, data || {});
    return response.data;
  },

  // Reject reservation
  rejectReservation: async (id: string, reason: string) => {
    const response = await api.post(`/reservations/${id}/reject`, { reason });
    return response.data;
  },

  // Cancel confirmed reservation (after deposit paid)
  cancelConfirmedReservation: async (
    id: string,
    data: { reason: string; requestRefund?: boolean }
  ) => {
    const response = await api.post(`/reservations/${id}/cancel-confirmed`, data);
    return response.data;
  },

  // Get approval settings
  getApprovalSettings: async (): Promise<ApprovalSettings> => {
    const response = await api.get('/reservations/approval-settings');
    return response.data;
  },

  // Update approval settings
  updateApprovalSettings: async (data: Partial<ApprovalSettings>) => {
    const response = await api.patch('/reservations/approval-settings', data);
    return response.data;
  },

  // Get today's reservations
  getTodayReservations: async () => {
    const response = await api.get('/reservations/today');
    return response.data;
  },

  // Get upcoming reservations
  getUpcomingReservations: async (days: number = 7) => {
    const response = await api.get('/reservations/upcoming', { params: { days } });
    return response.data;
  },

  // Get reservation stats
  getReservationStats: async () => {
    const response = await api.get('/reservations/stats');
    return response.data;
  },

  // Confirm reservation without PayOS deposit (admin direct confirm)
  confirmWithoutDeposit: async (id: string, adminNotes?: string) => {
    const response = await api.post(`/reservations/${id}/confirm-without-deposit`, { adminNotes });
    return response.data;
  },
};

export default reservationApi;

// Named export for convenience
export const {
  getPendingApprovals,
  getApprovalStats,
  approveReservation,
  rejectReservation,
  cancelConfirmedReservation,
  confirmWithoutDeposit,
  getApprovalSettings,
  updateApprovalSettings,
} = reservationApi;
