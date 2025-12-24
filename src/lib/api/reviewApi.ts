import { api } from './callApi';
import { Review, ReviewRating, RatingDistribution, PaginatedReview } from '@/src/Types';

export const createReview = async (data: {
  menuItem: string;
  rating: number;
  comment?: string;
  images?: string[];
  guestName?: string;
}): Promise<Review> => {
  const response = await api.post('/reviews', data);
  return response.data;
};

export const getReviewsByMenuItem = async (
  menuItemId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedReview> => {
  const response = await api.get(`/reviews/menu-item/${menuItemId}`, {
    params: { page, limit },
  });
  // Response interceptor wraps in { data: ... }, so we need to unwrap
  return response.data?.data || response.data;
};

export const getAverageRating = async (menuItemId: string): Promise<ReviewRating> => {
  const response = await api.get(`/reviews/menu-item/${menuItemId}/rating`);
  return response.data?.data || response.data;
};

export const getRatingDistribution = async (
  menuItemId: string
): Promise<RatingDistribution> => {
  const response = await api.get(`/reviews/menu-item/${menuItemId}/rating-distribution`);
  return response.data?.data || response.data;
};

export const getAllReviews = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  menuItemId?: string
): Promise<PaginatedReview> => {
  const response = await api.get('/reviews', {
    params: { page, limit, status, menuItemId },
  });
  // Response interceptor wraps in { data: ... }, so we need to unwrap
  return response.data?.data || response.data;
};

export const getReview = async (id: string): Promise<Review> => {
  const response = await api.get(`/reviews/${id}`);
  return response.data;
};

export const updateReview = async (
  id: string,
  data: {
    rating?: number;
    comment?: string;
    images?: string[];
    status?: string;
  }
): Promise<Review> => {
  const response = await api.patch(`/reviews/${id}`, data);
  return response.data?.data || response.data;
};

export const replyToReview = async (id: string, reply: string): Promise<Review> => {
  const response = await api.patch(`/reviews/${id}/reply`, { reply });
  return response.data?.data || response.data;
};

export const deleteReview = async (id: string): Promise<void> => {
  await api.delete(`/reviews/${id}`);
};

