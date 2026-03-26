import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

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
    if (!user) {
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
  const fetchRef = useRef(fetchNotifications);
  fetchRef.current = fetchNotifications;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    // Initial load
    fetchRef.current();

    // Real-time update via Service Worker postMessage
    if ('serviceWorker' in navigator) {
      const handleMessage = (event) => {
        if (event.data && event.data.type === 'PUSH_NOTIFICATION_RECEIVED') {
          console.log('[NotificationContext] Real-time push received, updating UI...');
          const payload = event.data.data;
          
          if (payload) {
            toast.success(
              (t) => (
                <div onClick={() => { toast.dismiss(t.id); }}>
                  <p className="font-bold text-sm">{payload.title || 'New Notification'}</p>
                  <p className="text-xs">{payload.body || ''}</p>
                </div>
              ),
              { duration: 5000, icon: '🔔' }
            );
          }
          
          // Refresh notification list instantly
          fetchRef.current();
        }
      };
      
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [user]);

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
