import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Package, User, Bell, Info, CheckCircle2,
  AlertCircle, Truck, ShoppingCart, Settings
} from 'lucide-react';

const NotificationItem = ({ notification, onClick }) => {
  const { title, message, type, status, isRead, createdAt } = notification;

  const getIcon = () => {
    switch (type) {
      case 'status':
        return <Truck className="w-5 h-5 text-emerald-600" />;
      case 'order':
        return <ShoppingCart className="w-5 h-5 text-blue-600" />;
      case 'registration':
      case 'user':
        return <User className="w-5 h-5 text-indigo-600" />;
      case 'system':
        return <Info className="w-5 h-5 text-slate-500" />;
      case 'admin':
        return <Settings className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'processing': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'status': return 'bg-emerald-50 border-emerald-100';
      case 'order': return 'bg-blue-50 border-blue-100';
      case 'registration': return 'bg-indigo-50 border-indigo-100';
      default: return 'bg-indigo-50 border-indigo-100';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(79, 70, 229, 0.02)' }}
      className={`
        relative p-4 cursor-pointer transition-all duration-200 border-b border-gray-100
        ${!isRead ? 'bg-indigo-50/30' : 'hover:bg-gray-50'}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Icon Container */}
        <div className={`
          shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center
          ${getTypeColor()} border shadow-sm
        `}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className={`text-sm font-bold truncate ${!isRead ? 'text-gray-900' : 'text-gray-500'}`}>
              {title}
            </h4>
            <span className="text-[10px] whitespace-nowrap text-gray-400 font-bold uppercase tracking-tight">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>

          <p className={`text-[13px] leading-snug line-clamp-2 mb-2 ${!isRead ? 'text-gray-700' : 'text-gray-400'}`}>
            {message}
          </p>

          <div className="flex items-center gap-2">
            {status && (
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border ${getStatusColor()}`}>
                {status}
              </span>
            )}
            <span className="text-[9px] text-indigo-400 uppercase font-black tracking-widest bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100/50">
              {type}
            </span>
          </div>
        </div>

        {/* Unread Indicator */}
        {!isRead && (
          <div className="absolute top-4 right-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></span>
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationItem;
