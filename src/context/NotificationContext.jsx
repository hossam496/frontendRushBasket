import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Use a ref to track the current unread count without causing stale closures in interval callbacks
  const unreadCountRef = useRef(0);
  unreadCountRef.current = unreadCount;

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    if (!user || user.role !== 'admin') {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/api/notifications/history?limit=20');
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch (error) {
      console.error('[NotificationContext] Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Setup initial fetch + stable polling interval
  // We use a ref for fetchNotifications to avoid restarting the interval on every render
  const fetchRef = useRef(fetchNotifications);
  fetchRef.current = fetchNotifications;

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setIsLoading(false);
      return;
    }

    // Initial load
    fetchRef.current();

    // Poll every 10 seconds — stable interval that never gets recreated
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get('/api/notifications/history/unread-count');
        if (data.success) {
          const newCount = data.count ?? 0;
          if (newCount !== unreadCountRef.current) {
            // Count changed — re-fetch the full list to get new notifications
            fetchRef.current();
          }
        }
      } catch (error) {
        // Silently ignore poll errors to prevent dashboard disruption
        console.warn('[NotificationContext] Poll error (non-critical):', error.message);
      }
    }, 10000);

    return () => clearInterval(interval);
  // Only restart if user changes (login/logout), NOT on every unread count change
  }, [user]);

  // Mark single as read
  const markAsRead = async (id) => {
    try {
      // Optimistic UI update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await api.patch(`/api/notifications/history/${id}/read`);
    } catch (error) {
      fetchRef.current(); // Re-sync on error
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Optimistic UI update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      await api.patch('/api/notifications/history/read-all');
    } catch (error) {
      fetchRef.current();
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshUserNotifications: fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
