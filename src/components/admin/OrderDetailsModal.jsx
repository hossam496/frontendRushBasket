import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiPackage, FiUser, FiMapPin, FiPhone, FiMail, 
  FiClock, FiActivity, FiTruck, FiCheckCircle, FiXCircle,
  FiCreditCard, FiTrendingUp, FiShoppingBag
} from 'react-icons/fi';
import { resolveImageSrc } from '../../services/imageService';

const OrderDetailsModal = ({ isOpen, onClose, order, onStatusChange }) => {
  if (!isOpen || !order) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <FiClock size={22} />;
      case 'Processing': return <FiActivity size={22} />;
      case 'Shipped': return <FiTruck size={22} />;
      case 'Delivered': return <FiCheckCircle size={22} />;
      case 'Cancelled': return <FiXCircle size={22} />;
      default: return <FiPackage size={22} />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-slate-900/80 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/5 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <FiPackage size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                  Intelligent Order Record
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">
                  Transaction Serial: #{order.orderId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all group"
            >
              <FiX size={24} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Metrics & Intelligence */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* Customer Identity */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Customer Identity</h3>
                  <div className="bg-white/5 rounded-[32px] p-6 border border-white/5">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                        <FiUser size={24} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-base font-bold text-white truncate">{order.customer?.name || "Guest Account"}</span>
                        <span className="text-xs text-slate-400 truncate opacity-60">ID: {order.customer?._id?.slice(-8) || "GUEST"}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs">
                        <FiMail className="text-emerald-500" />
                        <span className="font-bold text-slate-300">{order.customer?.email || "No email"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <FiPhone className="text-emerald-500" />
                        <span className="font-bold text-slate-300">{order.customer?.phone || "No phone"}</span>
                      </div>
                      <div className="flex items-start gap-3 text-xs">
                        <FiMapPin className="text-emerald-500 mt-0.5" />
                        <span className="font-bold text-slate-300 leading-relaxed italic">{order.customer?.address || "No address provided"}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Financial Ledger */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Financial Ledger</h3>
                  <div className="bg-emerald-600 rounded-[32px] p-8 text-white shadow-2xl shadow-emerald-900/40 relative overflow-hidden group">
                    <FiTrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center opacity-80 text-[10px] font-black uppercase tracking-widest">
                        <span>Transaction Total</span>
                        <span>$USD</span>
                      </div>
                      <div className="text-5xl font-black tracking-tight leading-none italic mb-4">
                        ${order.total?.toFixed(2)}
                      </div>
                      <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FiCreditCard className="opacity-60" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{order.paymentMethod}</span>
                        </div>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">Paid</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Interaction & Fulfillment */}
              <div className="lg:col-span-8 space-y-10">
                
                {/* Fulfillment Matrix */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Fulfillment Matrix</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                      <motion.button
                        key={status}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onStatusChange(order._id, status)}
                        className={`flex flex-col items-center justify-center p-5 rounded-[24px] border transition-all relative overflow-hidden ${
                          order.status === status
                            ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                            : 'bg-white/5 border-white/5 hover:border-emerald-500/30'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                          order.status === status ? 'bg-white text-emerald-600' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {getStatusIcon(status)}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          order.status === status ? 'text-white' : 'text-slate-400'
                        }`}>
                          {status}
                        </span>
                        {order.status === status && (
                          <motion.div layoutId="status-active" className="absolute bottom-1 w-1 h-1 bg-white rounded-full" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </section>

                {/* Inventory Assets */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Inventory Assets</h3>
                  <div className="bg-white/5 rounded-[40px] border border-white/5 overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className={`flex items-center p-6 ${idx !== order.items.length - 1 ? 'border-b border-white/5' : ''} group/item hover:bg-white/5 transition-colors`}>
                          <div className="w-20 h-20 bg-slate-800 rounded-3xl border border-white/5 overflow-hidden shrink-0 group-hover/item:scale-105 transition-transform duration-500">
                            {resolveImageSrc(item.image || item.imageUrl) ? (
                              <img
                                src={resolveImageSrc(item.image || item.imageUrl)}
                                alt={item.name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100?text=Error'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <FiShoppingBag size={24} />
                              </div>
                            )}
                          </div>
                          <div className="ml-6 grow">
                            <h4 className="text-lg font-black text-white tracking-tight leading-none mb-2">{item.name}</h4>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-2 py-1 rounded">Quantity: {item.quantity}</span>
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">Unit: ${item.price?.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-white tracking-tighter">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Summary Footer In Modal */}
                    <div className="p-8 bg-white/5 border-t border-white/5 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Subtotal</span>
                            <span className="text-sm font-bold text-white">${order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Taxes</span>
                            <span className="text-sm font-bold text-white">${order.tax?.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Shipping</span>
                            <span className="text-sm font-bold text-white">${order.shipping?.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Assets</span>
                            <span className="text-lg font-black text-white">${order.total?.toFixed(2)}</span>
                        </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-10 border-t border-white/5 bg-white/5 flex items-center justify-end gap-6">
            <button
              onClick={onClose}
              className="px-10 py-5 bg-white/5 text-xs font-black uppercase tracking-widest text-slate-300 rounded-3xl hover:bg-white/10 transition-all"
            >
              Close Record
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-12 py-5 bg-emerald-500 text-white rounded-3xl font-black shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all uppercase tracking-widest text-xs"
            >
              Acknowledge Updates
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
