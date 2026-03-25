import axios from 'axios';

// Sử dụng relative path trong production để tránh CORS (qua Next.js rewrites)
// Sử dụng absolute URL trong development
const getBaseURL = () => {
  if (typeof window === 'undefined') {
    // Server-side: sử dụng environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // Ensure it ends with /api/v1, remove trailing slashes first
    if (apiUrl) {
      return apiUrl.replace(/\/+$/, '') + (apiUrl.includes('/api/v1') ? '' : '/api/v1');
    }
    return 'https://be-vang.onrender.com/api/v1';
  }
  
  // Client-side: kiểm tra xem có đang chạy trên Vercel/production không
  const isProduction = window.location.hostname.includes('vercel.app') || 
                       window.location.hostname.includes('vercel.com') ||
                       process.env.NEXT_PUBLIC_USE_PROXY === 'true';
  
  if (isProduction) {
    // Production: sử dụng relative path để tránh CORS (qua Next.js rewrites)
    // Rewrite sẽ thêm /api/v1/ vào, nên chỉ cần /api
    return '/api';
  }
  
  // Development: sử dụng environment variable hoặc localhost
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    // Ensure it ends with /api/v1
    return apiUrl.replace(/\/+$/, '') + (apiUrl.includes('/api/v1') ? '' : '/api/v1');
  }
  return 'http://localhost:8083/api/v1';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    console.log('[API Request]', config.method?.toUpperCase(), config.url, config.params || '', config.data || '');
    const token =
      (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null) ||
      undefined;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('[API Response OK]', response.config.method?.toUpperCase(), response.config.url, '→', response.status, typeof response.data === 'object' ? Object.keys(response.data) : response.data);
    return response;
  },
  async (error) => {
    console.error('[API Response Error]', error?.config?.method?.toUpperCase(), error?.config?.url, '→', error?.response?.status, error?.response?.data, 'message:', error.message);
    // Only attempt refresh if we have a 401 and it's not already a refresh request
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/refresh')) {
      // Check if this is a public route that doesn't require auth
      const publicRoutes = ['/reservations/public', '/payment/payos/', '/guests', '/tables'];
      const isPublicRoute = publicRoutes.some(route => error.config?.url?.includes(route));
      
      // If it's a public route, don't try to refresh token
      if (isPublicRoute) {
        return Promise.reject(error);
      }
      
      try {
        console.log('[Auth] 401 detected, attempting token refresh...');
        const res = await api.get('/auth/refresh');
        console.log('[Auth] refresh response:', res.status, JSON.stringify(res.data).slice(0, 200));
        const newToken = res.data?.accessToken || res.data?.data?.accessToken;
        if (newToken) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', newToken);
          }
          error.config.headers.Authorization = `Bearer ${newToken}`;
          console.log('[Auth] Token refreshed, retrying original request:', error.config.url);
          return api.request(error.config);
        }
      } catch (err: any) {
        console.warn('[Auth] Refresh token failed:', err?.response?.status, err?.response?.data, err?.message);
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
