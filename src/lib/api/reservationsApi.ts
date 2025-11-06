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
  numberOfGuests: number;
  reservationDate: string;
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

  // Create new reservation (public - no auth required)
  async createReservationPublic(data: CreateReservationDto): Promise<Reservation> {
    const response = await api.post(`${this.baseUrl}/public`, data);
    return response.data;
  }

  // Create new reservation (requires auth)
  async createReservation(data: CreateReservationDto): Promise<Reservation> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  // Helper to transform reservation from backend to frontend format
  private transformReservation(reservation: any): Reservation {
    // Extract time from reservationDate (ISO string like "2025-11-03T07:30:00.000Z")
    let reservationTime = '';
    let reservationDateFormatted = '';
    
    if (reservation.reservationDate) {
      try {
        const date = new Date(reservation.reservationDate);
        // Get local time (convert from UTC to local)
        reservationTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        // Format date as YYYY-MM-DD
        reservationDateFormatted = date.toISOString().split('T')[0];
      } catch (e) {
        console.error('Error parsing reservationDate:', e);
        // Fallback: try to extract from string
        if (typeof reservation.reservationDate === 'string') {
          const parts = reservation.reservationDate.split('T');
          if (parts[0]) reservationDateFormatted = parts[0];
          if (parts[1]) {
            const timePart = parts[1].split(':');
            if (timePart.length >= 2) {
              reservationTime = `${timePart[0]}:${timePart[1]}`;
            }
          }
        }
      }
    }

    return {
      _id: reservation._id,
      customerName: reservation.customerName || '',
      customerPhone: reservation.customerPhone || '',
      customerEmail: reservation.customerEmail,
      partySize: reservation.numberOfGuests || reservation.partySize || 0,
      reservationDate: reservationDateFormatted,
      reservationTime: reservationTime,
      status: (reservation.status as ReservationStatus) || ReservationStatus.PENDING,
      table: reservation.tableNumber || reservation.table,
      specialRequests: reservation.specialRequests,
      createdAt: reservation.createdAt || new Date().toISOString(),
      updatedAt: reservation.updatedAt || new Date().toISOString(),
    };
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
    
    // Backend response format: { statusCode, message, data: { reservations: [], total, totalPages } }
    const responseData = response.data?.data || response.data;
    const reservations = responseData?.reservations || responseData?.items || [];
    
    // Transform reservations to match frontend interface
    const transformedReservations = Array.isArray(reservations) 
      ? reservations.map((r: any) => this.transformReservation(r))
      : [];
    
    return {
      items: transformedReservations,
      total: responseData?.total || transformedReservations.length,
      page: responseData?.page || page,
      limit: responseData?.limit || limit,
      totalPages: responseData?.totalPages || 1,
    };
  }

  // Get single reservation
  async getReservation(id: string): Promise<Reservation> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    const data = response.data?.data || response.data;
    return this.transformReservation(data);
  }

  // Get today's reservations
  async getTodayReservations(): Promise<Reservation[]> {
    const response = await api.get(`${this.baseUrl}/today`);
    const data = response.data?.data || response.data;
    const reservations = Array.isArray(data) ? data : (data?.reservations || []);
    return reservations.map((r: any) => this.transformReservation(r));
  }

  // Get upcoming reservations
  async getUpcomingReservations(days: number = 7): Promise<Reservation[]> {
    const response = await api.get(`${this.baseUrl}/upcoming?days=${days}`);
    const data = response.data?.data || response.data;
    const reservations = Array.isArray(data) ? data : (data?.reservations || []);
    return reservations.map((r: any) => this.transformReservation(r));
  }

  // Get reservation stats
  async getReservationStats(): Promise<ReservationStats> {
    const response = await api.get(`${this.baseUrl}/stats`);
    const data = response.data?.data || response.data;
    
    return {
      total: data?.total || 0,
      pending: data?.pending || 0,
      confirmed: data?.confirmed || 0,
      completed: data?.completed || 0,
      cancelled: data?.cancelled || 0,
      todayReservations: data?.todayReservations || 0,
      upcomingReservations: data?.upcomingReservations || 0,
    };
  }

  // Get my reservations (for logged in user)
  async getMyReservations(): Promise<Reservation[]> {
    const response = await api.get(`${this.baseUrl}/my/reservations`);
    const data = response.data?.data || response.data;
    const reservations = Array.isArray(data) ? data : (data?.reservations || []);
    return reservations.map((r: any) => this.transformReservation(r));
  }

  // Get reservations by phone
  async getReservationsByPhone(phone: string): Promise<Reservation[]> {
    const response = await api.get(`${this.baseUrl}/phone/${phone}`);
    const data = response.data?.data || response.data;
    const reservations = Array.isArray(data) ? data : (data?.reservations || []);
    return reservations.map((r: any) => this.transformReservation(r));
  }

  // Update reservation status
  async updateReservationStatus(
    id: string,
    statusData: UpdateReservationStatusDto
  ): Promise<Reservation> {
    const response = await api.patch(`${this.baseUrl}/${id}/status`, statusData);
    const data = response.data?.data || response.data;
    return this.transformReservation(data);
  }

  // Cancel reservation (user)
  async cancelReservation(id: string): Promise<Reservation> {
    const response = await api.patch(`${this.baseUrl}/${id}/cancel`);
    const data = response.data?.data || response.data;
    return this.transformReservation(data);
  }

  // Admin cancel reservation
  async adminCancelReservation(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Utility functions
  formatReservationDateTime(reservation: Reservation): string {
    try {
      // If reservationTime exists, combine with date
      if (reservation.reservationTime) {
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
      // Otherwise, parse from reservationDate if it's a full ISO string
      const date = new Date(reservation.reservationDate);
      return date.toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return reservation.reservationDate || 'N/A';
    }
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
