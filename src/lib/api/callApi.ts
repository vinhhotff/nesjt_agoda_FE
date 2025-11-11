import axios from 'axios';

// Sử dụng relative path trong production để tránh CORS (qua Next.js rewrites)
// Sử dụng absolute URL trong development
const getBaseURL = () => {
  if (typeof window === 'undefined') {
    // Server-side: sử dụng environment variable
    return process.env.NEXT_PUBLIC_API_URL || 'https://be-vang.onrender.com/api/v1';
  }
  
  // Client-side: kiểm tra xem có đang chạy trên Vercel/production không
  const isProduction = window.location.hostname.includes('vercel.app') || 
                       window.location.hostname.includes('vercel.com') ||
                       process.env.NEXT_PUBLIC_USE_PROXY === 'true';
  
  if (isProduction) {
    // Production: sử dụng relative path để tránh CORS (qua Next.js rewrites)
    return '/api';
  }
  
  // Development: sử dụng environment variable hoặc localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api/v1';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only attempt refresh if we have a 401 and it's not already a refresh request
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/refresh')) {
      try {
        const res = await api.get('/auth/refresh');
        const newToken = res.data?.accessToken || res.data?.data?.accessToken;
        if (newToken) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', newToken);
          }
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api.request(error.config);
        }
      } catch (err: any) {
        // If refresh fails (400 or 401), user is not authenticated
        // Silently fail and let the original error propagate
        // Don't redirect to login here as it might be a public route
        console.warn('Refresh token failed:', err?.response?.status || err?.message);
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
