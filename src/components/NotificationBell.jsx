import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiTrash2, FiCheck, FiInfo, FiBox, FiUserPlus, FiClock } from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <FiBox className="text-emerald-500" />;
            case 'registration': return <FiUserPlus className="text-blue-500" />;
            case 'product': return <FiInfo className="text-purple-500" />;
            case 'status': return <FiClock className="text-orange-500" />;
            default: return <FiBell className="text-gray-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white hover:bg-emerald-500/10 rounded-full transition-colors"
                aria-label="Notifications"
            >
                <FiBell className="text-2xl" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 md:w-96 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl z-100 overflow-hidden"
                    >
                        <div className="p-4 border-b border-emerald-500/20 flex justify-between items-center bg-slate-900/50">
                            <h3 className="text-white font-bold">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                                >
                                    <FiCheck size={14} /> Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center text-slate-500">
                                    <FiBell className="mx-auto text-4xl mb-3 opacity-20" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`p-4 border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors flex gap-3 relative group ${!notif.isRead ? 'bg-emerald-500/5' : ''}`}
                                    >
                                        <div className="mt-1 bg-slate-800 p-2 rounded-lg h-fit">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notif.isRead ? 'text-white font-semibold' : 'text-slate-300'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <span className="text-[10px] text-slate-500 mt-2 block">
                                                {new Date(notif.createdAt).toLocaleString()}
                                            </span>
                                            {notif.link && (
                                                <Link
                                                    to={notif.link}
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        markAsRead(notif._id);
                                                    }}
                                                    className="text-[10px] text-emerald-400 mt-1 block hover:underline"
                                                >
                                                    View details
                                                </Link>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {!notif.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notif._id)}
                                                    className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                    title="Mark as read"
                                                />
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notif._id)}
                                                className="p-1.5 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-3 text-center border-t border-emerald-500/20">
                                <Link
                                    to="/myorders"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                                >
                                    View all history
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
