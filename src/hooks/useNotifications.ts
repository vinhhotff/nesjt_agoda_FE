'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { INotification } from '@/src/Types';
import { useAuth } from '@/src/Context/AuthContext';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/src/lib/api/notificationApi';
import Cookies from 'js-cookie';

export function useNotifications() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    const token = Cookies.get('accessToken');
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8083';
    
    const guestId = !user && typeof window !== 'undefined' ? localStorage.getItem('guestId') : undefined;
    const newSocket = io(`${socketUrl}/notifications`, {
      auth: {
        token,
        guestId: guestId || undefined,
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      // console.log removed
      setSocket(newSocket);
    });

    newSocket.on('disconnect', () => {
      // console.log removed
    });

    newSocket.on('notification', (notification: INotification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    });

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const guestId = !user && typeof window !== 'undefined' ? localStorage.getItem('guestId') : undefined;
        const [notificationsData, count] = await Promise.all([
          getNotifications(1, 20, false, guestId || undefined),
          getUnreadCount(guestId || undefined),
        ]);
        setNotifications(notificationsData.data || []);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (socket?.connected || !user) {
      fetchNotifications();
    }
  }, [socket, user]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const guestId = !user && typeof window !== 'undefined' ? localStorage.getItem('guestId') : undefined;
      await markAllAsRead(guestId || undefined);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [user]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n._id === id);
      const newNotifications = prev.filter((n) => n._id !== id);
      // Decrease unread count if notification was unread
      if (notification && !notification.read) {
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
      }
      return newNotifications;
    });
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    removeNotification,
  };
}

