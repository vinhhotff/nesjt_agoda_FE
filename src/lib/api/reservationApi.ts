import { api } from './callApi';

export interface Reservation {
  _id: string;
  /** Populated from API; may be missing if table was deleted or not assigned */
  table?: {
    _id: string;
    tableName: string;
    location?: string;
    status: string;
  };
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  numberOfGuests: number;
  reservationDate: string;
  reservationTime: string;
  status: 'pending' | 'pending_approval' | 'confirmed' | 'arrived' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  specialRequests?: string;
  notes?: string;
  guest?: {
    _id: string;
    guestName: string;
    guestPhone: string;
  };
  arrivedAt?: string;
  seatedAt?: string;
  completedAt?: string;
  // Full booking fields
  bookingType?: 'TABLE_ONLY' | 'FULL_BOOKING';
  items?: Array<{
    _id?: string;
    item?: string | { _id: string; name: string; price: number; category: string };
    menuItemName?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    note?: string;
  }>;
  totalAmount?: number;
  depositAmount?: number;
  depositPaid?: number;
  isDepositPaid?: boolean;
  depositPaymentMethod?: string;
  depositPaidAt?: string;
  usageDate?: string;
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
  // Approval fields
  requiresApproval?: boolean;
  approvalStatus?: 'not_applicable' | 'pending' | 'approved' | 'rejected' | 'expired';
  approvedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  approvalNotes?: { adminNotes?: string; kitchenNotes?: string };
  approvalExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationDto {
  table: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  numberOfGuests: number;
  reservationDate: string;
  reservationTime: string;
  specialRequests?: string;
  notes?: string;
}

export const createReservation = async (data: CreateReservationDto): Promise<Reservation> => {
  const response = await api.post('/reservations', data);
  return response.data?.data || response.data;
};

export const getReservations = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  date?: string
) => {
  const params: any = { page, limit };
  if (status) params.status = status;
  if (date) params.date = date;

  console.log('[reservationApi] getReservations → GET /reservations', params);
  const response = await api.get('/reservations', { params });
  console.log('[reservationApi] raw response.data:', JSON.stringify(response.data).slice(0, 300));
  // Backend: findAll → { reservations, total, totalPages }
  // ResponseInterceptor bọc: { statusCode, message, data: { reservations, total, totalPages }, timestamp }
  // Axios unwrap: response.data = { statusCode, message, data: { reservations }, timestamp }
  const body = response.data;

  // Unwrap interceptor wrapper → lấy đúng { reservations, total, totalPages }
  const inner = body?.data !== undefined ? body.data : body;
  console.log('[reservationApi] inner after unwrap:', JSON.stringify(inner).slice(0, 300));

  const items = Array.isArray(inner.reservations)
    ? inner.reservations
    : Array.isArray(inner.items)
    ? inner.items
    : Array.isArray(inner)
    ? inner
    : [];

  console.log('[reservationApi] returning items count:', items.length);
  return {
    items,
    total: inner.total ?? items.length,
    page: inner.page ?? page,
    limit: inner.limit ?? limit,
    totalPages: inner.totalPages ?? 1,
  };
};

export const getReservation = async (id: string): Promise<Reservation> => {
  const response = await api.get(`/reservations/${id}`);
  return response.data?.data || response.data;
};

export const getTodayReservations = async (): Promise<Reservation[]> => {
  const response = await api.get('/reservations/today');
  return response.data?.data || response.data || [];
};

export const getUpcomingReservations = async (days: number = 7): Promise<Reservation[]> => {
  const response = await api.get('/reservations/upcoming', { params: { days } });
  return response.data?.data || response.data || [];
};

export const updateReservation = async (
  id: string,
  data: Partial<CreateReservationDto>
): Promise<Reservation> => {
  const response = await api.patch(`/reservations/${id}`, data);
  return response.data?.data || response.data;
};

export const updateReservationStatus = async (
  id: string,
  status: Reservation['status']
): Promise<Reservation> => {
  const response = await api.patch(`/reservations/${id}/status`, { status });
  return response.data?.data || response.data;
};

export const markReservationAsArrived = async (id: string): Promise<Reservation> => {
  const response = await api.patch(`/reservations/${id}/arrived`);
  return response.data?.data || response.data;
};

export const markReservationAsSeated = async (id: string): Promise<Reservation> => {
  const response = await api.patch(`/reservations/${id}/seated`);
  return response.data?.data || response.data;
};

export const deleteReservation = async (id: string): Promise<void> => {
  await api.delete(`/reservations/${id}`);
};
