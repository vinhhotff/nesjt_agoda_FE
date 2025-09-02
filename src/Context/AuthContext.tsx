'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '../Types';
import { login, refresh } from '../lib/api';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>;
  loginAdmin: (data: { email: string; password: string }) => Promise<boolean>;
  logout: (redirectTo?: string) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;

}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    async function checkAuth() {
      setLoading(true);

      const userData = localStorage.getItem('user');
      const tokenData = Cookies.get(process.env.NEXT_PUBLIC_JWT_COOKIE_NAME!);

      if (userData && tokenData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem('user');
          Cookies.remove(process.env.NEXT_PUBLIC_JWT_COOKIE_NAME!);
          setLoading(false);
        }
      }

      if (!userData || !tokenData) {
        try {
          const response = await refresh();
          if (response.data && response.data.data && response.data.data.user) {
            setUser(response.data.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
            Cookies.set(process.env.NEXT_PUBLIC_JWT_COOKIE_NAME!, response.data.data.accessToken, {
              expires: 1,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              path: '/',
            });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Refresh error:', error);
          setUser(null);
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  async function loginUser(email: string, password: string): Promise<{ success: boolean; role?: string }> {
    try {
      console.log('Starting login process...');
      const res = await login(email, password);
      console.log('Login response:', res.data);

      if (!res || !res.data || !res.data.data || !res.data.data.user) {
        toast.error('Invalid server response. Please try again.');
        return { success: false };
      }

      const userData = res.data.data.user;
      const accessToken = res.data.data.accessToken;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      Cookies.set(process.env.NEXT_PUBLIC_JWT_COOKIE_NAME!, accessToken, {
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
  }
  async function loginAdmin(data: { email: string; password: string }) {
    try {
      const res = await login(data.email, data.password);
      console.log('Admin login response:', res.data);

      if (res.data && res.data.data && res.data.data.user) {
        const userData = res.data.data.user;
        const accessToken = res.data.data.accessToken;

        // Check if user is admin
        if (userData.role.toLowerCase() !== 'admin') {
          toast.error('Access denied. Admin privileges required.');
          return false;
        }

        // Store user data and token
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        Cookies.set(process.env.NEXT_PUBLIC_JWT_COOKIE_NAME!, accessToken, {
          expires: 1, // or whatever your expiration logic is
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        });

        // Show success toast
        toast.success(`Welcome back, Admin ${userData.name}!`);
        return true;
      } else {
        // Login failed - wrong credentials
        toast.error('Invalid email or password. Please try again.');
      }
    } catch (error: any) {
      console.error('Admin login failed:', error);

      // Handle different error types
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
  }
  async function logout(redirectTo: string = "/") {
    setUser(null);
    localStorage.removeItem("user");
    Cookies.remove(process.env.NEXT_PUBLIC_JWT_COOKIE_NAME!)
    Cookies.remove(process.env.NEXT_PUBLIC_JWT_COOKIE_NAME_REFRESH!)
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 500);
  }
  return (
    <AuthContext.Provider value={{ user, loading, login: loginUser, loginAdmin: loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext }
