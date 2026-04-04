import React from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiTrash2, FiUser, FiCalendar, FiDollarSign } from 'react-icons/fi';

const OrderRow = ({ order, onOpenDetails, onDelete }) => {
  const { orderId, customer, date, createdAt, total, status } = order;
  const customerName = typeof customer === 'string' ? customer : customer?.name || "Guest User";
  const customerEmail = customer?.email || "No email provided";
  const formattedDate = new Date(date || createdAt).toLocaleDateString();
  const formattedTime = new Date(date || createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'amber';
      case 'Processing': return 'blue';
      case 'Shipped': return 'indigo';
      case 'Delivered': return 'emerald';
      case 'Cancelled': return 'rose';
      default: return 'slate';
    }
  };

  const color = getStatusColor(status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className="group grid grid-cols-12 items-center bg-slate-900/40 backdrop-blur-xl rounded-[24px] border border-white/5 p-4 mb-4 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300"
    >
      {/* Reference */}
      <div className="col-span-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">REFERENCE</span>
          <span className="text-sm font-black text-emerald-400">
            #{orderId?.slice(-6).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Customer */}
      <div className="col-span-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
            <FiUser size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">{customerName}</span>
            <span className="text-[10px] text-slate-500 truncate">{customerEmail}</span>
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="col-span-2">
        <div className="flex items-center gap-2 text-slate-400">
          <FiCalendar size={14} className="opacity-50" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-300">{formattedDate}</span>
            <span className="text-[10px] opacity-60 font-medium">{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="col-span-2">
        <div className="flex items-center gap-1.5">
          <div className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg">
            <FiDollarSign size={14} />
          </div>
          <span className="text-lg font-black text-white tracking-tight">${total?.toFixed(2)}</span>
        </div>
      </div>

      {/* Status */}
      <div className="col-span-2 flex justify-center">
        <div className={`relative flex items-center gap-2 px-4 py-2 bg-${color}-500/10 rounded-full border border-${color}-500/20`}>
          <div className={`h-1.5 w-1.5 rounded-full bg-${color}-500 animate-pulse shadow-[0_0_8px_rgba(var(--color-${color}),0.5)]`} />
          <span className={`text-[10px] font-black uppercase tracking-widest text-${color}-400`}>
            {status}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="col-span-1 flex justify-end gap-2">
        <button
          onClick={() => onOpenDetails(order)}
          className="p-2.5 bg-slate-800 text-slate-400 hover:text-white hover:bg-emerald-500 rounded-xl transition-all"
          title="Intelligence Data"
        >
          <FiEye size={18} />
        </button>
        <button
          onClick={() => onDelete(order._id)}
          className="p-2.5 bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all"
          title="Purge Record"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default OrderRow;
