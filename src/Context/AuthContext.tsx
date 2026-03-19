'use client'
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { User } from '../Types';
import { login as apiLogin, refresh as apiRefresh, logout as apiLogout } from '../lib/api';
import { toast } from 'react-toastify';

const TOKEN_KEY = 'auth_token';
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

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
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
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setLoading(false);
        return;
      }

      // Use stored user immediately (non-blocking)
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      try {
        const response = await apiRefresh();
        if (response.data?.data?.user) {
          const userData = response.data.data.user;
          setUser(userData);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } else {
          if (!storedUser) {
            setUser(null);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(TOKEN_KEY);
          }
        }
      } catch (err: any) {
        if (err?.response?.status === 400 || err?.response?.status === 401) {
          setUser(null);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
        }
      }

      setLoading(false);
    }

    checkAuth();
  }, [isMounted]);


  const loginUser = useCallback(async (email: string, password: string): Promise<{ success: boolean; role?: string }> => {
    try {
      const res = await apiLogin(email, password);

      if (!res || !res.data || !res.data.data || !res.data.data.user) {
        toast.error('Invalid server response. Please try again.');
        return { success: false };
      }

      const userData = res.data.data.user;
      const accessToken = res.data.data.accessToken;

      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
      }

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
      const res = await apiLogin(data.email, data.password);

      if (!res || !res.data || !res.data.data || !res.data.data.user) {
        return false;
      }

      const userData = res.data.data.user;
      const accessToken = res.data.data.accessToken;

      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
      }

      const role = userData.role?.name?.toLowerCase() || userData.role?.toLowerCase() || '';
      
      if (role !== 'admin') {
        toast.error('You do not have permission to access the admin area.');
        setUser(null);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        return false;
      }

      toast.success(`Welcome back, ${userData.name}!`);
      return true;
    } catch (apiError: any) {
      console.error('API Error in loginAdmin:', apiError);
      if (apiError.response?.status === 400 || apiError.response?.status === 401) {
        toast.error('Invalid email or password. Please try again.');
      } else if (apiError.response?.status === 403) {
        toast.error('Access denied. You do not have permission to access the admin area.');
      } else if (apiError.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (apiError.code === 'NETWORK_ERROR' || apiError.message?.includes('Network Error')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Login failed. Please try again.');
      }
      return false;
    }
  }, []);
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
  }, []);
  
  const logoutUser = useCallback((redirectTo?: string) => {
    try {
      apiLogout();
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    
    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      window.location.href = '/login';
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login: loginUser,
    loginAdmin,
    logoutUser,
  }), [user, loading, loginUser, loginAdmin, logoutUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
