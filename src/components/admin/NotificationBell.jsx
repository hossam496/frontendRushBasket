import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, CheckCircle2, Settings, MoreVertical } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import NotificationItem from '../NotificationItem';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refreshNotifications 
  } = useNotifications();

  const handleToggle = () => {
    if (!isOpen) {
      refreshNotifications();
    }
    setIsOpen(!isOpen);
  };
  const navigate = useNavigate();

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={handleToggle}
        className={`
          relative p-2 rounded-xl transition-all duration-300 group
          ${isOpen ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
        `}
      >
        <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
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
            className="fixed sm:absolute inset-0 sm:inset-auto sm:right-0 sm:top-full sm:mt-3 w-full sm:w-96 h-dvh sm:h-auto bg-white/95 sm:bg-white/80 backdrop-blur-2xl border-t sm:border border-gray-200 sm:rounded-2xl shadow-2xl z-9999 overflow-hidden origin-top-right flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 px-5 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden -ml-2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                >
                  <Bell className="w-5 h-5 rotate-12" />
                </button>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-none">Admin alerts</h3>
                  <p className="text-[10px] text-gray-400 font-medium sm:hidden mt-1">Management dashboard</p>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-indigo-600/20">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-indigo-100"
                  >
                    Clear All
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* List Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 overscroll-contain pb-20 sm:pb-0 sm:max-h-[440px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center h-full">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 border border-gray-100">
                    <Bell className="w-10 h-10 text-gray-200" />
                  </div>
                  <p className="text-base font-bold text-gray-600">All caught up!</p>
                  <p className="text-sm text-gray-400 mt-2 max-w-[200px]">No new admin alerts at the moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => (
                    <NotificationItem 
                      key={notification._id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50/80 backdrop-blur-md">
              <button 
                onClick={() => { setIsOpen(false); navigate('/admin/notifications'); }}
                className="w-full py-3.5 text-xs font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 transition-all rounded-xl shadow-xl shadow-indigo-900/10 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Settings className="w-3.5 h-3.5" />
                View All Activity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
