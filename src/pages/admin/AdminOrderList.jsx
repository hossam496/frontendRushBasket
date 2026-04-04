import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import {
  FiSearch,
  FiFilter,
  FiShoppingBag,
  FiClock,
  FiTrendingUp,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiLayout,
  FiAlertCircle
} from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import OrderRow from '../../components/admin/OrderRow';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { OrderRowSkeleton } from '../../components/UI/LoadingStates';
import toast from "react-hot-toast";

const AdminOrderList = () => {
  const pollingIntervalRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, orderId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
    pollingIntervalRef.current = setInterval(fetchOrders, 30000);

    const handleOrderUpdate = () => fetchOrders();
    window.addEventListener('orderUpdate', handleOrderUpdate);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      window.removeEventListener('orderUpdate', handleOrderUpdate);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      const sorted = (res.data.data || res.data || []).sort(
        (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
      );
      setOrders(sorted);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Sync failed with neural network');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      toast.success(`Protocol updated to ${newStatus}`);
    } catch (err) {
      toast.error('Status modification rejected');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, orderId: id });
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/api/orders/${deleteModal.orderId}`);
      setOrders(prev => prev.filter(o => o._id !== deleteModal.orderId));
      toast.success('Record purged from database');
      setDeleteModal({ isOpen: false, orderId: null });
    } catch (err) {
      toast.error('Deletion sequence failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const openOrderDetails = useCallback((order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const customerName = typeof o.customer === 'string' ? o.customer : o.customer?.name || "Guest";
      const matchesSearch =
        o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const orderStats = useMemo(() => ({
    all: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    revenue: orders.reduce((acc, curr) => acc + (curr.total || 0), 0).toFixed(2),
  }), [orders]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter]);

  return (
    <AdminLayout title="Operations Ledger">
      {/* Stats Cluster */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <StatCard 
          title="Total Transactions" 
          value={orderStats.all} 
          icon={<FiShoppingBag size={24} />} 
          color="indigo" 
          description="Global order volume"
        />
        <StatCard 
          title="Network Revenue" 
          value={`$${orderStats.revenue}`} 
          icon={<FiTrendingUp size={24} />} 
          color="emerald" 
          description="Combined net worth"
        />
        <StatCard 
          title="Fulfillment Backlog" 
          value={orderStats.pending} 
          icon={<FiClock size={24} />} 
          color="amber" 
          description="Awaiting processing"
        />
      </motion.div>

      {/* Control Station */}
      <div className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
          {/* Neural Search */}
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-emerald-500 transition-colors">
              <FiSearch size={18} className="text-slate-500 group-focus-within:text-emerald-500" />
            </div>
            <input
              type="text"
              placeholder="Search by ID or Customer identity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-14 pr-6 py-5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[24px] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all text-white font-medium placeholder:text-slate-600"
            />
          </div>

          {/* Filtering Nodes */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full">
            {['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  statusFilter === status 
                    ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 translate-y-[-2px]" 
                    : "bg-slate-900/40 backdrop-blur-xl text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <button className="flex items-center justify-center gap-3 px-8 py-5 bg-white/5 border border-white/5 text-slate-300 rounded-[24px] font-black shadow-xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest">
          <FiDownload size={18} /> Export Data
        </button>
      </div>

      {/* Main Ledger Section */}
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: itemsPerPage }).map((_, i) => <OrderRowSkeleton key={i} />)}
          </div>
        ) : filteredOrders.length > 0 ? (
          <>
            <motion.div 
              layout
              className="hidden lg:block"
            >
              <AnimatePresence mode="popLayout">
                {paginatedOrders.map(order => (
                  <OrderRow 
                    key={order._id} 
                    order={order} 
                    onOpenDetails={openOrderDetails} 
                    onDelete={handleDeleteClick} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Mobile Stacked View */}
            <div className="lg:hidden space-y-4">
              {paginatedOrders.map(order => (
                <motion.div
                  layout
                  key={order._id}
                  onClick={() => openOrderDetails(order)}
                  className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-white/5 p-6 active:scale-[0.98] transition-transform"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">#{order.orderId?.slice(-8).toUpperCase()}</span>
                      <span className="text-xl font-black text-white">{typeof order.customer === 'string' ? order.customer : order.customer?.name}</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-t border-white/5 pt-6">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Transaction Total</span>
                        <span className="text-2xl font-black text-white">${order.total?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <FiClock /> {new Date(order.date || order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Grid */}
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Viewing <span className="text-white">{paginatedOrders.length}</span> of {filteredOrders.length} Entries
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="w-14 h-14 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/5 transition-all"
                >
                  <FiChevronLeft size={20} />
                </button>

                <div className="flex gap-2 mx-4">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                        currentPage === i + 1 
                          ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" 
                          : "text-slate-500 hover:text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="w-14 h-14 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/5 transition-all"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-[48px] border border-dashed border-white/10">
            <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center mb-8 text-slate-700">
              <FiAlertCircle size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Zero Results Found</h3>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No records match your current filter parameters</p>
          </div>
        )}
      </div>

      {/* Intelligence Modals */}
      <OrderDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, orderId: null })}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Purge Transaction Record?"
        message="This operation will permanently remove this transaction from the core ledger. This action is non-reversible."
      />
    </AdminLayout>
  );
};

export default React.memo(AdminOrderList);