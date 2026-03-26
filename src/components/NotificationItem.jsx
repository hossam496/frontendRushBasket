import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Package, User, Bell, Info, CheckCircle2, AlertCircle } from 'lucide-react';

const NotificationItem = ({ notification, onClick }) => {
  const { title, message, type, isRead, createdAt } = notification;

  const getIcon = () => {
    switch (type) {
      case 'order':
      case 'order-status':
        return <Package className="w-5 h-5 text-emerald-400" />;
      case 'registration':
      case 'user':
        return <User className="w-5 h-5 text-blue-400" />;
      case 'system':
        return <Info className="w-5 h-5 text-indigo-400" />;
      case 'admin':
        return <Settings className="w-5 h-5 text-amber-400" />;
      case 'test':
        return <CheckCircle2 className="w-5 h-5 text-gray-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (type) {
      case 'order':
      case 'order-status':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'registration':
      case 'user':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'system':
        return 'bg-indigo-500/10 border-indigo-500/20';
      case 'admin':
        return 'bg-amber-500/10 border-amber-500/20';
      default:
        return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      className={`
        relative p-4 cursor-pointer transition-all duration-200 border-b border-white/5
        ${!isRead ? 'bg-white/5' : 'hover:bg-white/5'}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Icon Container */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
          ${getStatusColor()} backdrop-blur-sm border border-white/10
        `}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className={`text-sm font-semibold truncate ${!isRead ? 'text-white' : 'text-gray-400'}`}>
              {title}
            </h4>
            <span className="text-[10px] whitespace-nowrap text-gray-500 font-medium bg-white/5 px-2 py-0.5 rounded-full">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className={`text-xs leading-relaxed line-clamp-2 ${!isRead ? 'text-gray-200' : 'text-gray-500'}`}>
            {message}
          </p>
        </div>

        {/* Unread Indicator */}
        {!isRead && (
          <div className="absolute top-4 right-1 transform translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationItem;
