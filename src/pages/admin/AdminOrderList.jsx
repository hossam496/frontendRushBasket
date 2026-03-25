import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import api from '../../services/api';
import {
  FiEye, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiSearch,
  FiCalendar, FiUser, FiMapPin, FiMail, FiPhone, FiClock, FiX,
  FiDownload, FiChevronLeft, FiChevronRight, FiCreditCard, FiActivity
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { adminStyles } from '../../assets/adminDashboardStyles';

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

  const handleOrderDelete = async (orderId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/orders/${orderId}`);
        setOrders(prev => prev.filter(o => o._id !== orderId));
        Swal.fire(
          'Deleted!',
          'Order has been deleted.',
          'success'
        );
      } catch (err) {
        Swal.fire('Error', 'Failed to delete order', 'error');
      }
    }
  };

  const openOrderDetails = useCallback((order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch =
        o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof o.customer === 'string' ? o.customer : o.customer?.name)
          ?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter]);

  const StatusBadge = ({ order }) => {
    let classes = adminStyles.badgeSlate;
    let icon = null;
    let text = order.status;

    if (order.status === 'Cancelled') {
      classes = adminStyles.badgeRose;
      icon = <FiXCircle size={10} className="mr-1" />;
    } else if (order.status === 'Shipped') {
      classes = adminStyles.badgeIndigo;
      icon = <FiTruck size={10} className="mr-1" />;
    } else if (order.paymentStatus === 'Paid') {
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

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <StatCard title="Orders" value={orderStats.all} icon={<FiPackage />} color="indigo" />
          <StatCard title="Pending" value={orderStats.pending} icon={<FiClock />} color="amber" />
          <StatCard title="Processing" value={orderStats.processing} icon={<FiActivity />} color="blue" />
          <StatCard title="Shipped" value={orderStats.shipped} icon={<FiTruck />} color="indigo" />
          <StatCard title="Delivered" value={orderStats.delivered} icon={<FiCheckCircle />} color="emerald" />
        </div>

        {/* Main Card */}
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
              {/* Desktop & Tablet Table */}
              <div className={`${adminStyles.tableWrapper} hidden sm:block`}>
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
                          <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                            {typeof order.customer === 'string' ? order.customer : order.customer?.name || "Guest User"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {order.customer?.email || "Guest Checkout"}
                          </div>
                        </td>
                        <td className={adminStyles.td}>
                          <div className="text-slate-600">{new Date(order.date || order.createdAt).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(order.date || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
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
                          <button
                            onClick={() => handleOrderDelete(order._id)}
                            className={`${adminStyles.actionButton} ${adminStyles.dangerBtn} p-2 ml-2`}
                            title="Delete Order"
                          >
                            <FiX size={18} className="text-rose-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="sm:hidden space-y-4">
                {paginatedOrders.map((order) => (
                  <div
                    key={order._id}
                    className={adminStyles.mobileCard}
                    onClick={() => openOrderDetails(order)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 tracking-wider">
                          #{order.orderId?.slice(-8).toUpperCase()}
                        </span>
                        <div className="font-bold text-slate-900 mt-1">
                          {typeof order.customer === 'string' ? order.customer : order.customer?.name || "Guest"}
                        </div>
                      </div>
                      <StatusBadge order={order} />
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FiCalendar className="opacity-60" />
                        {new Date(order.date || order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xl font-black text-slate-900">
                        ${order.total?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className={adminStyles.paginationContainer}>
                <div className="text-xs font-medium text-slate-500 hidden sm:block">
                  Page <span className="text-slate-900 font-bold">{currentPage}</span> of {totalPages || 1}
                </div>

                <div className="flex items-center gap-2 mx-auto sm:mx-0">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className={adminStyles.pageBtn}
                  >
                    <FiChevronLeft />
                  </button>

                  <div className="flex gap-1">
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

      {/* Modern Responsive Modal */}
      {isModalOpen && selectedOrder && (
        <div className={adminStyles.modalOverlay}>
          <div className={adminStyles.modalContent}>
            {/* Modal Header */}
            <div className={adminStyles.modalHeader}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <FiPackage size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Order Details</h2>
                  <p className="text-xs text-slate-500 font-bold">ID: #{selectedOrder.orderId}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className={adminStyles.modalBody}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer & Financial Info */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Customer Info */}
                  <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Customer</h3>
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                          <FiUser size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">{selectedOrder.customer?.name || "Guest Account"}</div>
                          <div className="text-[10px] text-slate-500 font-bold">{selectedOrder.customer?.email || "No email provided"}</div>
                        </div>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <FiPhone className="text-slate-400" />
                          <span className="font-semibold">{selectedOrder.customer?.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-600">
                          <FiMapPin className="text-slate-400 mt-0.5" />
                          <span className="font-semibold leading-relaxed">{selectedOrder.customer?.address || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Financial Overview */}
                  <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Financial Overview</h3>
                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl">
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold opacity-80">
                          <span>Subtotal</span>
                          <span>${selectedOrder.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold opacity-80">
                          <span>Tax (5%)</span>
                          <span>${selectedOrder.tax?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold opacity-80 pb-3 border-b border-white/20">
                          <span>Shipping</span>
                          <span>${selectedOrder.shipping?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-lg font-black tracking-tighter uppercase">Total</span>
                          <span className="text-2xl font-black tracking-tighter italic">
                            ${selectedOrder.total?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
                        <FiCreditCard className="opacity-60" />
                        <span className="text-[10px] uppercase font-black tracking-widest">{selectedOrder.paymentMethod}</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Status Buttons & Items */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Status Selection */}
                  <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Fulfillment Status</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(selectedOrder._id, status)}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${selectedOrder.status === status
                              ? 'bg-white border-indigo-600 shadow-xl scale-105'
                              : 'bg-white border-slate-100 hover:border-slate-300'
                            }`}
                        >
                          {/* أيقونات الحالة */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${selectedOrder.status === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {status === 'Pending' && <FiClock size={20} />}
                            {status === 'Processing' && <FiActivity size={20} />}
                            {status === 'Shipped' && <FiTruck size={20} />}
                            {status === 'Delivered' && <FiCheckCircle size={20} />}
                            {status === 'Cancelled' && <FiXCircle size={20} />}
                          </div>
                          <span className={`text-xs font-bold ${selectedOrder.status === status ? 'text-indigo-600' : 'text-slate-500'}`}>
                            {status}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Order Items */}
                  <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Order Items</h3>
                    <div className="border border-slate-100 rounded-3xl overflow-hidden bg-white">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className={`flex items-center p-5 ${idx !== selectedOrder.items.length - 1 ? 'border-b border-slate-50' : ''}`}>
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <FiPackage size={20} />
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex-grow">
                            <h4 className="text-sm font-black text-slate-800 tracking-tight">{item.name}</h4>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                              Qty: {item.quantity} × <span className="text-indigo-600">${item.price?.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-slate-900 tracking-tight">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div className={adminStyles.modalFooter}>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`${adminStyles.actionButton} ${adminStyles.primaryBtn} px-10`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default React.memo(AdminOrderList);