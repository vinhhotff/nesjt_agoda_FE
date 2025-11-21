import { api } from './callApi';

export interface Reservation {
  _id: string;
  table: {
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
  status: 'pending' | 'confirmed' | 'arrived' | 'seated' | 'completed' | 'cancelled' | 'no_show';
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

  const response = await api.get('/reservations', { params });
  const payload = response.data;

  if (payload?.data) {
    return {
      items: payload.data.data || payload.data.items || [],
      total: payload.data.total || 0,
      page: payload.data.page || page,
      limit: payload.data.limit || limit,
      totalPages: payload.data.totalPages || 0,
    };
  }

  return {
    items: [],
    total: 0,
    page,
    limit,
    totalPages: 0,
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
