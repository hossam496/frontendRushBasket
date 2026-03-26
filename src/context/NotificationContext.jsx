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

    // Poll every 15 seconds (Temporarily disabled to verify real Web Push)
    // const interval = setInterval(() => {
    //     const scheduleTask = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    //     
    //     scheduleTask(async () => {
    //         try {
    //           const { data } = await api.get('/api/notifications/history/unread-count');
    //           if (data.success) {
    //             const newCount = data.count ?? 0;
    //             if (newCount > unreadCountRef.current) {
    //               // Count increased — fetch the full list and show toast
    //               const historyRes = await api.get('/api/notifications/history?limit=1');
    //               if (historyRes.data.success && historyRes.data.notifications.length > 0) {
    //                 const latest = historyRes.data.notifications[0];
    //                 toast.success(
    //                   (t) => (
    //                     <div onClick={() => { toast.dismiss(t.id); }}>
    //                       <p className="font-bold text-sm">{latest.title}</p>
    //                       <p className="text-xs">{latest.message}</p>
    //                     </div>
    //                   ),
    //                   { duration: 5000, icon: '🔔' }
    //                 );
    //               }
    //               fetchRef.current();
    //             } else if (newCount < unreadCountRef.current) {
    //               // Count decreased (maybe read on another tab)
    //               fetchRef.current();
    //             }
    //           }
    //         } catch (error) {
    //           console.warn('[NotificationContext] Poll error:', error.message);
    //         }
    //     });
    // }, 15000);

    // return () => clearInterval(interval);
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
