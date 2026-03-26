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

    const handleToggle = () => setIsOpen(!isOpen);

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
                        className="fixed sm:absolute inset-0 sm:inset-auto sm:right-0 sm:top-full sm:mt-3 w-full sm:w-96 h-full sm:h-auto bg-gray-900/95 sm:bg-gray-900/80 backdrop-blur-xl border-t sm:border border-white/10 sm:rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="sticky top-0 px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/5 z-10 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="sm:hidden -ml-2 p-2 text-gray-400 hover:text-white"
                                >
                                    <Trash2 className="w-5 h-5 rotate-45" /> {/* Close icon helper */}
                                </button>
                                <h3 className="text-sm font-bold text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-500/10"
                                >
                                    Clear All
                                </button>
                                <button className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
                                    className="py-12 px-6 text-center"
                                >
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                        <Bell className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
                                    <p className="text-xs text-gray-600 mt-1">We'll alert you when something happens</p>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 p-3 border-t border-white/5 bg-gray-950/90 backdrop-blur-md">
                            <button 
                                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                                className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all rounded-xl shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                            >
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
