import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import api from '../../services/api';
import {
  FiEye,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiMail,
  FiPhone,
  FiClock,
  FiX,
  FiFilter,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiActivity
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { adminStyles } from '../../assets/adminDashboardStyles';

/**
 * AdminOrderList Redesign
 * Modern, responsive order tracking with status badges, filters, and detail modal.
 */
const AdminOrderList = () => {
  const pollingIntervalRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    fetchOrders();
    pollingIntervalRef.current = setInterval(fetchOrders, 30000);

    const handleOrderUpdate = (e) => fetchOrders();
    window.addEventListener('orderUpdate', handleOrderUpdate);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      window.removeEventListener('orderUpdate', handleOrderUpdate);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      const sorted = (res.data.data || res.data || []).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      setOrders(sorted);
    } catch (err) {
      console.error('Error fetching orders:', err);
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
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        background: '#ecfdf5',
        color: '#065f46'
      });
    } catch (err) {
      Swal.fire('Error', 'Failed to update order status', 'error');
    }
  };

  const openOrderDetails = useCallback((order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  // Filtering & Stats
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof o.customer === 'string' ? o.customer : o.customer?.name)?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const orderStats = useMemo(() => ({
    all: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  }), [orders]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter]);

  // Status Badge Mapper
  const StatusBadge = ({ order }) => {
    let classes = adminStyles.badgeSlate;
    let icon = null;
    let text = order.status;

    // Logic: Color-code based on User's explicit priority list
    if (order.status === 'Cancelled') {
      classes = adminStyles.badgeRose;
      icon = <FiXCircle size={10} className="mr-1" />;
    } else if (order.status === 'Shipped') {
      classes = adminStyles.badgeIndigo;
      icon = <FiTruck size={10} className="mr-1" />;
    } else if (order.paymentStatus === 'Paid') {
      // User requested "Paid (green)"
      classes = adminStyles.badgeEmerald;
      icon = <FiCheckCircle size={10} className="mr-1" />;
      text = 'Paid';
    } else if (order.status === 'Pending') {
      classes = adminStyles.badgeAmber;
      icon = <FiClock size={10} className="mr-1" />;
    } else {
      classes = adminStyles.badgeSlate;
      icon = <FiActivity size={10} className="mr-1" />;
    }

    return (
      <span className={`${adminStyles.badge} ${classes}`}>
        {icon} {text}
      </span>
    );
  };

  return (
    <AdminLayout title="Order Registry">
      <div className={adminStyles.pageContainer}>
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
          <StatCard title="Orders" value={orderStats.all} icon={<FiPackage />} color="indigo" />
          <StatCard title="Pending" value={orderStats.pending} icon={<FiClock />} color="amber" />
          <StatCard title="Processing" value={orderStats.processing} icon={<FiActivity />} color="blue" />
          <StatCard title="Shipped" value={orderStats.shipped} icon={<FiTruck />} color="indigo" />
          <StatCard title="Delivered" value={orderStats.delivered} icon={<FiCheckCircle />} color="emerald" />
        </div>

        {/* Main Orders Card */}
        <div className={adminStyles.card}>
          <div className={adminStyles.cardHeader}>
            <div>
              <h1 className={adminStyles.headerTitle}>Customer Orders</h1>
              <p className={adminStyles.headerSubtitle}>Monitor and fulfill platform transactions</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className={adminStyles.inputGroup}>
                <FiSearch className={adminStyles.inputIcon} />
                <input 
                  type="text" 
                  placeholder="ID or Customer name..."
                  className={adminStyles.searchField}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select 
                  className={adminStyles.selectField}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                
                <button className={`${adminStyles.actionButton} ${adminStyles.secondaryBtn} px-3`}>
                  <FiDownload />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
             <div className="py-20 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-medium">Loading orders...</p>
             </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
               <FiPackage className="mx-auto w-12 h-12 opacity-20 mb-3" />
               <p>No orders found matching your criteria</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className={`${adminStyles.tableWrapper} hidden md:block`}>
                <table className={adminStyles.table}>
                  <thead>
                    <tr>
                      <th className={adminStyles.th}>Reference</th>
                      <th className={adminStyles.th}>Customer</th>
                      <th className={adminStyles.th}>Date & Time</th>
                      <th className={adminStyles.th}>Revenue</th>
                      <th className={adminStyles.th}>Status</th>
                      <th className={`${adminStyles.th} text-right`}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => (
                      <tr key={order._id} className={adminStyles.tr}>
                        <td className={adminStyles.td}>
                          <span className="font-bold text-indigo-600">#{order.orderId?.slice(-6).toUpperCase()}</span>
                        </td>
                        <td className={adminStyles.td}>
                           <div className="font-semibold text-slate-900 truncate max-w-[150px]">
                              {typeof order.customer === 'string' ? order.customer : order.customer?.name || "Guest User"}
                           </div>
                           <div className="text-[10px] text-slate-400 font-medium tracking-tight">
                              {order.customer?.email || "Guest Checkout"}
                           </div>
                        </td>
                        <td className={adminStyles.td}>
                           <div className="text-slate-600">{new Date(order.date || order.createdAt).toLocaleDateString()}</div>
                           <div className="text-[10px] text-slate-400">{new Date(order.date || order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className={adminStyles.td}>
                           <span className="font-bold text-slate-900">${order.total?.toFixed(2)}</span>
                        </td>
                        <td className={adminStyles.td}>
                           <StatusBadge order={order} />
                        </td>
                        <td className={`${adminStyles.td} text-right`}>
                           <button 
                             onClick={() => openOrderDetails(order)}
                             className={`${adminStyles.actionButton} ${adminStyles.secondaryBtn} p-2`}
                             title="Full Details"
                           >
                             <FiEye size={18} className="text-indigo-600" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-100">
                 {paginatedOrders.map((order) => (
                   <div key={order._id} className={adminStyles.mobileCard} onClick={() => openOrderDetails(order)}>
                      <div className="flex justify-between items-start mb-3">
                         <div>
                            <span className="text-xs font-bold text-indigo-600 tracking-wider">#{order.orderId?.slice(-8).toUpperCase()}</span>
                            <div className="font-bold text-slate-900">{typeof order.customer === 'string' ? order.customer : order.customer?.name || "Guest"}</div>
                         </div>
                         <StatusBadge order={order} />
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                         <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <FiCalendar className="opacity-60" /> {new Date(order.date || order.createdAt).toLocaleDateString()}
                         </div>
                         <div className="text-lg font-black text-slate-900">${order.total?.toFixed(2)}</div>
                      </div>
                   </div>
                 ))}
              </div>

              {/* Pagination */}
              <div className={adminStyles.paginationContainer}>
                 <div className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Page <span className="text-slate-900">{currentPage}</span> of {totalPages || 1}
                 </div>
                 
                 <div className="flex items-center gap-1 ml-auto">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className={adminStyles.pageBtn}
                    >
                      <FiChevronLeft />
                    </button>
                    <div className="flex gap-1 overflow-x-auto max-w-[150px] sm:max-w-none">
                       {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`${adminStyles.pageNumber} ${currentPage === i + 1 ? adminStyles.pageActive : adminStyles.pageInactive}`}
                          >
                            {i + 1}
                          </button>
                       ))}
                    </div>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className={adminStyles.pageBtn}
                    >
                      <FiChevronRight />
                    </button>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modern Order Modal */}
      {isModalOpen && selectedOrder && (
        <div className={adminStyles.modalOverlay}>
          <div className={adminStyles.modalContent}>
            <div className={adminStyles.modalHeader}>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <FiPackage size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Order Details</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">ID: #{selectedOrder.orderId}</p>
                 </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                <FiX size={24} />
              </button>
            </div>

            <div className={adminStyles.modalBody}>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Customer Info Card */}
                  <div className="lg:col-span-1 space-y-6">
                     <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Customer Relation</h3>
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                           <div className="flex flex-col items-center text-center">
                              <div className="w-20 h-20 bg-indigo-600 rounded-4xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100 mb-4">
                                 {(typeof selectedOrder.customer === 'string' ? selectedOrder.customer : selectedOrder.customer?.name)?.charAt(0) || "U"}
                              </div>
                              <h4 className="text-lg font-bold text-slate-900">
                                 {typeof selectedOrder.customer === 'string' ? selectedOrder.customer : selectedOrder.customer?.name || "Guest"}
                              </h4>
                              <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                 <FiMail className="opacity-50" /> {selectedOrder.customer?.email || 'N/A'}
                              </div>
                           </div>

                           <div className="mt-8 pt-8 border-t border-slate-200/50 space-y-4">
                              <div className="flex items-start gap-4">
                                 <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-slate-100 text-indigo-500 shadow-sm shrink-0">
                                    <FiMapPin size={16} />
                                 </div>
                                 <p className="text-sm text-slate-600 leading-relaxed pt-1">
                                    {selectedOrder.customer?.address || 'Pickup from store'}
                                 </p>
                              </div>
                              <div className="flex items-start gap-4">
                                 <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-slate-100 text-indigo-500 shadow-sm shrink-0">
                                    <FiPhone size={16} />
                                 </div>
                                 <p className="text-sm text-slate-600 pt-1">
                                    {selectedOrder.customer?.phone || 'No phone provided'}
                                 </p>
                              </div>
                           </div>
                        </div>
                     </section>

                     <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Financial Overview</h3>
                        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
                           <div className="space-y-3 pb-4 border-b border-indigo-500/50">
                              <div className="flex justify-between text-indigo-100 text-sm">
                                 <span>Net Total</span>
                                 <span>${selectedOrder.subtotal?.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-indigo-100 text-sm">
                                 <span>Tax (5%)</span>
                                 <span>${selectedOrder.tax?.toFixed(2)}</span>
                              </div>
                           </div>
                           <div className="flex justify-between items-center mt-5">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Final Amount</span>
                              <span className="text-3xl font-black tracking-tighter">${selectedOrder.total?.toFixed(2)}</span>
                           </div>
                           <div className="mt-4 flex items-center justify-between text-[10px] bg-white/10 rounded-xl px-3 py-2 border border-white/10">
                              <span className="flex items-center gap-2">
                                 <FiCreditCard size={12}/> {selectedOrder.paymentMethod || "Online"}
                              </span>
                              <span className="font-black uppercase">{selectedOrder.paymentStatus || "PAID"}</span>
                           </div>
                        </div>
                     </section>
                  </div>

                  {/* Order Content & Items */}
                  <div className="lg:col-span-2 space-y-8">
                     <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Fulfillment Status</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                           {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(selectedOrder._id, status)}
                                className={`
                                  flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center group
                                  ${selectedOrder.status === status
                                    ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-50 scale-105 z-10'
                                    : 'bg-white border-slate-100 hover:border-slate-300'
                                  }
                                `}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors
                                   ${selectedOrder.status === status ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}
                                `}>
                                   {status === 'Pending' && <FiClock size={20} />}
                                   {status === 'Processing' && <FiActivity size={20} />}
                                   {status === 'Shipped' && <FiTruck size={20} />}
                                   {status === 'Delivered' && <FiCheckCircle size={20} />}
                                   {status === 'Cancelled' && <FiXCircle size={20} />}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedOrder.status === status ? 'text-indigo-600' : 'text-slate-500'}`}>{status}</span>
                              </button>
                           ))}
                        </div>
                     </section>

                     <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Cart Breakdown</h3>
                        <div className="border border-slate-100 rounded-4xl overflow-hidden bg-white shadow-sm">
                           {selectedOrder.items?.map((item, idx) => (
                              <div key={idx} className={`flex items-center p-5 ${idx !== selectedOrder.items.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50/50 transition-colors`}>
                                 <div className="w-16 h-16 bg-slate-50 rounded-2xl mr-5 overflow-hidden border border-slate-100 p-1 shrink-0">
                                    {item.imageUrl ? (
                                       <img 
                                         src={item.imageUrl.startsWith('http') ? item.imageUrl : `${api.defaults.baseURL}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`} 
                                         className="w-full h-full object-contain" alt={item.name} 
                                       />
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center text-slate-300"><FiPackage /></div>
                                    )}
                                 </div>
                                 <div className="flex-1">
                                    <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                                    <p className="text-xs text-indigo-500 font-bold mt-0.5">${item.price?.toFixed(2)} <span className="text-slate-300 mx-1">×</span> {item.quantity}</p>
                                 </div>
                                 <p className="font-black text-slate-900 tracking-tighter">${(item.price * item.quantity)?.toFixed(2)}</p>
                              </div>
                           ))}
                        </div>
                     </section>
                  </div>
               </div>
            </div>

            <div className={adminStyles.modalFooter}>
               <button onClick={() => setIsModalOpen(false)} className={`${adminStyles.actionButton} ${adminStyles.primaryBtn} px-8 h-12`}>
                 Dismiss Modal
               </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default React.memo(AdminOrderList);
