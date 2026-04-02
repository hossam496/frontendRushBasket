import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import socketService from '../services/socketService';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      socketService.disconnect();
      return;
    }

    fetchNotifications();

    // Initialize Socket Connection
    const socket = socketService.connect(user.id, user.role);

    socketService.on('new_notification', (notification) => {
      console.log('🔔 New real-time notification:', notification);

      setNotifications(prev => [notification, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);

      toast.success(
        (t) => (
          <div onClick={() => { toast.dismiss(t.id); }}>
            <p className="font-bold text-sm">{notification.title}</p>
            <p className="text-xs">{notification.message}</p>
          </div>
        ),
        { duration: 5000, icon: '🔔' }
      );
    });

    // Fallback polling (less frequent now with sockets)
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 60000);

    return () => {
      clearInterval(intervalId);
      socketService.off('new_notification');
    };
  }, [isAuthenticated, user, fetchNotifications]);

  // Mark single as read
  const markAsRead = async (id) => {
    try {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await api.patch(`/api/notifications/history/${id}/read`);
    } catch (error) {
      fetchRef.current();
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await api.patch('/api/notifications/history/read-all');
    } catch (error) {
      fetchRef.current();
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/history/${id}`);
      const deletedNotif = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      fetchRef.current();
    }
  };

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications
  }), [notifications, unreadCount, isLoading, fetchNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
