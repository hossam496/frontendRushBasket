import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, CheckCircle2, MoreHorizontal, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import NotificationItem from './NotificationItem';

const NotificationBell = () => {
    const { isAuthenticated } = useAuth();
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification,
        refreshNotifications
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
        if (!isOpen) {
            refreshNotifications();
        }
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            await markAsRead(notif._id);
        }
        if (notif.link) {
            setIsOpen(false);
            navigate(notif.link);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button 
                onClick={handleToggle}
                className="relative p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group active:scale-95"
                aria-label="Notifications"
            >
                <Bell className={`w-5 h-5 transition-colors ${isOpen ? 'text-emerald-400' : 'text-slate-200 group-hover:text-white'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[10px] text-black font-bold items-center justify-center border border-black/20 text-center leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                         </span>
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed sm:absolute inset-0 sm:inset-auto sm:right-0 sm:top-full sm:mt-3 w-full sm:w-96 h-[100dvh] sm:h-auto bg-gray-900 sm:bg-gray-900/80 backdrop-blur-2xl border-t sm:border border-white/10 sm:rounded-2xl shadow-2xl z-[9999] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="sticky top-0 px-5 py-5 border-b border-white/5 flex justify-between items-center bg-white/5 z-10 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="sm:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <Bell className="w-5 h-5 rotate-12 text-emerald-400" />
                                </button>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                                    <p className="text-[10px] text-gray-500 font-medium sm:hidden">
                                        Stay updated with your activities
                                    </p>
                                </div>
                                {unreadCount > 0 && (
                                    <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/20">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/10"
                                >
                                    Clear All
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-full"
                                >
                                    <Trash2 className="w-5 h-5" /> 
                                </button>
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent overscroll-contain pb-20 sm:pb-0 sm:max-h-[440px]">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((notif) => (
                                        <NotificationItem 
                                            key={notif._id} 
                                            notification={notif}
                                            onClick={() => handleNotificationClick(notif)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center py-20 px-6 text-center"
                                >
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                                        <Bell className="w-10 h-10 text-gray-700" />
                                    </div>
                                    <p className="text-base font-bold text-gray-300">No notifications yet</p>
                                    <p className="text-sm text-gray-600 mt-2 max-w-[200px]">We'll alert you when something happens</p>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer (Always sticky at bottom on mobile) */}
                        <div className="mt-auto p-4 border-t border-white/5 bg-gray-950/80 backdrop-blur-xl sm:rounded-b-2xl">
                            <button 
                                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                                className="w-full py-3.5 text-xs font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 transition-all rounded-xl shadow-xl shadow-emerald-900/40 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                View All Notifications
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
