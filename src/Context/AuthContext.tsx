'use client'
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { User } from '../Types';
import { login, refresh, logout } from '../lib/api';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>;
  loginAdmin: (data: { email: string; password: string }) => Promise<boolean>;
  logoutUser: (redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Đọc user từ localStorage ngay lập tức để tránh flash màn hình trống
function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Khởi tạo user ngay từ localStorage để tránh flickering khi refresh trang
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      setLoading(true);
      try {
        // Gọi /auth/refresh - BE dùng httpOnly refreshToken cookie để xác thực
        const response = await refresh();
        if (response.data?.data?.user) {
          const freshUser = response.data.data.user;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } else {
          // Refresh thất bại → clear user
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Refresh error:', err);
        // Nếu refresh lỗi (ví dụ refreshToken hết hạn), clear user
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const loginUser = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; role?: string }> => {
      try {
        const res = await login(email, password);

        if (!res?.data?.data?.user) {
          toast.error('Invalid server response. Please try again.');
          return { success: false };
        }

        const userData: User = res.data.data.user;
        // BE đã set httpOnly cookies (accessToken + refreshToken) tự động.
        // FE chỉ cần lưu user data vào state + localStorage.
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        toast.success(`Welcome back, ${userData.name}!`);
        const role = (userData.role as string).toLowerCase();
        return { success: true, role };
      } catch (apiError: any) {
        console.error('API Error in loginUser:', apiError);
        if (apiError.response?.status === 400) {
          toast.error('Invalid email or password. Please try again.');
        } else if (apiError.response?.status === 401) {
          toast.error('Unauthorized. Please try again.');
        } else if (apiError.response?.status === 403) {
          toast.error('Access denied. Please check your credentials.');
        } else if (apiError.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (apiError.code === 'NETWORK_ERROR' || apiError.message?.includes('Network Error')) {
          toast.error('Network error. Please check your connection.');
        } else if (apiError.response?.data?.message) {
          toast.error(apiError.response.data.message);
        } else {
          toast.error('Login failed. Please try again.');
        }
        return { success: false };
      }
    },
    [],
  );

  const loginAdmin = useCallback(async (data: { email: string; password: string }): Promise<boolean> => {
    try {
      const res = await login(data.email, data.password);

      if (res?.data?.data?.user) {
        const userData: User = res.data.data.user;

        if ((userData.role as string).toLowerCase() !== 'admin') {
          toast.error('Access denied. Admin privileges required.');
          return false;
        }

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success(`Welcome back, Admin ${userData.name}!`);
        return true;
      } else {
        toast.error('Invalid email or password. Please try again.');
      }
    } catch (error: any) {
      console.error('Admin login failed:', error);
      if (error.response?.status === 400 || error.response?.status === 401) {
        toast.error('Invalid email or password. Please try again.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
    return false;
  }, []);

  const logoutUser = useCallback(async (redirectTo: string = '/') => {
    setUser(null);
    localStorage.removeItem('user');
    await logout();
    toast.success('Logged out successfully');
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 500);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login: loginUser, loginAdmin, logoutUser }),
    [user, loading, loginUser, loginAdmin, logoutUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
