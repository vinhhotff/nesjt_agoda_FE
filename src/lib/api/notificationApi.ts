import { api } from './callApi';
import { INotification, PaginatedNotification } from '@/src/Types';

const unwrapResponse = <T>(response: any): T => {
  return response.data?.data || response.data;
};

export const getNotifications = async (
  page: number = 1,
  limit: number = 20,
  unreadOnly: boolean = false,
  guestId?: string,
): Promise<PaginatedNotification> => {
  const response = await api.get('/notifications', {
    params: { page, limit, unreadOnly, guestId },
  });
  return unwrapResponse<PaginatedNotification>(response);
};

export const getUnreadCount = async (guestId?: string): Promise<number> => {
  const response = await api.get('/notifications/unread-count', {
    params: { guestId },
  });
  return unwrapResponse<{ count: number }>(response).count;
};

export const markAsRead = async (id: string): Promise<INotification> => {
  const response = await api.patch(`/notifications/${id}/read`);
  return unwrapResponse<INotification>(response);
};

export const markAllAsRead = async (guestId?: string): Promise<void> => {
  await api.patch('/notifications/mark-all-read', null, {
    params: { guestId },
  });
};

export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

