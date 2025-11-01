import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const res = await api.get('/auth/refresh');
        const newToken = res.data.accessToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', newToken);
        }
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config);
      } catch (err) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper to detect analytics 404 for silent handling
export const isAnalyticsEndpointMissing = (error: any): boolean => {
  return (
    error?.response?.status === 404 && error?.config?.url?.includes('/analytics/')
  );
};

const createTimeoutPromise = (timeout: number = 30000) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error('Analytics API timeout')), timeout));

export const callApi = async <T = any>(url: string, params?: URLSearchParams, timeout = 30000): Promise<T> => {
  const fullUrl = params ? `${url}?${params.toString()}` : url;
  const response = (await Promise.race([api.get<T>(fullUrl), createTimeoutPromise(timeout)])) as any;
  return response.data as T;
};
