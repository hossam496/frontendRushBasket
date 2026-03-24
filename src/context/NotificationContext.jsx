import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all notifications initially
  const fetchNotifications = useCallback(async () => {
    if (!user || user.role !== 'admin') {
      setIsLoading(false);
      return;
    }
    
    try {
      const { data } = await api.get('/api/notifications/history?limit=20');
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('[NotificationContext] Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fast polling just for the unread count
  const pollUnreadCount = useCallback(async () => {
    if (!user || user.role !== 'admin') return;

    try {
      const { data } = await api.get('/api/notifications/history/unread-count');
      if (data.success && data.count !== unreadCount) {
        // If the unread count grew, we should fetch the actual notifications again to show the new ones in the list
        if (data.count > unreadCount) {
          fetchNotifications();
        } else {
          setUnreadCount(data.count);
        }
      }
    } catch (error) {
      console.error('[NotificationContext] Polling error:', error);
    }
  }, [user, unreadCount, fetchNotifications]);

  // Setup initial fetch and polling
  useEffect(() => {
    fetchNotifications();

    if (user && user.role === 'admin') {
      const interval = setInterval(pollUnreadCount, 10000); // 10 seconds polling
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, pollUnreadCount, user]);

  // Mark single as read
  const markAsRead = async (id) => {
    try {
      // Optimistic UI update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      await api.patch(`/api/notifications/history/${id}/read`);
    } catch (error) {
      // Revert if failed (optional, simplified here)
      fetchNotifications();
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
      fetchNotifications();
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
