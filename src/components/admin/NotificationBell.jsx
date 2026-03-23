import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaCircle } from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
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
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
      >
        <FaBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <FaBell className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li 
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      cursor-pointer transition-colors px-4 py-3 hover:bg-gray-50
                      ${!notification.read ? 'bg-blue-50/30' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {!notification.read ? (
                           <FaCircle className="w-2.5 h-2.5 text-blue-500" />
                        ) : (
                           <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="border-t border-gray-100 px-4 py-2 bg-gray-50/50 text-center">
            <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <FaBell className="w-3 h-3"/> Notifications update automatically
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
