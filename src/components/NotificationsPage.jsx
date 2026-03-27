import React, { useState, useEffect, useCallback } from 'react';
import { FiBell, FiTrash2, FiCheckCircle, FiChevronLeft, FiShoppingBag, FiUserPlus, FiInfo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ordersPageStyles as styles } from '../assets/dummyStyles';
import { useAuth } from '../context/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

const NotificationsPage = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const { isSupported, hasSubscription, subscribe, unsubscribe, loading: pushLoading } = usePushNotifications();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/api/notifications/history?page=${page}&limit=20`);
            if (response.data.success) {
                setNotifications(response.data.notifications);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        } else {
            navigate('/login');
        }
    }, [isAuthenticated, fetchNotifications, navigate]);

    const markAsRead = async (id, link) => {
        try {
            await api.patch(`/api/notifications/history/${id}/read`);
            setNotifications(prev => 
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            if (link) {
                navigate(link);
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/api/notifications/history/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/api/notifications/history/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <FiShoppingBag className="text-emerald-400" />;
            case 'registration': return <FiUserPlus className="text-blue-400" />;
            default: return <FiInfo className="text-emerald-300" />;
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => navigate(-1)} className={styles.backLink}>
                        <FiChevronLeft className="mr-1" /> Back
                    </button>
                    <h1 className={styles.mainTitle}>
                        System <span className={styles.titleSpan}>Notifications</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Stay updated with the latest activities on FlashBasket.
                    </p>
                    <div className={styles.titleDivider}>
                        <div className={styles.dividerLine}></div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-emerald-800/20 p-4 rounded-2xl border border-emerald-700/30 gap-4">
                    <div>
                        <h3 className="text-emerald-100 font-medium flex items-center">
                            <FiBell className="mr-2 text-emerald-400" /> Order Updates
                        </h3>
                        <p className="text-emerald-400/80 text-xs mt-1">Get push notifications when your order status changes.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
                        {isSupported && (
                            <button
                                onClick={hasSubscription ? unsubscribe : subscribe}
                                disabled={pushLoading}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    hasSubscription 
                                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' 
                                        : 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
                                } ${pushLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {pushLoading ? 'Processing...' : hasSubscription ? 'Disable Alerts' : 'Enable Alerts'}
                            </button>
                        )}
                        <button 
                            onClick={markAllAsRead}
                            className="flex-1 sm:flex-none flex justify-center items-center bg-emerald-700/50 hover:bg-emerald-700 text-emerald-100 px-4 py-2 rounded-full transition-colors text-sm"
                        >
                            <FiCheckCircle className="mr-2" /> Mark Read
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div 
                                key={notif._id}
                                onClick={() => markAsRead(notif._id, notif.link)}
                                className={`flex items-start p-5 rounded-2xl border transition-all cursor-pointer ${
                                    notif.isRead 
                                    ? 'bg-emerald-800/20 border-emerald-700/30' 
                                    : 'bg-emerald-700/40 border-emerald-500 shadow-lg shadow-emerald-950/20'
                                }`}
                            >
                                <div className={`p-3 rounded-xl mr-4 ${notif.isRead ? 'bg-emerald-900/40' : 'bg-emerald-600/40'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold ${notif.isRead ? 'text-emerald-200' : 'text-emerald-50'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-xs text-emerald-400 font-medium whitespace-nowrap ml-4">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${notif.isRead ? 'text-emerald-300' : 'text-emerald-100'}`}>
                                        {notif.message}
                                    </p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                                    className="ml-4 p-2 text-emerald-500/50 hover:text-red-400 transition-colors"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-emerald-800/20 rounded-3xl border border-dashed border-emerald-700">
                            <FiBell className="mx-auto text-5xl text-emerald-700 mb-4" />
                            <h3 className="text-xl font-bold text-emerald-200">No notifications found</h3>
                            <p className="text-emerald-400">We'll notify you when something important happens.</p>
                        </div>
                    )}
                </div>

                {pagination.pages > 1 && (
                    <div className="mt-8 flex justify-center space-x-2">
                        {[...Array(pagination.pages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => fetchNotifications(i + 1)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                    pagination.page === i + 1
                                    ? 'bg-emerald-500 text-black font-bold'
                                    : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
