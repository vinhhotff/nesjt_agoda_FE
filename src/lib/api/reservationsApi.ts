import { api } from './callApi';

// Types
export interface Reservation {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: ReservationStatus;
  table?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SEATED = 'seated',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show',
}

export interface CreateReservationDto {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  specialRequests?: string;
}

export interface UpdateReservationStatusDto {
  status: ReservationStatus;
  notes?: string;
}

export interface PaginatedReservations {
  items: Reservation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  todayReservations: number;
  upcomingReservations: number;
}

// API Functions
class ReservationsAPI {
  private baseUrl = '/reservations';

  // Create new reservation
  async createReservation(data: CreateReservationDto): Promise<Reservation> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  // Get paginated reservations with filters
  async getReservations(
    page: number = 1,
    limit: number = 10,
    status?: ReservationStatus,
    date?: string
  ): Promise<PaginatedReservations> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) params.append('status', status);
    if (date) params.append('date', date);

    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  // Get single reservation
  async getReservation(id: string): Promise<Reservation> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get today's reservations
  async getTodayReservations(): Promise<Reservation[]> {
    const response = await api.get(`${this.baseUrl}/today`);
    return response.data;
  }

  // Get upcoming reservations
  async getUpcomingReservations(days: number = 7): Promise<Reservation[]> {
    const response = await api.get(`${this.baseUrl}/upcoming?days=${days}`);
    return response.data;
  }

  // Get reservation stats
  async getReservationStats(): Promise<ReservationStats> {
    const response = await api.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Get my reservations (for logged in user)
  async getMyReservations(): Promise<Reservation[]> {
    const response = await api.get(`${this.baseUrl}/my/reservations`);
    return response.data;
  }

  // Get reservations by phone
  async getReservationsByPhone(phone: string): Promise<Reservation[]> {
    const response = await api.get(`${this.baseUrl}/phone/${phone}`);
    return response.data;
  }

  // Update reservation status
  async updateReservationStatus(
    id: string,
    statusData: UpdateReservationStatusDto
  ): Promise<Reservation> {
    const response = await api.patch(`${this.baseUrl}/${id}/status`, statusData);
    return response.data;
  }

  // Cancel reservation (user)
  async cancelReservation(id: string): Promise<Reservation> {
    const response = await api.patch(`${this.baseUrl}/${id}/cancel`);
    return response.data;
  }

  // Admin cancel reservation
  async adminCancelReservation(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Utility functions
  formatReservationDateTime(reservation: Reservation): string {
    const date = new Date(`${reservation.reservationDate}T${reservation.reservationTime}`);
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusColor(status: ReservationStatus): string {
    const colors = {
      [ReservationStatus.PENDING]: '#fbbf24', // amber-400
      [ReservationStatus.CONFIRMED]: '#10b981', // emerald-500
      [ReservationStatus.SEATED]: '#3b82f6', // blue-500
      [ReservationStatus.COMPLETED]: '#6b7280', // gray-500
      [ReservationStatus.CANCELLED]: '#ef4444', // red-500
      [ReservationStatus.NO_SHOW]: '#f59e0b', // amber-500
    };
    return colors[status] || '#6b7280';
  }

  getStatusText(status: ReservationStatus): string {
    const texts = {
      [ReservationStatus.PENDING]: 'Chờ xác nhận',
      [ReservationStatus.CONFIRMED]: 'Đã xác nhận',
      [ReservationStatus.SEATED]: 'Đã nhận bàn',
      [ReservationStatus.COMPLETED]: 'Hoàn thành',
      [ReservationStatus.CANCELLED]: 'Đã hủy',
      [ReservationStatus.NO_SHOW]: 'Không đến',
    };
    return texts[status] || status;
  }
}

export const reservationsAPI = new ReservationsAPI();
