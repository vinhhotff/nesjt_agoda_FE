'use client'
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { User } from '../Types';
import { login, refresh, logout } from '../lib/api';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const TOKEN_KEY = process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || 'token';
const USER_KEY = 'user';

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

}
function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    async function checkAuth() {
      const token = Cookies.get(TOKEN_KEY);
      if (!token) {
        setUser(null);
        localStorage.removeItem(USER_KEY);
        setLoading(false);
        return;
      }

      // Use stored user immediately (non-blocking)
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      try {
        const response = await refresh();
        if (response.data?.data?.user) {
          const userData = response.data.data.user;
          setUser(userData);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } else {
          if (!storedUser) {
            setUser(null);
            localStorage.removeItem(USER_KEY);
          }
        }
      } catch (err: any) {
        if (err?.response?.status === 400 || err?.response?.status === 401) {
          setUser(null);
          localStorage.removeItem(USER_KEY);
        }
        // If we have stored user, keep them logged in
      }

      setLoading(false);
    }

    checkAuth();
  }, [isMounted]);


  const loginUser = useCallback(async (email: string, password: string): Promise<{ success: boolean; role?: string }> => {
    try {
      const res = await login(email, password);

      if (!res || !res.data || !res.data.data || !res.data.data.user) {
        toast.error('Invalid server response. Please try again.');
        return { success: false };
      }

      const userData = res.data.data.user;
      const accessToken = res.data.data.accessToken;

      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      Cookies.set(TOKEN_KEY, accessToken, {
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      toast.success(`Welcome back, ${userData.name}!`);
      const role = userData.role.toLowerCase();
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
  }, []);
  const loginAdmin = useCallback(async (data: { email: string; password: string }) => {
    try {
      const res = await login(data.email, data.password);

      if (res.data && res.data.data && res.data.data.user) {
        const userData = res.data.data.user;
        const accessToken = res.data.data.accessToken;

        if (userData.role.toLowerCase() !== 'admin') {
          toast.error('Access denied. Admin privileges required.');
          return false;
        }

        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        Cookies.set(TOKEN_KEY, accessToken, {
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        });

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
  const logoutUser = useCallback(async (redirectTo: string = "/") => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    Cookies.remove(TOKEN_KEY, { path: '/' });
    await logout();
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 500);
  }, []);

  const value = useMemo(() => ({ user, loading, login: loginUser, loginAdmin, logoutUser }), [user, loading, loginUser, loginAdmin, logoutUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext }
