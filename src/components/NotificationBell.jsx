import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { notificationStyles } from '../assets/dummyStyles';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
    const { isAuthenticated } = useAuth();
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification 
    } = useNotifications();
    
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (id, link) => {
        await markAsRead(id);
        if (link) {
            setIsOpen(false);
            navigate(link);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    if (!isAuthenticated) return null;

    return (
        <div className={notificationStyles.bellContainer} ref={dropdownRef}>
            <button 
                onClick={handleToggle}
                className={notificationStyles.bellButton}
                aria-label="Notifications"
            >
                <FiBell className={notificationStyles.bellIcon} />
                {unreadCount > 0 && (
                    <span className={notificationStyles.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={notificationStyles.dropdown}>
                    <div className={notificationStyles.header}>
                        <h3 className={notificationStyles.headerTitle}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className={notificationStyles.markAllBtn}
                            >
                                <span className="flex items-center">
                                    <FiCheckCircle className="mr-1" /> Mark all read
                                </span>
                            </button>
                        )}
                    </div>

                    <div className={notificationStyles.list}>
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div 
                                    key={notif._id}
                                    onClick={() => handleNotificationClick(notif._id, notif.link)}
                                    className={`${notificationStyles.item} ${!notif.isRead ? notificationStyles.unreadItem : ''}`}
                                >
                                    {!notif.isRead && <div className={notificationStyles.unreadIndicator} />}
                                    <div className={notificationStyles.itemContent}>
                                        <div className={notificationStyles.itemHeader}>
                                            <span className={notificationStyles.itemTitle}>{notif.title}</span>
                                            <span className={notificationStyles.itemTime}>{formatTime(notif.createdAt)}</span>
                                        </div>
                                        <p className={notificationStyles.itemMessage}>{notif.message}</p>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                                        className="absolute right-2 bottom-2 text-emerald-500/30 hover:text-red-400 transition-colors p-1"
                                    >
                                        <FiTrash2 size={12} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className={notificationStyles.empty}>
                                <p className={notificationStyles.emptyText}>No notifications yet</p>
                            </div>
                        )}
                    </div>

                    <div className={notificationStyles.footer}>
                        <button 
                            onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                            className={notificationStyles.viewAll}
                        >
                            View All Notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
